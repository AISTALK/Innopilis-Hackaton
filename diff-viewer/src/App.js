import React, { useState, useEffect, useCallback } from 'react';
import ReactDiffViewer from 'react-diff-viewer';
import './App.css';

function App() {
    const [diffs, setDiffs] = useState([]);
    const [showAllLines, setShowAllLines] = useState(false);
    const [commits, setCommits] = useState([]);
    const [baseCommit, setBaseCommit] = useState('');
    const [compareCommit, setCompareCommit] = useState('');
    const [offset, setOffset] = useState(0);
    const count = 10;

    useEffect(() => {
        fetch('http://localhost:5000/api/get-commits')
            .then(response => response.json())
            .then(data => setCommits(data))
            .catch(error => console.error("Error fetching commits:", error));
    }, []);

    const handleScroll = () => {
        console.log("Scrolling...");

        // Check if we've scrolled to near the bottom of the container
        if (window.innerHeight + document.documentElement.scrollTop < document.documentElement.offsetHeight - 10) return;

        console.log('Near the bottom! Fetching more diffs...');
        setOffset(prevOffset => prevOffset + count);
    };

    useEffect(() => {
        if(baseCommit && compareCommit) {
            fetch(`http://localhost:5000/api/get-diff-between/${baseCommit}/${compareCommit}?offset=${offset}&count=${count}`)
                .then(response => response.json())
                .then(data => {
                    setDiffs(prevDiffs => [...prevDiffs, ...data]);
                })
                .catch(error => console.error("Error fetching diffs between commits:", error));
        }
    }, [baseCommit, compareCommit, offset]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]);

    return (
        <div className="App">
            <div>
                <select value={baseCommit} onChange={e => setBaseCommit(e.target.value)}>
                    <option value="">Choose base commit</option>
                    {commits.map(commit => <option key={commit.hex} value={commit.hex}>{commit.message}</option>)}
                </select>
                <select value={compareCommit} onChange={e => setCompareCommit(e.target.value)}>
                    <option value="">Choose comparison commit</option>
                    {commits.map(commit => <option key={commit.hex} value={commit.hex}>{commit.message}</option>)}
                </select>
            </div>
            <button onClick={() => setShowAllLines(prev => !prev)}>
                {showAllLines ? 'Hide Unchanged Lines' : 'Show All Lines'}
            </button>
            {diffs.map((diff, index) => {
                const oldString = diff.oldFileContent || "";
                const newString = diff.newFileContent || "";

                return (
                    <div key={index} style={{ marginBottom: '20px' }}>
                        <h2>{diff.file}</h2>
                        <ReactDiffViewer
                            oldValue={oldString}
                            newValue={newString}
                            splitView={true}
                            disableWordDiff={true}
                            useDarkTheme={false}
                            showDiffOnly={!showAllLines}
                            hideUnchanged={!showAllLines}
                            surroundingLines={showAllLines ? undefined : 3}
                        />
                    </div>
                );
            })}
        </div>
    );
}

export default App;
