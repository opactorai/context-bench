# Three-layer Docker build following SWE-bench pattern
FROM node:18-slim

WORKDIR /app

# Layer 1: Dependencies
COPY package*.json ./
# Agent runs `npm install` which updates package-lock.json
# Use npm install (not npm ci) to handle modified package.json
RUN npm install --production=false

# Layer 2: Source code
COPY app/ ./app/
COPY tsconfig.json ./
RUN npm run build

# Layer 3: Runtime
EXPOSE 3000

CMD ["npm", "start"]
