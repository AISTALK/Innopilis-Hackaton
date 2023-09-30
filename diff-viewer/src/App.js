import React, { useState, useEffect, useCallback } from 'react';
import ReactDiffViewer from 'react-diff-viewer';
import './App.css';

function App() {
    const [diffs, setDiffs] = useState([]);
    const [showAllLines, setShowAllLines] = useState(false);
    const [splitView, setSplitView] = useState(true);
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

    const handleScroll = useCallback(() => {
        console.log("Scrolling...");

        if (window.innerHeight + document.documentElement.scrollTop < document.documentElement.offsetHeight - 10) return;

        console.log('Near the bottom! Fetching more diffs...');
        setOffset(prevOffset => prevOffset + count);
    }, []);

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

    const resetDiffs = () => {
        setDiffs([]);
        setOffset(0);
        // Reset any other related states if necessary
    };

    const handleCommitChange = (e, type) => {
        resetDiffs();

        if (type === 'base') {
            setBaseCommit(e.target.value);
        } else if (type === 'compare') {
            setCompareCommit(e.target.value);
        }
    };

    return (
        <div className="App">
            <div>
                <select value={baseCommit} onChange={e => handleCommitChange(e, 'base')}>
                    <option value="">Choose base commit</option>
                    {commits.map(commit => <option key={commit.hex} value={commit.hex}>{commit.message}</option>)}
                </select>
                <select value={compareCommit} onChange={e => handleCommitChange(e, 'compare')}>
                    <option value="">Choose comparison commit</option>
                    {commits.map(commit => <option key={commit.hex} value={commit.hex}>{commit.message}</option>)}
                </select>
            </div>
            <div>
                <button onClick={() => setShowAllLines(prev => !prev)}>
                    {showAllLines ? 'Hide Unchanged Lines' : 'Show All Lines'}
                </button>
                <button onClick={() => setSplitView(prev => !prev)}>
                    {splitView ? 'Unified View' : 'Split View'}
                </button>
            </div>
            {diffs.map((diff, index) => {
                const oldString = diff.oldFileContent || "";
                const newString = diff.newFileContent || "";

                return (
                    <div key={index} style={{ marginBottom: '20px' }}>
                        <h2>{diff.file}</h2>
                        <h4>{diff.author}</h4>

                        <p>
                            <span style={{ color: 'green' }}>+{diff.addedLines}</span> added
                            &nbsp;&middot;&nbsp;
                            <span style={{ color: 'red' }}>-{diff.deletedLines}</span> deleted
                        </p>
                        <ReactDiffViewer
                            oldValue={oldString}
                            newValue={newString}
                            splitView={splitView}
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
