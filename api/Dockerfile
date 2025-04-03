# # # Base image
# # FROM node:18

# # # Set working directory
# # WORKDIR /app

# # # Copy package.json and package-lock.json
# # COPY package.json package-lock.json* ./

# # # Install dependencies
# # RUN npm install

# # # Copy the rest of the application files
# # COPY . .

# # # Expose the port your app runs on (default for Express is 3000)
# # EXPOSE 3000

# # # Run the application in production mode
# # CMD ["npm", "start"]



# # Use official Node.js image
# FROM node:18-alpine AS base

# # Set working directory
# WORKDIR /app

# # Copy package files separately to improve build cache efficiency
# COPY package.json package-lock.json* ./

# # Install only production dependencies
# RUN npm install


# # Copy the rest of the application files
# COPY . .

# # Expose the application port
# EXPOSE 3000

# # Start the application
# CMD ["npm", "start"]



# # Use official Node.js image
# FROM node:18-alpine AS base

# # Set working directory
# WORKDIR /app

# # Copy package files separately
# COPY package.json package-lock.json* ./

# # Install only production dependencies
# RUN npm install

# # Copy the rest of the application files
# COPY . .

# # Accept MongoDB URL from build arguments
# ARG MONGO_URL
# ENV MONGO_URL=${MONGO_URL}

# # Expose the application port
# EXPOSE 3000

# # Start the application
# CMD ["npm", "start"]


# Use official Node.js image
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files separately
COPY package.json package-lock.json* ./

# Install only production dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Accept MongoDB URL from build arguments
ARG MONGO_URL
ENV MONGO_URL=${MONGO_URL}

# Expose the application port
EXPOSE 4040

# Start the application
CMD ["npm", "start"]
