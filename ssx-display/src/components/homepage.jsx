import { useState, useEffect } from 'react'

import './homepage.css'

// Example URL: https://ssx-tricky-video-clips.nyc3.cdn.digitaloceanspaces.com/1731282410/1731282410.mp4
// Grab Videos: https://ssx-tricky-videos-65fa04296737.herokuapp.com/Videos

function Homepage() {
  const [videos, setVideos] = useState([]);


  useEffect(() => {
    fetch("https://ssx-tricky-videos-65fa04296737.herokuapp.com/Videos")
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error(error));
  }, []);
 
  return (
    <div>
        <h3>Homepage</h3>
    </div>
  )
}

export default Homepage
