#!/bin/sh
set -eu

PORT="${PORT:-10000}"
export PORT
export USAR_BANCO_MEMORIA="${USAR_BANCO_MEMORIA:-false}"
export USAR_FILAS_MEMORIA="${USAR_FILAS_MEMORIA:-true}"
export URL_CHATBOT="${URL_CHATBOT:-http://127.0.0.1:8000}"

npm --prefix /app/backend run prisma:migrar

python3 -m uvicorn aplicativo.principal:aplicacao --host 127.0.0.1 --port 8000 &
CHATBOT_PID=$!

cleanup() {
  kill "$CHATBOT_PID" 2>/dev/null || true
}
trap cleanup INT TERM EXIT

cd /app/backend
exec npm start
