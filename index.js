const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let users = {};

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

io.on('connection', (socket) => {
  socket.on('join', (username) => {
    users[socket.id] = username;
    io.emit('message', {
      user: 'System',
      text: `${username} joined the chat.`,
      time: formatTime(new Date())
    });
    io.emit('userList', Object.values(users));
  });

  socket.on('chatMessage', (msg) => {
    io.emit('message', {
      user: users[socket.id],
      text: msg,
      time: formatTime(new Date())
    });
  });

  socket.on('typing', () => {
    socket.broadcast.emit('typing', `${users[socket.id]} is typing...`);
  });

  socket.on('stopTyping', () => {
    socket.broadcast.emit('stopTyping');
  });

  socket.on('disconnect', () => {
    const username = users[socket.id];
    if (username) {
      io.emit('message', {
        user: 'System',
        text: `${username} left the chat.`,
        time: formatTime(new Date())
      });
      delete users[socket.id];
      io.emit('userList', Object.values(users));
    }
  });
});

server.listen(3000, () => console.log("Server running on http://localhost:3000"));
