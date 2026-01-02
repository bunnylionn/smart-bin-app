import React from 'react';
import './BinCard.css';

function BinCard({ bin }) {
  const isFull = bin.status === 'FULL';
  const fillPercentage = Math.max(0, Math.min(100, ((20 - bin.distance) / 20) * 100));
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`bin-card ${isFull ? 'full' : 'available'}`}>
      <div className="bin-card-header">
        <div className="bin-id">
          <span className="bin-icon">🗑️</span>
          <span className="bin-name">{bin.device_id}</span>
        </div>
        <div className={`status-badge ${isFull ? 'full' : 'ok'}`}>
          {isFull ? 'FULL' : 'OK'}
        </div>
      </div>

      <div className="bin-card-body">
        <div className="metric">
          <div className="metric-label">
            <span className="metric-icon">📏</span>
            Distance
          </div>
          <div className="metric-value">
            {bin.distance.toFixed(1)} <span className="unit">cm</span>
          </div>
        </div>

        <div className="metric">
          <div className="metric-label">
            <span className="metric-icon">⚖️</span>
            Weight
          </div>
          <div className="metric-value">
            {bin.weight.toFixed(2)} <span className="unit">kg</span>
          </div>
        </div>

        <div className="fill-level">
          <div className="fill-level-header">
            <span>Fill Level</span>
            <span className="fill-percentage">{fillPercentage.toFixed(0)}%</span>
          </div>
          <div className="fill-bar">
            <div 
              className={`fill-progress ${isFull ? 'full' : ''}`}
              style={{ width: `${fillPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="bin-card-footer">
        <span className="timestamp">
          Updated {formatTime(bin.timestamp)}
        </span>
      </div>
    </div>
  );
}

export default BinCard;

