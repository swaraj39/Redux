import React from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { clearHistory } from '../history/historySlice';

export function History() {
  const actions = useAppSelector((state) => state.history.actions);
  const dispatch = useAppDispatch();

  const handleClearHistory = () => {
    dispatch(clearHistory());
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Action History</h2>
        {actions.length > 0 && (
          <button className="btn-danger" onClick={handleClearHistory} style={{ padding: '6px 12px', fontSize: '14px' }}>
            Clear History
          </button>
        )}
      </div>
      
      {actions.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#999' }}>No actions yet. Try the counter buttons!</p>
      ) : (
        <div className="history-list">
          {actions.map((action, index) => (
            <div key={index} className="history-item">
              <span className="history-action">{action.type}</span>
              <span>{action.value}</span>
              <span className="history-timestamp">{action.timestamp}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}