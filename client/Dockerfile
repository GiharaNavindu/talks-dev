# Base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json* ./ 

# Install dependencies
RUN npm install

# Copy the rest of the project files
COPY . .

# Expose the port Vite uses by default
EXPOSE 5173

# Run the application in development or production mode
CMD ["npm", "run", "dev"]
