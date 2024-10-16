# Dockerfile
FROM node:18

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install Node.js dependencies
RUN npm i && npm i -g nodemon

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE ${BACK_PORT}

# Command to run the application
# CMD ["npm", "run", "build"]
CMD ["npm", "run", "dev"]