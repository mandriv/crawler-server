import http from 'http';
import express from 'express';
import mongoose from 'mongoose';
import SocketIO from 'socket.io';
import morgan from 'morgan';
import bodyParser from 'body-parser';

import envCheck from './util/envCheck';
import apiRouter from './util/apiRouter';

import RoomsPool from './sockets/RoomsPool';
import Room from './sockets/Room';

const app = express();
const server = http.Server(app);
const io = new SocketIO(server);

// midlleware
app.use(morgan('combined'));
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

// sockets.io handling
const Pool = new RoomsPool();

io.on('connection', (socket) => {
  // Robot join
  socket.on('robot-join', (robot) => {
    console.log('Robot joined!', robot);
    socket.isRobot = true; // eslint-disable-line
    socket.robot = robot; // eslint-disable-line
    const roomName = `control-${robot.id}`;
    let newRoom = Pool.getRoomByName(roomName);
    if (!newRoom) {
      newRoom = new Room(roomName);
    }
    newRoom.joinRobot(robot);
    Pool.createRoom(newRoom);
    socket.join(roomName);
  });
  // User join
  socket.on('user-join', (roomName, user) => {
    console.log('User joined!', roomName, user);
    socket.isRobot = false; // eslint-disable-line
    socket.user = user; // eslint-disable-line
    const room = Pool.getRoomByName(roomName);
    if (room) {
      room.joinUser(user);
      socket.join(roomName);
    } else {
      socket.emit('user-join-failed', 'Incorrect room name!');
    }
  });
  // List rooms
  socket.on('request-rooms-list', () => {
    if (!socket.isRobot) {
      socket.emit('rooms-list', Pool.getRooms(socket.user));
    }
  });
  // Send control data
  socket.on('robot-control', (data) => {
    io.sockets.in(socket.room).emit('robot-control', data);
  });
  // Disconnect
  socket.on('disconnect', () => {
    let room;
    if (socket.isRobot) {
      room = Pool.findRobotsRoom(socket.robot);
    } else {
      room = Pool.findUsersRoom(socket.user);
    }
    if (room.isEmpty()) {
      Pool.removeRoomById(room.id);
    }
    socket.leave(socket.room.name);
  });
});

// initialization
