import { io } from 'socket.io-client';

const URL = process.env.COLLAB_WS ?? 'http://localhost:8080';

export const socket = io(URL, {autoConnect: false});