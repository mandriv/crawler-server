import http from 'http';
import express from 'express';
import mongoose from 'mongoose';
import SocketIO from 'socket.io';
import morgan from 'morgan';
import bodyParser from 'body-parser';

import envCheck from './util/envCheck'; // eslint-disable-line
import apiRouter from './util/apiRouter';

import RoomsPool from './sockets/RoomsPool';
import Room from './sockets/Room';

const app = express();
const server = http.Server(app);
const io = new SocketIO(server);

// settings
app.set('trust proxy', true);

// midlleware
app.use(bodyParser.json());
app.use(morgan('combined'));

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
const pool = new RoomsPool();

io.on('connection', (socket) => {
  // Robot join
  socket.on('robot-join', (robot) => {
    console.log(`Robot ${robot.id} joined!`);
    socket.isRobot = true; // eslint-disable-line
    socket.robot = robot; // eslint-disable-line
    const roomName = `control-${robot.id}`;
    let newRoom = pool.getRoomByName(roomName);
    if (!newRoom) {
      newRoom = new Room(roomName);
    }
    newRoom.joinRobot(robot);
    pool.createRoom(newRoom);
    socket.join(roomName);
    socket.broadcast.emit('room-list-update');
  });
  // User join
  socket.on('user-join', (user) => {
    if (!user) {
      socket.emit('user-join-fail', 'You need to pass user object!');
      return;
    }
    console.log(`User ${user.id} joined!`);
    socket.isRobot = false; // eslint-disarsble-line
    socket.user = user; // eslint-disable-line
  });
  // List rooms
  socket.on('request-room-list', () => {
    if (!socket.isRobot && socket.user) {
      console.log('sending room list');
      socket.emit('room-list', pool.getAvailableRooms(socket.user));
    } else {
      console.log('sending error with room list');
      socket.emit('request-room-fail', 'Send \'user-join\' request first!');
    }
  });
  // User join room
  socket.on('user-join-room', (roomName) => {
    if (!socket.user) {
      socket.emit('user-join-room-fail', 'Send \'user-join\' request first!');
      return;
    }
    const room = pool.getRoomByName(roomName);
    if (room) {
      room.joinUser(socket.user);
      socket.join(roomName);
      socket.room = roomName; // eslint-disable-line
      socket.broadcast.emit('room-list-update');
      console.log(`user joined room: ${roomName}`);
    } else {
      socket.emit('user-join-room-fail', 'Incorrect room name!');
    }
  });
  // Send control data
  socket.on('robot-control', (data) => {
    console.log(socket.room);
    console.log(data);
    io.sockets.in(socket.room).emit('robot-control', data);
  });
  // Disconnect
  socket.on('disconnect', () => {
    let room;
    if (socket.isRobot && socket.robot && socket.robot.id) {
      console.log(`Robot ${socket.robot.id} leaving`);
      room = pool.findRobotsRoom(socket.robot);
      if (room) {
        room.leaveRobot();
      }
    } else if (!socket.isRobot && socket.user && socket.user.id) {
      console.log(`User ${socket.user.id} leaving`);
      room = pool.findUsersRoom(socket.user);
      if (room) {
        room.leaveUser();
      }
    }
    if (room && room.isEmpty()) {
      pool.removeRoomById(room.id);
      socket.leave(room.name);
    }
    socket.broadcast.emit('room-list-update');
  });
});

// initialization
