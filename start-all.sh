#!/bin/bash
# Comprehensive test and startup script for DOTE Application

echo "========================================"
echo "🚀 DOTE Application Startup"
echo "========================================"

# Kill old processes
echo "🔴 Killing old Node processes..."
taskkill /F /IM node.exe 2>/dev/null || true
sleep 2

echo ""
echo "📦 Starting backend server (port 5000)..."
cd server
npm start &
BACKEND_PID=$!
sleep 3

echo ""
echo "🌐 Starting frontend server (port 5173)..."
cd ../client
npm run dev &
FRONTEND_PID=$!
sleep 3

echo ""
echo "✅ Both servers started!"
echo "========================================"
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:5173"
echo "========================================"
echo ""
echo "Press Ctrl+C to stop all servers"

wait
