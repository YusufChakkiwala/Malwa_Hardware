FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY src ./src
COPY scripts ./scripts
COPY jest.config.js ./
COPY tests ./tests

EXPOSE 5000

CMD ["npm", "start"]
