# Dockerfile
FROM node:18

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose port (adjust as needed)
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "build"]