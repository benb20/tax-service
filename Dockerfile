# Use Node.js LTS version
FROM node:18

# Set the working directory
WORKDIR /app 

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the application's port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev"]
