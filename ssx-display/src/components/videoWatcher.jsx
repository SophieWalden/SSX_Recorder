import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './VideoWatcher.css';
import Chart from 'chart.js/auto';
import { Link } from 'react-router-dom';

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

const VideoWatcher = ({ statsData, videos }) => {
  const { id } = useParams();
  const [videoUrl, setVideoUrl] = useState('');
  const [videoStats, setVideoStats] = useState(null);
  const [graphData, setGraphData] = useState([]);
  const [graphLabels, setGraphLabels] = useState([]);
  const [graphSpeeds, setGraphSpeeds] = useState([]);

  useEffect(() => {

    if (id != null && Object.keys(statsData).length != 0 && Object.keys(statsData).includes(encodeURIComponent(id))) {
      let videoUrl = `${id.split("/").slice(0, 3).join("/")}/run.mp4`;
      setVideoUrl(videoUrl);
      
      let castedId = encodeURIComponent(id);
      console.log(statsData, castedId);
      setVideoStats(statsData[castedId]);

      const speedData = Object.keys(statsData[castedId].speed).map(key => ({
        time: parseInt(key),
        speed: parseInt(statsData[castedId].speed[key]),
      }));

      setGraphData(speedData);
    }
  }, [id, videos, statsData]);

  // Extracting the necessary info from videoStats
  const { startedTime, deaths, averageSpeed } = videoStats || {};
  const endTime = videoStats?.endTime;
  const duration = endTime - startedTime;
  const firstDeath = deaths && deaths.length > 0 ? formatTime(deaths[0] - startedTime) : 'No deaths recorded';
  const formattedDuration = formatTime(duration);

  useEffect(() => {
    if (graphData.length > 0 && videoStats) {
      setGraphLabels(graphData.map(item => formatTime(item.time - videoStats.startedTime)));
      setGraphSpeeds(graphData.map(item => item.speed));
    }
  }, [graphData, videoStats]);

  useEffect(() => {
    if (graphLabels.length > 0 && graphSpeeds.length > 0) {
      // Get the canvas element
      const ctx = document.getElementById('speedGraph').getContext('2d');
      
      // Destroy the previous chart instance if it exists
      const existingChart = Chart.getChart('speedGraph'); // Check if chart with ID exists
      if (existingChart) {
        existingChart.destroy();
      }

      // Create a new chart
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: graphLabels,
          datasets: [{
            label: 'Speed (km/h)',
            data: graphSpeeds,
            tension: 0.1,
            fill: false,
            borderColor: '#FFFFFF',  // Line color (customize as needed)
            backgroundColor: '#FFFFFF',  // Background color for the points (optional)
            pointRadius: 3,  // Size of the point markers
            pointHoverBackgroundColor: '#F4B400',  // Color on hover
            pointHoverRadius: 7,  // Size of point marker on hover
            borderWidth: 2,
          }],
        },
        options: {
          scales: {
            x: {
              title: {
                display: true,
                text: 'Time (minutes:seconds)',
                color: '#ffffff',  // X-axis title color
                font: {
                  size: 16, // You can adjust the font size if needed
                  family: 'Arial, sans-serif' // Font family for axis titles
                }
              },
              ticks: {
                color: '#ffffff',  // X-axis label color
              },
              grid: {
                color: '#888888',  // Grid line color (optional)
                borderColor: '#888888'  // Border color of the grid (optional)
              },
            },
            y: {
              title: {
                display: true,
                text: 'Speed (km/h)',
                color: '#ffffff',  // Y-axis title color
                font: {
                  size: 16,  // You can adjust the font size if needed
                  family: 'Arial, sans-serif' // Font family for axis titles
                }
              },
              ticks: {
                color: '#ffffff',  // Y-axis label color
              },
              grid: {
                color: '#555555',  // Grid line color (optional)
                borderColor: '#555555'  // Border color of the grid (optional)
              },
            },
          },
          plugins: {
            legend: {
              labels: {
                color: '#ffffff',  // Font color of the legend
                font: {
                  size: 16,
                  family: 'Arial, sans-serif'
                }
              }
            }
          }
        },
      });
    }
  }, [graphLabels, graphSpeeds]);

  if (!videoUrl || !videoStats) {
    return <div className="loading-message">Loading...</div>;
  }

  return (
    <div id="video-watcher-content">
      <div className="stats-container">
        <video controls autoPlay src={`https://ssx-tricky-video-clips.nyc3.cdn.digitaloceanspaces.com/${videoUrl}`} type="video/mp4">
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="watcher-right-content">
        <Link className="homepage-select-link" to={`/`}>
          <h3 className="button-30 homepage-button">Go back to Video Select</h3>
        </Link>
        <div className="sidebar">
          <p><strong>Date:</strong> {new Date(Number(id.split("/").slice(2,3)[0]) * 1000).toLocaleString()}</p>
          <p><strong>Duration:</strong> {formattedDuration}</p>
          <p><strong>First Death at:</strong> {firstDeath}</p>
          <p><strong>Average Speed:</strong> {averageSpeed} km/h</p>
        </div>
        <div className="speed-graph">
          <canvas id="speedGraph" width="400" height="200"></canvas>
        </div>
      </div>
    </div>
  );
};

export default VideoWatcher;
