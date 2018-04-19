import http from 'http';
import express from 'express';
import WebSocket from 'ws';

import envCheck from './util/envCheck'; // eslint-disable-line

const app = express();
const server = http.Server(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  ws.on('video-stream', (data) => {
    console.log('received data');
    console.log(data);
  });
});

// start listnening
const port = process.env.PORT
server.listen(port, () => {
  console.log(`Waiting for video streams on port ${port}!`); // eslint-disable-line
});
