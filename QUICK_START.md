# Quick Start Guide

## Your Server Configuration

- **Cloud Run URL**: `https://smart-bin-http-frfux5cgdq-as.a.run.app`
- **Firebase Project**: `smartbin-cpc357-project`

## Setup Steps

### 1. Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### 2. Update Arduino Code

In your Arduino IDE, update the `serverUrl`:

```cpp
const char* serverUrl = "https://smart-bin-http-frfux5cgdq-as.a.run.app/api/bins/data";
```

### 3. Run Frontend

```bash
cd client
npm start
```

The app will open at `http://localhost:3000` and automatically connect to your Cloud Run server.

### 4. Test Connection

1. Upload your Arduino code
2. Open Serial Monitor to see connection status
3. Check the web dashboard - you should see data appearing!

## Configuration Files

- **Firebase Config**: `client/src/firebase.js` (already configured)
- **API URLs**: Set in `client/src/App.js` (defaults to Cloud Run)
- **Environment Variables**: Create `client/.env` if you need to override URLs

## Troubleshooting

### Arduino can't connect
- Check WiFi credentials in Arduino code
- Verify the server URL is correct (must be HTTPS for Cloud Run)
- Check Serial Monitor for error messages

### Frontend shows "Disconnected"
- Verify Cloud Run service is running
- Check browser console for errors
- Try accessing `https://smart-bin-http-frfux5cgdq-as.a.run.app/api/health` directly

### No data appearing
- Verify Arduino is sending data (check Serial Monitor)
- Check Cloud Run logs for incoming requests
- Verify the POST request format matches the API specification

## Next Steps

- Add Firebase Authentication for staff login
- Use Firebase Realtime Database for persistent storage
- Deploy frontend to Firebase Hosting or similar service





