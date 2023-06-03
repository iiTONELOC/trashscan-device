import os from 'os';
import fs from 'fs';
import http from 'http';
import path from 'path';
import express from 'express';
import { Server as SocketIOServer, Socket } from 'socket.io';

const staticPath = path.join(__dirname, '../../client/dist');

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: '*' } });

app.use(express.json());
app.use(express.static(staticPath));

const documentFolder = path.join(os.homedir(), 'Documents');
const scannedFolder = path.join(documentFolder, 'scanned');
const scannedJson = path.join(scannedFolder, 'scanned_data.json');

const readScannedJson = () => {
    if (!fs.existsSync(scannedFolder)) {
        fs.mkdirSync(scannedFolder);
    }

    if (!fs.existsSync(scannedJson)) {
        fs.writeFileSync(scannedJson, JSON.stringify({ recentlyScanned: [] }));
    }

    return JSON.parse(fs.readFileSync(scannedJson, 'utf8'));
};

const STARTING_DATA = readScannedJson();

app.post('/api/newly-scanned', ({ body }, res) => {
    try {
        const { barcodeData } = body;
        STARTING_DATA.recentlyScanned.push(barcodeData);
        io.emit('data', barcodeData);
        res.status(200).send('OK');
    } catch (error) {
        res.status(500)
    }
});



// Socket.IO event handling
io.on('connection', (socket: Socket) => {
    // send the client the starting data
    socket.emit('data', STARTING_DATA.recentlyScanned);
});

const PORT = 9000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
