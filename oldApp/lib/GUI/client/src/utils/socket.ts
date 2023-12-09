import { io } from 'socket.io-client';


export const socket = io(`http://${window.location.hostname}:9000`, {
    transports: ['websocket']
});
