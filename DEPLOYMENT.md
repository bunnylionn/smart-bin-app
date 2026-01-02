# Deployment Guide

## Cloud Run Deployment

Your server is deployed at: `https://smart-bin-http-frfux5cgdq-as.a.run.app`

### Important Notes for Cloud Run

1. **Socket.io Considerations**: Cloud Run is serverless and may have limitations with WebSocket connections. If you experience connection issues:
   - Consider using Firebase Realtime Database as an alternative for real-time updates
   - Or use a service like Cloud Run with WebSocket support enabled
   - The REST API endpoints will work fine regardless

2. **Environment Variables**: Make sure your Cloud Run service has the `PORT` environment variable set (Cloud Run usually sets this automatically).

3. **Database**: SQLite files in Cloud Run are ephemeral. For production, consider:
   - Using Cloud SQL (PostgreSQL/MySQL)
   - Using Firebase Realtime Database or Firestore
   - Using Cloud Storage for persistent SQLite files

### Frontend Configuration

The frontend is configured to use your Cloud Run URL by default. To change it, create a `.env` file in the `client` directory:

```env
REACT_APP_API_URL=https://smart-bin-http-frfux5cgdq-as.a.run.app
REACT_APP_SOCKET_URL=https://smart-bin-http-frfux5cgdq-as.a.run.app
```

### Arduino Configuration

Update your Arduino code with:

```cpp
const char* serverUrl = "https://smart-bin-http-frfux5cgdq-as.a.run.app/api/bins/data";
```

## Firebase Integration

Firebase has been integrated into the frontend. You can use it for:
- Authentication (staff login)
- Realtime Database (alternative to Socket.io)
- Firestore (alternative to SQLite)

### Using Firebase Realtime Database

If you want to use Firebase instead of Socket.io for real-time updates, you can modify the App.js to listen to Firebase Realtime Database changes instead of Socket.io events.

## Testing the Connection

1. **Test API Endpoint**:
   ```bash
   curl https://smart-bin-http-frfux5cgdq-as.a.run.app/api/health
   ```

2. **Test POST Endpoint** (from Arduino or Postman):
   ```bash
   curl -X POST https://smart-bin-http-frfux5cgdq-as.a.run.app/api/bins/data \
     -H "Content-Type: application/json" \
     -d '{
       "device_id": "test_device",
       "distance": 5.0,
       "weight": 8.5,
       "status": "OK"
     }'
   ```

3. **Check Frontend**: Open the React app and verify it connects to your Cloud Run server.

