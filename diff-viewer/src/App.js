import React, { useState, useEffect } from 'react';
import ReactDiffViewer from 'react-diff-viewer';
import './App.css';

function App() {
  const [diffs, setDiffs] = useState([]);
  const [loadedDiffs, setLoadedDiffs] = useState(0);
  const [hasMoreDiffs, setHasMoreDiffs] = useState(true);
  const [showAllLines, setShowAllLines] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchedDiffsSet, setFetchedDiffsSet] = useState(new Set());

  const fetchDiffs = (offset, count) => {
    setIsFetching(true);
    fetch(`http://localhost:5000/api/get-diff/${offset}/${count}`)
      .then(response => response.json())
      .then(data => {
        if (data.length > 0) {
          const uniqueDiffs = data.filter(newData => {
            const uniqueId = `${newData.hex}-${newData.file}`;
            if (fetchedDiffsSet.has(uniqueId)) {
              return false;
            } else {
              fetchedDiffsSet.add(uniqueId);
              return true;
            }
          });

          setFetchedDiffsSet(prev => new Set([...prev, ...uniqueDiffs.map(diff => `${diff.hex}-${diff.file}`)]));
          setDiffs(prevDiffs => [...prevDiffs, ...uniqueDiffs]);
          setLoadedDiffs(prev => prev + uniqueDiffs.length);
        } else {
          setHasMoreDiffs(false);
        }
        setIsFetching(false);
      })
      .catch(error => {
        console.error("Error fetching diffs:", error);
        setIsFetching(false);
      });
  }

  const handleScroll = () => {
    if (!isFetching && hasMoreDiffs && (window.innerHeight + document.documentElement.scrollTop > document.documentElement.offsetHeight - 200)) {
      fetchDiffs(loadedDiffs, 3);
    }
  }

  useEffect(() => {
    fetchDiffs(0, 3);  // Initial fetch
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadedDiffs, isFetching, hasMoreDiffs]);

  console.log("Current value of showAllLines:", showAllLines);

  return (
    <div key={showAllLines ? "show" : "hide"} className="App">
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
