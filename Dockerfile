FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 python3-pip \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/package*.json ./backend/
RUN npm --prefix backend ci --include=dev

COPY chatbot/requisitos.txt ./chatbot/
RUN pip3 install --no-cache-dir --break-system-packages -r chatbot/requisitos.txt

COPY backend ./backend
COPY chatbot ./chatbot
COPY scripts/iniciar-render-unico.sh ./scripts/iniciar-render-unico.sh
RUN chmod +x ./scripts/iniciar-render-unico.sh

ENV PYTHONUNBUFFERED=1 \
    USAR_BANCO_MEMORIA=false \
    USAR_FILAS_MEMORIA=true \
    URL_CHATBOT=http://127.0.0.1:8000

CMD ["/app/scripts/iniciar-render-unico.sh"]
