import http from 'http';
import express from 'express';
import SocketIO from 'socket.io';

import envCheck from './util/envCheck'; // eslint-disable-line
import * as pool from './util/pool';

const app = express();
const server = http.Server(app);
const io = new SocketIO(server);

// settings
app.set('trust proxy', true);

// sockets.io handling
io.on('connection', (socket) => {
  // Robot join
  socket.on('robot-join', (robot) => {
    console.log(`Robot ${robot.id} joined!`); // eslint-disable-line
    socket.isRobot = true; // eslint-disable-line
    socket.robot = robot; // eslint-disable-line
    const roomName = `control-${robot.id}`;
    socket.join(roomName);
    socket.broadcast.emit('room-list-update');
  });
  // User join
  socket.on('user-join', (user) => {
    if (!user) {
      socket.emit('user-join-fail', 'You need to pass user object!');
      return;
    }
    console.log(`User ${user.id} joined!`); // eslint-disable-line
    socket.isRobot = false; // eslint-disable-line
    socket.user = user; // eslint-disable-line
  });
  // List rooms
  socket.on('request-room-list', () => {
    if (!socket.isRobot && socket.user) {
      console.log('sending room list'); // eslint-disable-line
      socket.emit('room-list', pool.getAvailableRooms(socket.user));
    } else {
      console.log('sending error with room list'); // eslint-disable-line
      socket.emit('request-room-fail', 'Send \'user-join\' request first!');
    }
  });
  // User join room
  socket.on('user-join-room', (roomName) => {
    if (!socket.user) {
      console.log(`Failed to join room ${roomName} - no user object in request`); // eslint-disable-line
      socket.emit('user-join-room-fail', 'Send \'user-join\' request first!');
      return;
    }
    if (pool.isValidRoom(roomName)) {
      socket.room = roomName; // eslint-disable-line
      socket.join(roomName);
      socket.broadcast.emit('room-list-update');
      console.log(`user joined room: ${roomName}`); // eslint-disable-line
    } else {
      console.log(`Failed to join room ${roomName} - Incorrect room name`); // eslint-disable-line
      socket.emit('user-join-room-fail', 'Incorrect room name!');
    }
  });
  // Send control data
  socket.on('robot-control', (data) => {
    console.log(data); // eslint-disable-line
    io.sockets.in(socket.room).emit('robot-control', data);
  });
  // Join stream room
  socket.on('video-stream-join', robotID => socket.join(`video-stream-${robotID}`));
  // Video stream in, stream out to room
  socket.on('video-stream', (data) => {
    io.sockets.in(`video-stream-${data.robotID}`).emit('video-stream', data.buffer);
  });
  // Disconnect
  socket.on('disconnect', () => {
    socket.broadcast.emit('room-list-update');
  });
});

// start listnening
const port = process.env.PORT
server.listen(port, () => {
  console.log(`Ready to receive robot controls on port ${port}!`); // eslint-disable-line
});
