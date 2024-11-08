import { io } from 'socket.io-client';
/**
 * In DEV, the service is under http://localhost:8000/sockets
 * 
 * In PROD, the service is under http://<host>/ws/sockets
 */
const ENV = process.env.ENV ?? "DEV";   // DEV by default
const ENDPOINT = process.env.COLLAB_WS ?? 'http://localhost:8003';

const URL = `${ ENDPOINT.replace('/app-sockets', '') }`
const socketPath = `${ ENV === 'DEV' ? '' : '/ws' }/sockets/`

export const socket = io(URL, {
    autoConnect: false,
    extraHeaders: {
        "Access-Control-Allow-Origin": "*",
    },
    path: socketPath,
    transports: ['polling', 'websocket'], // required
});