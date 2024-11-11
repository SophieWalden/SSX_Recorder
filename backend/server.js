const express = require('express');
const multer = require('multer');
const { S3Client, ListObjectsV2Command, GetObjectCommand  } = require('@aws-sdk/client-s3');
require('dotenv').config();
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3001;

const accessKey = process.env.DO_SPACES_ACCESS_KEY;
const secretKey = process.env.DO_SPACES_SECRET_KEY;

app.use(cors({
    origin: 'https://sophiewalden.github.io' // replace with your React app URL
    ,methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  }));

const s3Client = new S3Client({
    region: 'nyc3',  // Your region
    endpoint: 'https://nyc3.digitaloceanspaces.com',
    credentials: {
      accessKeyId: process.env.DO_SPACES_ACCESS_KEY,
      secretAccessKey: process.env.DO_SPACES_SECRET_KEY
    }
  });

const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('video'), async (req, res) => {
    try {
      // Get the uploaded file from req.file
      const file = req.file;
  
      // Create the params for uploading to the DigitalOcean Space
      const uploadParams = {
        Bucket: 'ssx-tricky-video-clips',
        Key: `videos/${file.filename}`, // Key is the path where the file will be saved in the Space
        Body: file.buffer, // The content of the uploaded file
        ContentType: file.mimetype, // Mime type of the file (e.g., video/mp4)
        ACL: 'public-read', // Make the file publicly accessible
      };
  
      // Send the upload request
      const data = await s3Client.send(new PutObjectCommand(uploadParams));
      
      res.json({ success: true, message: 'File uploaded successfully!', data });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ success: false, message: 'Error uploading file', error: error.message });
    }
  });

  app.get('/videos', async (req, res) => {
    try {
      const data = await s3Client.send(new ListObjectsV2Command({ Bucket: 'ssx-tricky-video-clips' }));
      
      // Only return the file keys (paths)
      const videoKeys = data.Contents.map(item => item.Key);
  
      res.json({ success: true, videos: videoKeys });
    } catch (error) {
      console.error('Error fetching video list:', error);
      res.status(500).json({ success: false, message: 'Error fetching video list', error: error.message });
    }
  });

  app.get('/api/json/:filename', async (req, res) => {
    let { filename } = req.params; // Extract filename from the URL parameter
    const filePath = `${filename}/stats.json`; // File path in your DigitalOcean Space
  
    try {
      // Fetch the stats.json file from DigitalOcean Space
      const command = new GetObjectCommand({
        Bucket: 'ssx-tricky-video-clips',  // Your Space name
        Key: filePath,  // Path to the file in the Space
      });
  
      const data = await s3Client.send(command);
      
      // Read the body of the response stream
      let fileContents = '';
      data.Body.on('data', chunk => {
        fileContents += chunk;
      });
      
      // Once the entire file is read, send the JSON response
      data.Body.on('end', () => {
        try {
          res.json(JSON.parse(fileContents));  // Return the JSON contents
        } catch (error) {
          res.status(500).json({ message: 'Error parsing JSON' });
        }
      });
  
    } catch (error) {
      console.error('Error fetching JSON file:', error);
      res.status(500).json({ message: 'Error fetching JSON file', error: error.message });
    }
  });

app.listen(port, () => {
console.log(`Server is running on port ${port}`);
});