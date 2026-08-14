#!/bin/bash
set -e

# ==============================================================================
# Single-Container Entrypoint: Next.js Frontend + Internal FastAPI Backend
# ==============================================================================

FASTAPI_PID=""
NEXTJS_PID=""

cleanup() {
    echo "[Container] Received termination signal. Shutting down gracefully..."
    if [ -n "$FASTAPI_PID" ] && kill -0 "$FASTAPI_PID" 2>/dev/null; then
        echo "[Container] Stopping FastAPI (PID $FASTAPI_PID)..."
        kill -TERM "$FASTAPI_PID" 2>/dev/null || true
    fi
    if [ -n "$NEXTJS_PID" ] && kill -0 "$NEXTJS_PID" 2>/dev/null; then
        echo "[Container] Stopping Next.js (PID $NEXTJS_PID)..."
        kill -TERM "$NEXTJS_PID" 2>/dev/null || true
    fi
    wait 2>/dev/null || true
    echo "[Container] All processes stopped. Exit."
    exit 0
}

trap cleanup SIGTERM SIGINT

echo "================================================================="
echo " Starting Bhratritya Foundation Production Container"
echo " Architecture: Next.js (Public) -> FastAPI (Internal 127.0.0.1:8000)"
echo "================================================================="

# Set environment defaults
export PYTHONPATH="/app"
export FASTAPI_INTERNAL_URL="http://127.0.0.1:8000"
export INTERNAL_API_URL="http://127.0.0.1:8000"
export PORT="${PORT:-3000}"
export HOSTNAME="0.0.0.0"

# Start FastAPI backend on internal loopback only
echo "[FastAPI] Starting internal backend on 127.0.0.1:8000..."
/opt/venv/bin/uvicorn backend.app.main:app \
    --host 127.0.0.1 \
    --port 8000 \
    --workers 2 \
    --log-level info &
FASTAPI_PID=$!

# Health wait loop for FastAPI
echo "[FastAPI] Waiting for internal backend readiness..."
READY=0
for i in $(seq 1 30); do
    if curl -s -f http://127.0.0.1:8000/health > /dev/null 2>&1; then
        echo "[FastAPI] Backend is ready and listening on 127.0.0.1:8000 (Internal Only)."
        READY=1
        break
    fi
    sleep 0.5
done

if [ "$READY" -ne 1 ]; then
    echo "[FastAPI] ERROR: Backend failed to start within timeout."
    kill -TERM "$FASTAPI_PID" 2>/dev/null || true
    exit 1
fi

# Start Next.js frontend on public port
echo "[Next.js] Starting production frontend on 0.0.0.0:${PORT}..."
cd /app/frontend
./node_modules/.bin/next start -p "${PORT}" -H 0.0.0.0 &
NEXTJS_PID=$!

echo "[Container] Both services are running."
echo "[Container] Public entry point: 0.0.0.0:${PORT}"
echo "[Container] Internal FastAPI: 127.0.0.1:8000 (Private)"

# Monitor child processes
while true; do
    if ! kill -0 "$FASTAPI_PID" 2>/dev/null; then
        echo "[Container] FATAL: FastAPI backend process died unexpectedly."
        cleanup
        exit 1
    fi
    if ! kill -0 "$NEXTJS_PID" 2>/dev/null; then
        echo "[Container] FATAL: Next.js frontend process died unexpectedly."
        cleanup
        exit 1
    fi
    sleep 2
done
