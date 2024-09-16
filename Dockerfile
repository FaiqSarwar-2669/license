# Use the official Node.js 14 Alpine base image
FROM node:14-alpine

# Install envsubst
RUN apk --no-cache add gettext

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install all dependencies, including development dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Copy the config.json.template file from the root of the project to the /app directory
# COPY config.json.template /app/config.json.template

# Replace environment variables in the config.json.template file
# RUN sh -c 'envsubst < /app/config.json.template > /app/config.json'

# Expose the port on which the Node.js application will listen
EXPOSE 80

# Run the Node.js application
CMD ["node", "server.js"]
