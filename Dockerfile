# Base image
FROM node:latest

# Set working directory inside the container
WORKDIR /src

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Expose the app's port
EXPOSE 3000

# Default command to run the app
CMD ["node", "index.js"]
