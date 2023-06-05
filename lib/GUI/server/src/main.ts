import http from 'http';
import path from 'path';
import express from 'express';
import { PORT } from './constants';
import { exec } from 'child_process';
import { readScannedJson } from './utils';
import { Server as SocketIOServer, Socket } from 'socket.io';

const STARTING_DATA = readScannedJson();

const app: express.Application = express();
const server: http.Server = http.createServer(app);
const io: SocketIOServer = new SocketIOServer(server);


app.use(express.json());
app.use(express.static(path.join(__dirname, '../../client/dist')));


app.post('/api/newly-scanned', ({ body }, res) => {
    try {
        const { barcodeData } = body;
        STARTING_DATA.recentlyScanned.push(barcodeData);
        io.emit('update', barcodeData);
        res.status(200).send('OK');
    } catch (error) {
        res.status(500)
    }
});

app.post('/api/shutdown', (req, res) => {
    res.status(200).send('OK');
    exec(`sudo shutdown -h now`);
});

app.post('/api/restart', (req, res) => {
    res.status(200).send('OK');
    console.log('restarting');
    exec(`sudo shutdown -r now`);
});


// Socket.IO event handling
io.on('connection', (socket: Socket): void => {
    // send the client the starting data
    socket.emit('data', STARTING_DATA.recentlyScanned);
});


server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
