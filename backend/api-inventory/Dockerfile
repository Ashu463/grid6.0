# Base image
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Install PM2 globally
RUN npm install -g pm2

# Install Prisma CLI
RUN npm install -g prisma

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of your application code
COPY . .

# Build the NestJS application
RUN npm run build

# Expose the application port
EXPOSE 9000

# Start the application using PM2
CMD ["pm2-runtime", "start", "dist/main.js"]
