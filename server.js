const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, 'attacks.json');

app.use(express.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

function loadData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.attacks) ? parsed : { attacks: [] };
  } catch {
    return { attacks: [] };
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

let data = loadData();

function stats() {
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startWeek = new Date(startToday);
  startWeek.setDate(startToday.getDate() - startToday.getDay());
  const attacks = data.attacks;

  return {
    total: attacks.length,
    today: attacks.filter(a => new Date(a.at) >= startToday).length,
    week: attacks.filter(a => new Date(a.at) >= startWeek).length,
    last: attacks.length ? attacks[attacks.length - 1].at : null,
    history: attacks.slice(-20).reverse()
  };
}

app.get('/api/stats', (req, res) => {
  res.json(stats());
});

app.post('/api/attack', (req, res) => {
  const attack = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    at: new Date().toISOString()
  };

  data.attacks.push(attack);
  saveData(data);

  const next = stats();
  io.emit('stats', next);
  io.emit('attack', attack);
  res.status(201).json(next);
});

io.on('connection', socket => {
  socket.emit('stats', stats());
});

server.listen(PORT, () => {
  console.log(`Jeremiah Attack Tracker running on port ${PORT}`);
});
