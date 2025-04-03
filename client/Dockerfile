# # Base image
# FROM node:18

# # Set working directory
# WORKDIR /app

# # Copy package.json and package-lock.json
# COPY package.json package-lock.json* ./ 

# # Install dependencies
# RUN npm install

# # Copy the rest of the project files
# COPY . .

# # Expose the port Vite uses by default
# EXPOSE 5173

# # Run the application in development or production mode
# CMD ["npm", "run", "dev"]




# Use official Node.js image
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files separately for better caching
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --production

# Copy the rest of the project files
COPY . .

# Expose Vite default port
EXPOSE 5173

# Start the development server
CMD ["npm", "run", "dev"]
