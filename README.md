# Smart Bin Monitoring System

A real-time web application for monitoring smart garbage bins. Staff garbage collectors can monitor bin status (weight, distance/fill level) in real-time through a user-friendly dashboard.

## Features

- 🚀 **Real-time Updates**: Live data streaming via WebSocket
- 📊 **Dashboard View**: Beautiful, modern UI showing all bins at a glance
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

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The server will run on `http://localhost:3001` by default.

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000` by default.

### Arduino Configuration

Update your Arduino code with the Cloud Run server URL:

```cpp
const char* serverUrl = "https://smart-bin-http-frfux5cgdq-as.a.run.app/api/bins/data";
```

See `ARDUINO_SETUP.md` for detailed instructions.

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

## Usage

1. Start both backend and frontend servers
2. Ensure your Arduino device is configured with the correct server URL
3. Open the web application in your browser
4. Monitor bins in real-time as data arrives from Arduino devices

## Deployment

### Production Server

The backend is deployed on **Google Cloud Run**:
- **URL**: `https://smart-bin-http-frfux5cgdq-as.a.run.app`
- The frontend is configured to use this URL by default

### Environment Variables

### Backend
- `PORT`: Server port (Cloud Run sets this automatically)

### Frontend
- `REACT_APP_API_URL`: Backend API URL (default: `https://smart-bin-http-frfux5cgdq-as.a.run.app`)
- `REACT_APP_SOCKET_URL`: WebSocket URL (default: `https://smart-bin-http-frfux5cgdq-as.a.run.app`)

Create a `.env` file in the `client` directory to override these values for local development.

### Firebase Configuration

Firebase is integrated and configured in `client/src/firebase.js`. The configuration includes:
- Authentication
- Realtime Database
- Firestore (available for use)

See `DEPLOYMENT.md` for more deployment details.

## License

ISC

