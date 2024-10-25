import { io } from 'socket.io-client';

const URL = process.env.COLLAB_WS ?? 'http://localhost:8003';

export const socket = io(URL, {autoConnect: false});