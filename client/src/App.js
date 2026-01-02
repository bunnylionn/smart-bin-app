import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { firestore } from './firebase';
import './App.css';

const API_URL =
  process.env.REACT_APP_API_URL || 'https://smart-bin-http-frfux5cgdq-as.a.run.app';

// Constants for calculating fill and weight percentage
const BIN_HEIGHT_CM = 20;
const MAX_WEIGHT_KG = 12;

function App() {
  const [bins, setBins] = useState([]);
  const [recent, setRecent] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Helpers
  const fillPercent = (distance) => {
    if (distance === undefined || distance === null) return 0;
    return Math.min(100, Math.max(0, ((BIN_HEIGHT_CM - distance) / BIN_HEIGHT_CM) * 100));
  };

  const weightPercent = (weight) => {
    if (weight === undefined || weight === null) return 0;
    return Math.min(100, Math.max(0, (weight / MAX_WEIGHT_KG) * 100));
  };

  const formatTime = (ts) => {
    if (!ts) return '--:--:--';
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour12: true });
  };

  const selectedBin = useMemo(() => (bins.length ? bins[0] : null), [bins]);

  useEffect(() => {
    // Firestore real-time listener
    const q = query(
      collection(firestore, 'bin_data'),
      orderBy('timestamp', 'desc'),
      limit(30)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(),
            distance: Number(data.distance) || 0,
            weight: Number(data.weight) || 0,
          };
        });

        setRecent(items);
        if (items.length > 0) {
          setBins([items[0]]);
          setLastUpdate(new Date());
        } else {
          setBins([]);
        }

        setIsConnected(true);
      },
      (err) => {
        console.error('Firestore listener error:', err);
        setIsConnected(false);
      }
    );

    // Fallback initial fetch via REST in case Firestore is empty / fails
    const fetchData = async () => {
      try {
        const [latestRes, recentRes] = await Promise.all([
          axios.get(`${API_URL}/api/bins/latest`),
          axios.get(`${API_URL}/api/bins?limit=30`),
        ]);
        setBins(latestRes.data || []);
        setRecent(recentRes.data || []);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    return () => {
      unsubscribe();
    };
  }, []);

  if (!selectedBin) {
    return (
      <div className="app-shell">
        <div className="shell-card">
          <div className="shell-title">Smart Bin Monitor</div>
          <p className="shell-subtitle">Waiting for data from devices...</p>
        </div>
      </div>
    );
  }

  const fill = fillPercent(selectedBin.distance);
  const weightPct = weightPercent(selectedBin.weight);
  const isFull = selectedBin.status === 'FULL';

  const fillLabel =
    fill >= 90 ? 'Critical - Empty soon' : fill >= 60 ? 'High level' : 'Operating normally';

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="brand">
          <div className="brand-icon">🗑️</div>
          <div>
            <div className="brand-title">Smart Bin Monitor</div>
            <div className="brand-subtitle">Real-time Waste Management System</div>
          </div>
        </div>
        <div className="status-chip">
          <span className={`dot ${isConnected ? 'dot-online' : 'dot-offline'}`} />
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </header>

      <main className="layout">
        <section className={`status-panel ${isFull ? 'panel-full' : 'panel-ok'}`}>
          <div className="status-heading">
            <div className="status-text">
              <div className="status-icon">{isFull ? '⚠️' : '✅'}</div>
              <div>
                <div className="status-title">{isFull ? 'Bin Full' : 'Bin Available'}</div>
                <div className="status-subtitle">
                  {isFull ? 'Action required' : 'Operating normally'}
                </div>
              </div>
            </div>
            <div className="status-meta">
              <div className="meta-label">Device ID</div>
              <div className="meta-value">{selectedBin.device_id}</div>
              <div className="meta-time">Updated: {formatTime(selectedBin.timestamp)}</div>
            </div>
          </div>
        </section>

        <section className="cards-grid">
          <div className="card fill-card">
            <div className="card-head">
              <div className="card-title">Fill Level</div>
              <div className="card-subtitle">{selectedBin.distance.toFixed(0)} cm free</div>
            </div>
            <div className="metric-large">
              <div className="metric-value">{fill.toFixed(0)}%</div>
            </div>
            <div className="progress">
              <div className="progress-bar fill" style={{ width: `${fill}%` }} />
            </div>
            <div className="card-foot">{fillLabel}</div>
          </div>

          <div className={`card weight-card ${isFull ? 'weight-alert' : ''}`}>
            <div className="card-head">
              <div className="card-title">Weight</div>
              <div className="card-subtitle">{weightPct.toFixed(0)}% capacity</div>
            </div>
            <div className="metric-large">
              <div className="metric-value">{selectedBin.weight.toFixed(2)} kg</div>
            </div>
            <div className="progress">
              <div className="progress-bar weight" style={{ width: `${weightPct}%` }} />
            </div>
            <div className="card-foot">Max capacity: {MAX_WEIGHT_KG.toFixed(1)} kg</div>
          </div>
        </section>

        <section className="card activity-card">
          <div className="card-head">
            <div className="card-title">Recent Activity</div>
          </div>
          <div className="activity-list">
            {recent.length === 0 ? (
              <div className="empty">No recent activity yet.</div>
            ) : (
              recent.map((item, idx) => {
                const pct = fillPercent(item.distance);
                const wPct = weightPercent(item.weight);
                const statusFull = item.status === 'FULL';
                return (
                  <div className="activity-row" key={`${item.id || item.timestamp}-${idx}`}>
                    <div className="activity-left">
                      <span className={`dot ${statusFull ? 'dot-offline' : 'dot-online'}`} />
                      <span className="activity-time">{formatTime(item.timestamp)}</span>
                    </div>
                    <div className="activity-middle">
                      <span className="activity-label">Fill:</span>
                      <span className="activity-value">{pct.toFixed(0)}%</span>
                      <span className="activity-label">Weight:</span>
                      <span className="activity-value">
                        {item.weight.toFixed(2)} kg ({wPct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className={`status-tag ${statusFull ? 'tag-full' : 'tag-ok'}`}>
                      {item.status}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;

