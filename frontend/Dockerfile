FROM node:20-alpine

WORKDIR /app

# Copy dependency definitions
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy all source files
COPY . .

# Expose port 3000
EXPOSE 3000

# Start Vite dev server exposing it to the network
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
