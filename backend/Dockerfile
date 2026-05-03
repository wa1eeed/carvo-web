FROM node:20-alpine

# better-sqlite3 needs build tools
RUN apk add --no-cache python3 make g++ \
 && ln -sf python3 /usr/bin/python

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY . .

# Persistent data + uploads
RUN mkdir -p /app/data /app/uploads
VOLUME ["/app/data", "/app/uploads"]

ENV NODE_ENV=production
ENV PORT=4000
ENV DB_PATH=/app/data/carvo.db
ENV UPLOADS_DIR=/app/uploads

EXPOSE 4000

CMD ["node", "src/server.js"]
