const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Initialize SQLite database
const dbPath = path.join(__dirname, 'bins.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    // Create tables if they don't exist
    db.run(`CREATE TABLE IF NOT EXISTS bin_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT NOT NULL,
      distance REAL NOT NULL,
      weight REAL NOT NULL,
      status TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
      } else {
        console.log('Database table ready');
      }
    });

    // Create index for faster queries
    db.run(`CREATE INDEX IF NOT EXISTS idx_device_timestamp ON bin_data(device_id, timestamp DESC)`);
  }
});

// API endpoint to receive data from Arduino
app.post('/api/bins/data', (req, res) => {
  const { distance, weight, status, device_id } = req.body;

  // Validate required fields
  if (distance === undefined || weight === undefined || !status || !device_id) {
    return res.status(400).json({ 
      error: 'Missing required fields: distance, weight, status, device_id' 
    });
  }

  // Insert data into database
  const stmt = db.prepare(`INSERT INTO bin_data (device_id, distance, weight, status) 
                           VALUES (?, ?, ?, ?)`);
  
  stmt.run([device_id, distance, weight, status], function(err) {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: 'Failed to save data' });
    }

    // Broadcast real-time update to all connected clients
    const binData = {
      id: this.lastID,
      device_id,
      distance: parseFloat(distance),
      weight: parseFloat(weight),
      status,
      timestamp: new Date().toISOString()
    };

    io.emit('binUpdate', binData);
    
    console.log(`Data received from ${device_id}: ${status} - Distance: ${distance}cm, Weight: ${weight}kg`);
    res.status(200).json({ success: true, message: 'Data received and broadcasted' });
  });

  stmt.finalize();
});

// API endpoint to get all bins data
app.get('/api/bins', (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  
  db.all(`SELECT * FROM bin_data 
          ORDER BY timestamp DESC 
          LIMIT ?`, [limit], (err, rows) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch data' });
    }
    res.json(rows);
  });
});

// API endpoint to get latest status for each device
app.get('/api/bins/latest', (req, res) => {
  db.all(`SELECT b1.* 
          FROM bin_data b1
          INNER JOIN (
            SELECT device_id, MAX(timestamp) as max_timestamp
            FROM bin_data
            GROUP BY device_id
          ) b2 ON b1.device_id = b2.device_id AND b1.timestamp = b2.max_timestamp
          ORDER BY b1.device_id`, (err, rows) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch latest data' });
    }
    res.json(rows);
  });
});

// API endpoint to get data for a specific device
app.get('/api/bins/:deviceId', (req, res) => {
  const { deviceId } = req.params;
  const limit = parseInt(req.query.limit) || 50;

  db.all(`SELECT * FROM bin_data 
          WHERE device_id = ? 
          ORDER BY timestamp DESC 
          LIMIT ?`, [deviceId, limit], (err, rows) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch data' });
    }
    res.json(rows);
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send latest data when client connects
  db.all(`SELECT b1.* 
          FROM bin_data b1
          INNER JOIN (
            SELECT device_id, MAX(timestamp) as max_timestamp
            FROM bin_data
            GROUP BY device_id
          ) b2 ON b1.device_id = b2.device_id AND b1.timestamp = b2.max_timestamp
          ORDER BY b1.device_id`, (err, rows) => {
    if (!err && rows) {
      socket.emit('initialData', rows);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api/bins/data`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});

