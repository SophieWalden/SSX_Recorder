import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import './App.css'

import Homepage from './components/homepage';
import VideoWatcher from './components/videoWatcher';

// Example URL: https://ssx-tricky-video-clips.nyc3.cdn.digitaloceanspaces.com/1731282410/1731282410.mp4
// Grab Videos: https://ssx-tricky-videos-65fa04296737.herokuapp.com/Videos

function App() {
  const [videos, setVideos] = useState({});
  const [stats, setStats] = useState({});
  const [statsData, setStatsData] = useState({});

  useEffect(() => {
    fetch("https://ssx-tricky-videos-65fa04296737.herokuapp.com/Videos")
        .then(response => response.json())
        .then(data => {

          let videos = {};
          let stats = {};

          for (let i = 0; i < data.videos.length; i++){
            let item = data.videos[i];
            let key = item.substring(0,item.indexOf("/"))
    
            if (item.includes(".mp4")){
              videos[key] = item;
            }else{
              stats[key] = item;
            }
          }

          setVideos(videos);
          setStats(stats);
        })
        .catch(error => console.error(error));
  }, []);

  useEffect(() => {
    for (let i = 0; i < Object.keys(stats).length; i++){
      let key = Object.keys(stats)[i];
      let fileName = stats[key];
      let link = `https://ssx-tricky-video-clips.nyc3.cdn.digitaloceanspaces.com/${fileName}`
      
      fetch(link)
      .then(response => response.json())
        .then(data => {
          
          statsData[key] = data;
          
        })
        .catch(error => console.error(error));

    }

    console.log(statsData)

  }, [stats])

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Homepage videos={videos} stats={stats}></Homepage>,
    },
    {
      path: "/watch",
      element: <VideoWatcher videos={videos} stats={stats}></VideoWatcher>
    }
  ]);

 
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  )
}

export default App
