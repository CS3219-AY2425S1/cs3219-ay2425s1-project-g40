FROM node:18-alpine

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy the package.json and package-lock.json files to install dependencies
COPY package*.json ./

# Step 4: Install the dependencies
RUN npm install

# Step 5: Copy the rest of the frontend source code to the working directory
COPY . .

# Step 6: Expose the port the app runs on
EXPOSE 3000

# OpenSSL support
ENV NODE_OPTIONS=--openssl-legacy-provider

# Step 7: Command to run the React app
CMD ["npm", "start"]
