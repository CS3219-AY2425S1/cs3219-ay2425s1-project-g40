FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci && \
    npm cache clean --force

COPY . .
RUN npm run build

EXPOSE 8000
CMD [ "npm", "run", "start" ]