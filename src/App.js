import React from 'react';
import { Counter } from './features/counter/Counter';
import { History } from './features/history/History';
import './App.css';

function App() {
  return (
    <div className="container">
      <h1 style={{ textAlign: 'center', color: '#333' }}>Redux Learning Project</h1>
      
      <div className="info-box">
        <h3>How Redux Works Here</h3>
        <ul>
          <li><strong>Store:</strong> Single source of truth holding all app state</li>
          <li><strong>Actions:</strong> Plain objects describing what happened (e.g., {'{type: "increment"}'})</li>
          <li><strong>Reducers:</strong> Pure functions that take current state + action, return new state</li>
          <li><strong>Dispatch:</strong> Sends actions to the store to trigger state updates</li>
          <li><strong>Selectors:</strong> Extract data from store state for components</li>
        </ul>
      </div>

      <Counter />
      <History />
    </div>
  );
}

export default App;