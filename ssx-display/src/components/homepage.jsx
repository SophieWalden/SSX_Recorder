import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';

import './homepage.css'

// Example URL: https://ssx-tricky-video-clips.nyc3.cdn.digitaloceanspaces.com/1731282410/1731282410.mp4
// Grab Videos: https://ssx-tricky-videos-65fa04296737.herokuapp.com/Videos

function Homepage(props) {
    const [sortOption, setSortOption] = useState('averageSpeed'); // Default sort by average speed
    const [sortedStats, setSortedStats] = useState([]);
  
    useEffect(() => {
      // Sort the stats based on the selected option
      const sorted = [...Object.entries(props.statsData)].sort((a, b) => {
        const statA = a[1];
        const statB = b[1];
        if (sortOption === 'averageSpeed') {
          return statB.averageSpeed - statA.averageSpeed; // Descending order by speed
        } else if (sortOption === 'deaths') {
          return statA.deaths.length - statB.deaths.length; // Descending order by death count
        }
        return 0;
      });
      setSortedStats(sorted);
    }, [props.statsData, sortOption]);
  
    return (
      <div id="homepage-content">
        <h1 className="page-title">SSX Tricky Replays</h1>
  
        <div className="sort-options">
          <button 
            className={`sort-button ${sortOption === 'averageSpeed' ? 'active' : ''}`}
            onClick={() => setSortOption('averageSpeed')}
          >
            Sort by Average Speed
          </button>
          <button 
            className={`sort-button ${sortOption === 'deaths' ? 'active' : ''}`}
            onClick={() => setSortOption('deaths')}
          >
            Sort by Deaths
          </button>
        </div>
  
        <div className="attempt-list">
          {sortedStats.map(([key, value]) => (
            <div key={key} className="attempt-item">
              <Link to={`/watch/${key}`} className="attempt-link">
                <div className="attempt-details">
                  <h3 className="attempt-title">{new Date(Number(key) * 1000).toLocaleString()}</h3>
                  <p className="attempt-info">
                    Time: {value.endTime - value.startedTime}s | Deaths: {value.deaths.length} | Avg Speed: {value.averageSpeed} km/h
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  export default Homepage;