const express = require('express');
const multer = require('multer');
const { S3Client, ListObjectsV2Command, PutObjectCommand, GetObjectCommand, DeleteObjectCommand  } = require('@aws-sdk/client-s3');
require('dotenv').config();
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3001;

const accessKey = process.env.DO_SPACES_ACCESS_KEY;
const secretKey = process.env.DO_SPACES_SECRET_KEY;

app.use(cors({
    origin: ['https://sophiewalden.github.io', 'http://localhost:5173'] 
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


app.get('/videos', async (req, res) => {
  try {
    const data = await s3Client.send(new ListObjectsV2Command({ Bucket: 'ssx-tricky-video-clips' }));

    // Ensure Contents is not undefined and is an array
    const videoKeys = (data.Contents || []).map(item => item.Key);

    res.json({ success: true, videos: videoKeys });
  } catch (error) {
    console.error('Error fetching video list:', error);
    res.status(500).json({ success: false, message: 'Error fetching video list', error: error.message });
  }
});

  app.get('/api/json/:filename', async (req, res) => {
    let { filename } = req.params; 
    const decodedFilename = decodeURIComponent(filename); // Decode the original file path
  
    const filePath = `${decodedFilename}`; // File path in your DigitalOcean Space
    try {
      const command = new GetObjectCommand({
        Bucket: 'ssx-tricky-video-clips',
        Key: filePath,
      });
  
      const data = await s3Client.send(command);
      let fileContents = '';
      data.Body.on('data', chunk => {
        fileContents += chunk;
      });
      data.Body.on('end', () => {
        try {
          res.json(JSON.parse(fileContents));
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