FROM node:18-alpine

ARG REACT_APP_QUESTION_API_URL
ARG REACT_APP_TOPIC_API_URL
ARG REACT_APP_USER_REGISTER_URL
ARG REACT_APP_USER_LOGIN_URL
ARG REACT_APP_MATCHING_SERVICE_URL
ARG REACT_APP_COLLAB_WS

ENV REACT_APP_ENV=PROD
ENV REACT_APP_QUESTION_API_URL=${REACT_APP_QUESTION_API_URL}
ENV REACT_APP_TOPIC_API_URL=${REACT_APP_TOPIC_API_URL}
ENV REACT_APP_USER_REGISTER_URL=${REACT_APP_USER_REGISTER_URL}
ENV REACT_APP_USER_LOGIN_URL=${REACT_APP_USER_LOGIN_URL}
ENV REACT_APP_MATCHING_SERVICE_URL=${REACT_APP_MATCHING_SERVICE_URL}
ENV REACT_APP_COLLAB_WS=${REACT_APP_COLLAB_WS}

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

RUN npm run build

CMD ["npx", "serve", "-s", "build"]