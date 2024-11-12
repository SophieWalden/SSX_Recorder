import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import './homepage.css';

function Homepage(props) {
    const [sortOption, setSortOption] = useState('averageSpeed'); // Default sort by average speed
    const [selectedLevel, setSelectedLevel] = useState(null); // To track selected level
    const [sortedStats, setSortedStats] = useState([]);
    const [filteredLevels, setFilteredLevels] = useState([]);

    const levels = [
        "alaska",
        "aloha",
        "garibaldi",
        "snowdream",
        "elysium",
        "mesablanca",
        "merqury",
        "tokyo",
    ];

    useEffect(() => {
        // Filter levels to only show those with submissions
        const levelsWithSubmissions = levels.filter(level =>
            Object.values(props.statsData).some(stat => stat.trackName === level)
        );
        setFilteredLevels(levelsWithSubmissions);
    }, [props.statsData]);

    useEffect(() => {
        // Sort the stats based on the selected option
        const sorted = [...Object.entries(props.statsData)].sort((a, b) => {
            const statA = a[1];
            const statB = b[1];
            if (sortOption === 'averageSpeed') {
                return statB.averageSpeed - statA.averageSpeed; // Descending order by speed
            } else if (sortOption === 'deaths') {
                return statA.deaths.length - statB.deaths.length; // Ascending order by death count
            }
            return 0;
        });
        setSortedStats(sorted);
    }, [props.statsData, sortOption]);

    const handleLevelSelection = (level) => {
        setSelectedLevel(level); // Set the selected level
        setSortOption('averageSpeed'); // Reset to sorting by speed when selecting a new level
    };

    return (
        <div id="homepage-content">
            <h1 className="page-title">SSX Tricky Leaderboards</h1>

            <div className="level-selector">
                <h2>Select a Level</h2>
                <div className="level-buttons">
                    {filteredLevels.map(level => (
                        <button
                            key={level}
                            className="level-button"
                            onClick={() => handleLevelSelection(level)}
                        >
                            {level.charAt(0).toUpperCase() + level.slice(1)} (
                            {
                                Object.values(props.statsData).filter(
                                    stat => stat.trackName === level
                                ).length
                            })
                        </button>
                    ))}
                </div>
            </div>

            {selectedLevel && (
                <>
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
                        {sortedStats
                            .filter(([_, value]) => value.trackName === selectedLevel)
                            .map(([key, value]) => (
                                <div key={key} className="attempt-item">
                                    <Link to={`/watch/${encodeURIComponent(key)}`} className="attempt-link">
                                        <div className="attempt-details">
                                            <h3 className="attempt-title">{new Date(Number(decodeURIComponent(key).split("/").slice(2,3)[0]) * 1000).toLocaleString()}</h3>
                                            <p className="attempt-info">
                                                Time: {value.endTime - value.startedTime}s | Deaths: {value.deaths.length} | Avg Speed: {value.averageSpeed} km/h
                                            </p>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                    </div>

                    {sortedStats.filter(([_, value]) => value.trackName === selectedLevel).length === 0 && (
                        <p className="no-attempts">No attempts for this level yet!</p>
                    )}
                </>
            )}
        </div>
    );
}

export default Homepage;
