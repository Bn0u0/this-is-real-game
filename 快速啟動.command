#!/bin/bash
echo "=========================================="
echo "🚀 正在啟動《這才叫割草》開發伺服器..."
echo "------------------------------------------"
echo "請保持此視窗開啟，關閉視窗即停止伺服器。"
echo "=========================================="

# Ensure we are in the script's directory/app
cd "$(dirname "$0")/app"

# Open browser in background after 2 seconds
(sleep 2 && open "http://localhost:5180") &

# Start server
npm run dev -- --port 5180
