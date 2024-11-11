import { useState } from 'react'

import './videoWatcher.css'

// Example URL: https://ssx-tricky-video-clips.nyc3.cdn.digitaloceanspaces.com/1731282410/1731282410.mp4
// Grab Videos: https://ssx-tricky-videos-65fa04296737.herokuapp.com/Videos

function VideoWatcher() {

 
  return (
    <div>
       <video
        className="display-video"
        src="https://ssx-tricky-video-clips.nyc3.cdn.digitaloceanspaces.com/1731282410/1731282410.mp4"
        controls
        autoPlay
      >
        Your browser does not support the video tag.
      </video>
    </div>
  )
}

export default VideoWatcher
