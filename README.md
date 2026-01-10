# Smart Bin Monitoring System

A real-time web application for monitoring smart garbage bins. Staff garbage collectors can monitor bin status (weight and fill level) in real-time through a user-friendly dashboard.

## Features

- 🚀 **Real-time Updates**: Live data streaming via WebSocket
- 📊 **Dashboard View**: Modern UI showing all bins at a glance
- ⚖️ **Weight Monitoring**: Track bin weight in kilograms
- 📏 **Distance/Fill Level**: Monitor fill level based on ultrasonic sensor distance
- 🚨 **Status Alerts**: Visual indicators for FULL vs OK bins
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices

## Architecture

- **Backend**: Node.js + Express + Socket.io + SQLite (Deployed on Google Cloud Run)
- **Frontend**: React + Socket.io-client + Firebase
- **Database**: SQLite (lightweight, no setup required)
- **Cloud Service**: Google Cloud Run (`https://smart-bin-http-frfux5cgdq-as.a.run.app`)
- **Firebase**: Integrated for authentication and real-time capabilities

## API Endpoints

### POST `/api/bins/data`
Receive data from Arduino devices.

**Request Body:**
```json
{
  "device_id": "maker_feather_01",
  "distance": 5.2,
  "weight": 8.5,
  "status": "OK"
}
```

### GET `/api/bins/latest`
Get the latest status for all devices.

### GET `/api/bins/:deviceId`
Get historical data for a specific device.

### GET `/api/health`
Health check endpoint.

## WebSocket Events

### Client → Server
- `connect`: Client connects to server

### Server → Client
- `initialData`: Sends latest data when client connects
- `binUpdate`: Real-time updates when new data arrives

## Project Structure

```
smart-bin-app/
├── server/
│   ├── server.js          # Express server with Socket.io
│   ├── package.json
│   └── bins.db            # SQLite database (auto-created)
├── client/
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── components/    # React components
│   │   └── ...
│   └── package.json
└── README.md
```

## Deployment

### Production Server

The backend is deployed on **Google Cloud Run**:
- **URL**: `https://smart-bin-http-frfux5cgdq-as.a.run.app`

### Environment Variables

### Backend
- `PORT`: Server port (Cloud Run sets this automatically)

### Frontend
- `REACT_APP_API_URL`: Backend API URL (default: `https://smart-bin-http-frfux5cgdq-as.a.run.app`)
- `REACT_APP_SOCKET_URL`: WebSocket URL (default: `https://smart-bin-http-frfux5cgdq-as.a.run.app`)

Create a `.env` file in the `client` directory to override these values for local development.

### Firebase Configuration

Firebase is integrated and configured in `client/src/firebase.js`. The configuration includes:
- Firestore

See `DEPLOYMENT.md` for more deployment details.

