import http from 'http';
import express from 'express';
import SocketIO from 'socket.io';

import envCheck from './util/envCheck'; // eslint-disable-line

const app = express();
const server = http.Server(app);
const io = new SocketIO(server);

// settings
app.set('trust proxy', true);

// sockets.io handling
io.on('connection', (socket) => {
  // Robot join
  socket.on('video-stream', (data) => {
    console.log(data); // eslint-disable-line
  });
});

// start listnening
const port = process.env.PORT
server.listen(port, () => {
  console.log(`Ready to receive robot controls on port ${port}!`); // eslint-disable-line
});
