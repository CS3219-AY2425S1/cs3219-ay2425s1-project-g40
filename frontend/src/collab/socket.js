import { io } from 'socket.io-client';
/**
 * In DEV, the service is under http://localhost:8000/sockets
 * 
 * In PROD, the service is under http://<host>/ws
 */
const ENV = process.env.REACT_APP_ENV ?? "DEV";   // DEV by default
const ENDPOINT = process.env.REACT_APP_COLLAB_WS ?? 'http://localhost:8003';

const socketPath = ENV === "DEV" ? "/sockets/" : "/collab-service/ws/sockets/"

console.log(ENDPOINT, socketPath)

export const socket = io(ENDPOINT, {
    autoConnect: false,
    path: socketPath,
    transports: ['polling', 'websocket'], // required
});