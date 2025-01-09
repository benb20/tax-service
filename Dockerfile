# Use Node.js LTS version
FROM node:18

WORKDIR /app 

COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the application's port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev"]
