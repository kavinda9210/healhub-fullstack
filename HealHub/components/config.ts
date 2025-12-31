// API Configuration for both local development and remote device access
// For local development: http://localhost:5000
// For remote devices (mobile): Use your laptop's IP address, e.g., http://192.168.x.x:5000

// Set this to your laptop's IP address when testing on a real device
// You can find it by running: ipconfig (Windows) or ifconfig (Mac/Linux)
// Example: export const LAPTOP_IP = '192.168.1.100'; // Replace with your actual IP

export const LAPTOP_IP = process.env.EXPO_PUBLIC_LAPTOP_IP || 'localhost';
export const API_BASE = `http://${LAPTOP_IP}:5000`;
