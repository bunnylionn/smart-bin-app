import React from 'react';
import './Header.css';

function Header({ isConnected, lastUpdate }) {
  const formatTime = (date) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1>🗑️ Smart Bin Monitor</h1>
          <p className="subtitle">Real-time Garbage Collection Monitoring</p>
        </div>
        <div className="header-right">
          <div className="status-indicator">
            <div className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></div>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          {lastUpdate && (
            <div className="last-update">
              Last update: {formatTime(lastUpdate)}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;

