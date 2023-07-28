import http from 'http';
import path from 'path';
import express from 'express';
import { PORT } from './constants';
import { exec } from 'child_process';
import { readScannedJson } from './utils';
import { IScannedData } from './types';

let STARTING_DATA = readScannedJson();
let SENT_START_DATA = false;

const app: express.Application = express();
const server: http.Server = http.createServer(app);

app.use(express.json());
app.use(express.static(path.join(__dirname, '../../client/dist')));

app.post('/api/shutdown', (_, res) => {
    res.status(200).send('OK');
    exec(`sudo shutdown -h now`);
});

app.post('/api/restart', (_, res) => {
    res.status(200).send('OK');
    console.log('restarting');
    exec(`sudo shutdown -r now`);
});

app.get('/api/scanned-items/all', (_, res) => {
    !SENT_START_DATA && (SENT_START_DATA = true);
    return res.status(200).json(STARTING_DATA);
});

app.get('/api/scanned-items/updated', (_, res) => {
    const FRESH_DATA = readScannedJson();

    const items: IScannedData = {
        recentlyScanned: []
    };

    if (SENT_START_DATA) {
        const STARTING_DATA_LENGTH = STARTING_DATA.recentlyScanned.length;
        const FRESH_DATA_LENGTH = FRESH_DATA.recentlyScanned.length;

        let DIFFERENCE: IScannedData['recentlyScanned'] = [];

        if (STARTING_DATA_LENGTH !== FRESH_DATA_LENGTH) {
            const DIFFERENCE_LENGTH = FRESH_DATA_LENGTH - STARTING_DATA_LENGTH;
            DIFFERENCE = FRESH_DATA.recentlyScanned.slice(FRESH_DATA_LENGTH - DIFFERENCE_LENGTH);
        }

        STARTING_DATA = FRESH_DATA;
        return res.status(200).json({ recentlyScanned: DIFFERENCE });
    }

    return res.status(200).json(items);
});


server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
