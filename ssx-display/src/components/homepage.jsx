import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './homepage.css';

function Homepage(props) {
    const [sortOption, setSortOption] = useState('averageSpeed');
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [sortedStats, setSortedStats] = useState([]);
    const [filteredLevels, setFilteredLevels] = useState([]);

    const levels = [
        "alaska", "aloha", "garibaldi", "snowdream",
        "elysium", "mesablanca", "merqury", "tokyo"
    ];

    useEffect(() => {
        const levelsWithSubmissions = levels.filter(level =>
            Object.values(props.statsData).some(stat => stat.trackName === level)
        );
        setFilteredLevels(levelsWithSubmissions);
    }, [props.statsData]);

    useEffect(() => {
        const sorted = [...Object.entries(props.statsData)].sort((a, b) => {
            const statA = a[1];
            const statB = b[1];
            if (sortOption === 'averageSpeed') {
                return (statA.endTime - statA.startedTime) - (statB.endTime - statB.startedTime);
            } else if (sortOption === 'deaths') {
                return statA.deaths.length - statB.deaths.length;
            }
            return 0;
        });
        setSortedStats(sorted);
    }, [props.statsData, sortOption]);

    const handleLevelSelection = (level) => {
        setSelectedLevel(level);
        setSortOption('averageSpeed');
    };

    return (
        <div id="homepage-content">
            <h1 className="page-title">SSX Tricky Leaderboards</h1>

            <div className="main-content">
                {/* Left Side: Level Selector */}
                <div className="level-selector">
                    <h2>Select a Level</h2>
                    <div className="level-buttons">
                        {filteredLevels.map(level => (
                            <button
                                key={level}
                                className={`level-button ${selectedLevel === level ? 'active' : ''}`}
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

                {/* Right Side: Attempt List */}
                <div className="attempts-container">
                    {selectedLevel && (
                        <>
                            <div className="sort-options">
                                <button
                                    className={`sort-button ${sortOption === 'averageSpeed' ? 'active' : ''}`}
                                    onClick={() => setSortOption('averageSpeed')}
                                >
                                    Sort by Time
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
                                                    <h3 className="attempt-title">{new Date(Number(decodeURIComponent(key).split("/").slice(2,3)[0]) * 1000).toLocaleString()}, {value.endTime - value.startedTime}s</h3>
                                                    <p className="attempt-info">
                                                        Deaths: {value.deaths.length} | Avg Speed: {value.averageSpeed} km/h
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
            </div>
        </div>
    );
}

export default Homepage;
