FROM node:22-alpine
WORKDIR /aplicacao
COPY package*.json ./
RUN npm install
COPY prisma ./prisma
RUN npx prisma generate
COPY src ./src
COPY testes ./testes
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node src/servidor.js"]
