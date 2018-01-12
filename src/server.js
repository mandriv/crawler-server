import express from 'express';
import SocketIO from 'socket.io';

const app = express();
const io = new SocketIO(app);
const PORT = process.env.PORT || 3000;

// routes
app.get('/', (req, res) => res.send('Hello World!'));

// sockets
io.on('connection', (socket) => {
  console.log('someone connected');
  socket.emit('message', 'welcome');
  socket.on('message', (data) => {
    console.log(data);
  });
});


app.listen(PORT, () => console.log('Server listening on port 3000!'));
