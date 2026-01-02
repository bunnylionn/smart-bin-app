# Arduino Setup Instructions

## Update Your Arduino Code

You need to update the `serverUrl` in your Arduino code to point to your Render backend server.

### Production Server (Render)

Your server is deployed on Render. Update your Arduino code with:

```cpp
const char* serverUrl = "https://smart-bin-api.onrender.com/api/bins/data";
```

**Note:** Render uses HTTPS (port 443) by default. Make sure your HTTPClient library supports HTTPS.

### For Local Development (Testing on Same Network)

If you want to test locally first:

1. Find your computer's local IP address:
   - **Windows**: Open Command Prompt and type `ipconfig`, look for "IPv4 Address"
   - **Mac/Linux**: Open Terminal and type `ifconfig` or `ip addr`, look for your network interface IP

2. Update your Arduino code:

```cpp
const char* serverUrl = "http://YOUR_LOCAL_IP:3001/api/bins/data";
```

Example:
```cpp
const char* serverUrl = "http://192.168.1.100:3001/api/bins/data";
```

## Complete Updated Arduino Code Section

Replace the serverUrl line in your Arduino code:

```cpp
// ==========================================
// --- USER CONFIGURATION ---
// ==========================================
const char* ssid = "Galaxy S23 Ultra";       
const char* password = "jannah03"; 
const char* serverUrl = "https://smart-bin-api.onrender.com/api/bins/data";
```

## Testing the Connection

1. Make sure your Render server is deployed and running
2. Upload your Arduino code with the updated server URL
3. Open Serial Monitor (115200 baud) to see connection status
4. Check your web dashboard - you should see data appearing in real-time!

## Important Notes for Render

- **HTTPS Required**: Render uses HTTPS by default. Your Arduino HTTPClient must support SSL/TLS
- **Port**: No need to specify port (HTTPS uses 443 by default)
- **Keep-Alive**: The server includes a keep-alive ping to prevent Render from spinning down on free tier

## Troubleshooting

- **"Error sending POST"**: Check that the server is running and the URL is correct
- **WiFi connection issues**: Verify your SSID and password are correct
- **No data on dashboard**: Ensure both backend and frontend servers are running

