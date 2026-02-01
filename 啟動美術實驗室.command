#!/bin/bash
echo "Starting Art Lab Sandbox..."
echo "[INFO] Opening Browser at http://localhost:5173/lab.html"

# Ensure we are in the script's directory/app
cd "$(dirname "$0")/app"

# Open browser in background after 2 seconds
(sleep 2 && open "http://localhost:5173/lab.html") &

# Start server
npm run dev
