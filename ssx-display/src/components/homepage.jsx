import { useState, useEffect } from 'react'

import './homepage.css'

// Example URL: https://ssx-tricky-video-clips.nyc3.cdn.digitaloceanspaces.com/1731282410/1731282410.mp4
// Grab Videos: https://ssx-tricky-videos-65fa04296737.herokuapp.com/Videos

function Homepage(props) {

 
  return (
    <div id="homepage-content">
        <h1>SSX Tricky Replay Watchpage</h1>

        {Object.entries(props.stats).map(([key, value]) => (
        <div key={key}>
            <h3 className={"displayOptions"}>{key}</h3>
        </div>
        ))}
    </div>
  )
}

export default Homepage
