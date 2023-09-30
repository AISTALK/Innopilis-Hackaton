import React, { useState, useEffect } from 'react';
import ReactDiffViewer from 'react-diff-viewer';
import './App.css';

function App() {
  const [diffs, setDiffs] = useState([]);
  const [showAllLines, setShowAllLines] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/get-diff/4')
      .then(response => response.json())
      .then(data => setDiffs(data))
      .catch(error => console.error("Error fetching diffs:", error));
  }, []);

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
