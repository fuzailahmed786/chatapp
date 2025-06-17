const socket = io();
let username = '';

function joinChat() {
  username = document.getElementById("username").value.trim();
  if (!username) return;

  document.getElementById("login").classList.add("hidden");
  document.getElementById("chat").classList.remove("hidden");
  socket.emit('join', username);
}

const input = document.getElementById("msgInput");
const messages = document.getElementById("messages");
const typing = document.getElementById("typing");

let typingTimer;

// Typing
input.addEventListener('input', () => {
  socket.emit('typing');
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => socket.emit('stopTyping'), 1000);
});

// Send message on Enter
input.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    const msg = input.value.trim();
    if (msg) {
      socket.emit('chatMessage', msg);
      input.value = '';
      socket.emit('stopTyping');
    }
  }
});

// Display messages with timestamps
socket.on('message', (data) => {
  const bubble = document.createElement('div');
  bubble.classList.add('chat-bubble');

  if (data.user === 'System') {
    bubble.classList.add('system');
    bubble.textContent = `${data.text}`;
  } else if (data.user === username) {
    bubble.classList.add('self');
    bubble.textContent = `You: ${data.text}`;
  } else {
    bubble.textContent = `${data.user}: ${data.text}`;
  }

  const time = document.createElement('div');
  time.classList.add('timestamp');
  time.textContent = data.time;

  bubble.appendChild(time);
  messages.appendChild(bubble);
  messages.scrollTop = messages.scrollHeight;
});

// Typing indicator
socket.on('typing', (msg) => typing.textContent = msg);
socket.on('stopTyping', () => typing.textContent = '');
