import { io } from 'socket.io-client/dist/socket.io';


export const socket = io({
    transports: ['websocket']
});
