import http from 'http';
import express from 'express';
import mongoose from 'mongoose';
import SocketIO from 'socket.io';
import morgan from 'morgan';
import bodyParser from 'body-parser';

import envCheck from './util/envCheck';
import apiRouter from './util/apiRouter';

// Environment vars check
envCheck();

const app = express();
const server = http.Server(app);
const io = new SocketIO(server);

// midlleware
app.use(morgan('dev')); // 'combined' for prod
app.use(bodyParser.json());

// connect to MongoDB
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URI, {
  user: process.env.MONGO_USERNAME,
  pass: process.env.MONGO_PASSWORD,
  auth: {
    authdb: 'admin',
  },
  useMongoClient: true,
  keepAlive: true,
});

const db = mongoose.connection;

db.on('error', () => {
  console.error('Failed to connect to database!');
});
db.once('open', () => {
  console.log('Successfully connected to database...'); // eslint-disable-line
  const port = process.env.PORT;
  server.listen(port, () => {
    console.log(`Magic is happening on port ${port}!`); // eslint-disable-line
  });
});

// routes
app.use('/', apiRouter);

// sockets
io.on('connection', (socket) => {
  console.log('someone connected');
  socket.emit('message', 'welcome');
  socket.on('message', (data) => {
    console.log(data);
  });
});

// initialization
