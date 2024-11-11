import { useState } from 'react'
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
  const [videos, setVideos] = useState([]);

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Homepage></Homepage>,
    },
    {
      path: "/watch",
      element: <VideoWatcher></VideoWatcher>
    }
  ]);

 
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  )
}

export default App
