import http from 'http';
import express from 'express';
import mongoose from 'mongoose';
import SocketIO from 'socket.io';
import morgan from 'morgan';
import bodyParser from 'body-parser';

import * as config from './config/vars';
import apiRouter from './apiRouter';

const app = express();
const server = http.Server(app);
const io = new SocketIO(server);

// midlleware
app.use(morgan('dev'));
app.use(bodyParser.json());

// connect to MongoDB
mongoose.Promise = global.Promise;
mongoose.connect(config.MONGO_URI, {
  useMongoClient: true,
  keepAlive: true,
});

const db = mongoose.connection;

db.on('error', (err) => {
  console.error(err);
});
db.once('open', () => {
  console.log('Successfully connected to database...'); // eslint-disable-line
  server.listen(config.PORT, () => {
    console.log(`Magic is happening on port ${config.PORT}!`); // eslint-disable-line
  });
});

// routes
app.use(config.API_PREFIX, apiRouter);

// sockets
io.on('connection', (socket) => {
  console.log('someone connected');
  socket.emit('message', 'welcome');
  socket.on('message', (data) => {
    console.log(data);
  });
});

// initialization
