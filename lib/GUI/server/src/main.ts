import http from 'http';
import path from 'path';
import express from 'express';
import { PORT } from './constants';
import { exec } from 'child_process';
import { readScannedJson } from './utils';


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

app.get('/api/scanned-items', (_, res) => {
    const STARTING_DATA = readScannedJson();
    res.status(200).send(STARTING_DATA)
});


server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
