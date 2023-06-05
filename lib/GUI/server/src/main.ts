import fs from 'fs';
import http from 'http';
import path from 'path';
import dotenv from 'dotenv';
import express from 'express';
import { Server as SocketIOServer, Socket } from 'socket.io';

const rootFromPath = (path: string): string => {
    const root = path.split('/')[2];
    console.log({ root });
    return root;
}


const envPath = path.join(__dirname, '../../../.env');

dotenv.config({
    path: envPath
});

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 9000;
const rootUser: string = process.env.ROOT_USER ?? rootFromPath(envPath);
const documentFolder = path.resolve('/home', rootUser, 'Documents');
const scannedFolder = path.resolve(documentFolder, 'scanned');
const scannedJson = path.resolve(scannedFolder, 'scanned_data.json');



interface ScannedData {
    recentlyScanned: {
        addedAt: string;
        productAlias: string | null;
        productData: {
            barcode: string[];
            name: string;
            _id: string;
        }
    }[]
}



const app: express.Application = express();
const server: http.Server = http.createServer(app);
const staticPath = path.join(__dirname, '../../client/dist');
const io: SocketIOServer = new SocketIOServer(server, { cors: { origin: '*' } });

app.use(express.json());
app.use(express.static(staticPath));


const readScannedJson = (): ScannedData => {
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
        io.emit('update', barcodeData);
        res.status(200).send('OK');
    } catch (error) {
        res.status(500)
    }
});



// Socket.IO event handling
io.on('connection', (socket: Socket): void => {
    // send the client the starting data
    socket.emit('data', STARTING_DATA.recentlyScanned);
});



server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
