import { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Homepage from './components/homepage';
import VideoWatcher from './components/videoWatcher';
import './App.css';

function App() {
  const [videos, setVideos] = useState({});
  const [stats, setStats] = useState({});
  const [statsData, setStatsData] = useState({});

  // Fetch list of videos and their stats on initial load
  useEffect(() => {
    fetch("https://ssx-tricky-videos-65fa04296737.herokuapp.com/Videos")
      .then(response => response.json())
      .then(data => {
        let videos = {};
        let stats = {};

        for (let i = 0; i < data.videos.length; i++) {
          let item = data.videos[i];
          let key = item.substring(0, item.indexOf("/"));

          if (item.includes(".mp4")) {
            videos[key] = item;
          } else {
            stats[key] = item;
          }
        }

        setVideos(videos);
        setStats(stats);
      })
      .catch(error => console.error(error));
  }, []);

  // Fetch stats data for each video
  useEffect(() => {
    for (let i = 0; i < Object.keys(stats).length; i++) {
      let key = Object.keys(stats)[i];
      let fileName = stats[key];
      let link = `https://ssx-tricky-videos-65fa04296737.herokuapp.com/api/json/${key}`;

      fetch(link)
        .then(response => response.json())
        .then(data => {

          const averageSpeed = Math.round(Object.values(data.speed) // Get all values (strings)
              .map(value => parseInt(value)) // Convert each string to an integer
              .reduce((sum, value) => sum + value, 0) // Sum the values
              / Object.keys(data.speed).length, 2);

          data.averageSpeed = averageSpeed;

          setStatsData(oldStatsData => ({
            ...oldStatsData, // Keep the existing data
            [key]: data      // Add/update the new data with the correct key
          }));
        })
        .catch(error => console.error(error));
    }
  }, [stats]);

  // Define the router with dynamic route for /watch/:id
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Homepage statsData={statsData} videos={videos} stats={stats} />,
    },
    {
      path: "/watch/:id", // Dynamic route for viewing a specific video
      element: <VideoWatcher statsData={statsData} videos={videos} stats={stats} />,
    }
  ]);

  return (
    <div>
      <RouterProvider router={router} basename="/SSX_Recorder"/>
    </div>
  );
}

export default App;
