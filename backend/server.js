const express = require('express');
const multer = require('multer');
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

const accessKey = process.env.DO_SPACES_ACCESS_KEY;
const secretKey = process.env.DO_SPACES_SECRET_KEY;

app.use(cors({
    origin: 'http://localhost:5173' // replace with your React app URL
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

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });