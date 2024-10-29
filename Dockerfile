FROM node:latest 
# Set working directory
WORKDIR /app
# Copy package.json and package-lock.json 
COPY package*.json ./
# Install dependencies
RUN npm install
# Copy the rest of the backend code
COPY . .
# Build the NestJS application
RUN npm run build
# Expose port
EXPOSE 3000
# Run the NestJS application (will use the build we just created)
CMD ["bash", "-c", "npm run start:prod"]