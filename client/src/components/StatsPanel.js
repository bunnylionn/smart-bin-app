import React from 'react';
import './StatsPanel.css';

function StatsPanel({ stats }) {
  return (
    <div className="stats-panel">
      <div className="stat-card">
        <div className="stat-icon">📊</div>
        <div className="stat-content">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Bins</div>
        </div>
      </div>
      <div className="stat-card full">
        <div className="stat-icon">⚠️</div>
        <div className="stat-content">
          <div className="stat-value">{stats.full}</div>
          <div className="stat-label">Full Bins</div>
        </div>
      </div>
      <div className="stat-card available">
        <div className="stat-icon">✅</div>
        <div className="stat-content">
          <div className="stat-value">{stats.available}</div>
          <div className="stat-label">Available</div>
        </div>
      </div>
    </div>
  );
}

export default StatsPanel;

