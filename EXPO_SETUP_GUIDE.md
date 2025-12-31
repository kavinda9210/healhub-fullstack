# Expo QR Code Scanning Fix - Setup Guide

## Problem
Cannot scan QR code from mobile phone on Expo Go app because the Expo server is running on `localhost`, which is not accessible from another device on the network.

## Solution

### Step 1: Find Your Laptop's IP Address

**Windows:**
```powershell
ipconfig
```
Look for "IPv4 Address" under your active network connection (e.g., `192.168.1.100`)

**Mac/Linux:**
```bash
ifconfig
```
Look for "inet" address (e.g., `192.168.1.100`)

### Step 2: Update the Configuration

Edit [HealHub/.env.local](HealHub/.env.local) and replace `localhost` with your laptop's IP:

```env
EXPO_PUBLIC_LAPTOP_IP=192.168.1.100  # Replace with your actual IP
```

### Step 3: Ensure Backend is Accessible

The backend Flask server also needs to accept connections from your mobile device. It's already configured to listen on `0.0.0.0`, so it should work.

In [backend-flask/run.py](backend-flask/run.py):
```python
app.run(
    debug=config.DEBUG,
    host='0.0.0.0',  # ✅ Listens on all network interfaces
    port=5000,
    use_reloader=True
)
```

### Step 4: Start the Apps

**Terminal 1 - Start Backend:**
```powershell
cd backend-flask
python run.py
# Server running on port 5000
```

**Terminal 2 - Start Expo Frontend:**
```powershell
cd HealHub
npm start
# Press 'w' for web, or scan QR code with Expo Go
```

### Step 5: Connect Mobile Device

1. **Make sure your mobile phone is on the SAME WiFi network as your laptop**
2. Open **Expo Go** app on your mobile
3. Scan the QR code displayed in the terminal
4. The app should now load from your laptop

### Important: Network Requirements
- ✅ Mobile phone and laptop must be on the **same WiFi network**
- ✅ Firewall must allow connections to port 5000 and Expo port (usually 8081)
- ✅ Use the actual IP address, not `localhost`

### Troubleshooting

If it still doesn't work:

1. **Check IP is correct:**
   ```powershell
   ping 192.168.1.100  # Use your actual IP
   ```

2. **Check ports are accessible:**
   ```powershell
   # Windows - Check if ports 5000 and 8081 are open
   netstat -an | findstr "5000"
   netstat -an | findstr "8081"
   ```

3. **Firewall issue?**
   - Try disabling Windows Defender Firewall temporarily to test
   - Or add exceptions for ports 5000 and 8081

4. **Reset Expo:**
   - Kill the Expo process and restart
   - Clear Expo Go cache on mobile and restart

### Configuration Files Modified

1. [HealHub/components/config.ts](HealHub/components/config.ts) - Now uses environment variable for API endpoint
2. [HealHub/.env.local](HealHub/.env.local) - New file with laptop IP configuration
3. [HealHub/app.json](HealHub/app.json) - Added network scheme support
