#!/bin/bash
# VisionFlow AI - Production Server Startup Script
# Uses start-stop-daemon for process persistence (survives shell disconnects)
# PID file: /tmp/visionflow-server.pid
# Log file: /tmp/visionflow-server.log

set -e

PROJECT_DIR="/home/z/my-project"
SERVER_CMD="$(which node)"
SERVER_ARGS=".next/standalone/server.js"
PID_FILE="/tmp/visionflow-server.pid"
LOG_FILE="/tmp/visionflow-server.log"
PORT=3000

case "$1" in
  start)
    # Check if already running
    if [ -f "$PID_FILE" ]; then
      OLD_PID=$(cat "$PID_FILE" 2>/dev/null)
      if kill -0 "$OLD_PID" 2>/dev/null; then
        echo "VisionFlow server is already running (PID: $OLD_PID)"
        exit 0
      else
        echo "Stale PID file found, cleaning up..."
        rm -f "$PID_FILE"
      fi
    fi

    echo "Starting VisionFlow AI server on port $PORT..."
    
    # Use start-stop-daemon for reliable background process management
    start-stop-daemon \
      --start \
      --background \
      --make-pidfile \
      --pidfile "$PID_FILE" \
      --chdir "$PROJECT_DIR" \
      --exec "$SERVER_CMD" \
      -- $SERVER_ARGS >> "$LOG_FILE" 2>&1

    # Wait and verify
    sleep 3
    if [ -f "$PID_FILE" ]; then
      PID=$(cat "$PID_FILE")
      if kill -0 "$PID" 2>/dev/null; then
        echo "VisionFlow server started successfully (PID: $PID)"
        echo "Listening on: http://localhost:$PORT"
        echo "Log file: $LOG_FILE"
        exit 0
      fi
    fi
    
    echo "ERROR: Server failed to start. Check $LOG_FILE for details."
    exit 1
    ;;

  stop)
    if [ -f "$PID_FILE" ]; then
      PID=$(cat "$PID_FILE")
      if kill -0 "$PID" 2>/dev/null; then
        echo "Stopping VisionFlow server (PID: $PID)..."
        start-stop-daemon \
          --stop \
          --pidfile "$PID_FILE" \
          --retry 5
        rm -f "$PID_FILE"
        echo "Server stopped."
      else
        echo "Server not running (stale PID file)."
        rm -f "$PID_FILE"
      fi
    else
      echo "No PID file found. Server not running."
    fi
    ;;

  restart)
    $0 stop
    sleep 2
    $0 start
    ;;

  status)
    if [ -f "$PID_FILE" ]; then
      PID=$(cat "$PID_FILE")
      if kill -0 "$PID" 2>/dev/null; then
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/ 2>/dev/null || echo "000")
        echo "VisionFlow server is RUNNING (PID: $PID, HTTP: $HTTP_CODE)"
      else
        echo "VisionFlow server is STOPPED (stale PID file)"
      fi
    else
      echo "VisionFlow server is STOPPED (no PID file)"
    fi
    ;;

  logs)
    if [ -f "$LOG_FILE" ]; then
      tail -f "$LOG_FILE"
    else
      echo "No log file found at $LOG_FILE"
    fi
    ;;

  *)
    echo "Usage: $0 {start|stop|restart|status|logs}"
    echo ""
    echo "  start    - Start the VisionFlow production server"
    echo "  stop     - Stop the server gracefully"
    echo "  restart  - Stop and start the server"
    echo "  status   - Check if the server is running"
    echo "  logs     - Tail the server log file"
    exit 1
    ;;
esac
