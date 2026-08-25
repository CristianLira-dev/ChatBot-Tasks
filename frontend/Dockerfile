FROM node:22-alpine
WORKDIR /aplicacao
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "desenvolvimento"]
