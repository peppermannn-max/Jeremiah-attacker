const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

/*
  This version works immediately on Vercel, but Vercel's serverless filesystem
  cannot safely store a shared permanent counter. Until a database is connected,
  the API keeps data in memory when the same function instance stays warm.
  We'll connect the free shared database next for true permanent global history.
*/
let attacks = global.__jeremiahAttacks || [];
global.__jeremiahAttacks = attacks;

function getStats() {
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startWeek = new Date(startToday);
  startWeek.setDate(startToday.getDate() - startToday.getDay());

  const counts = {};
  for (const a of attacks) counts[a.trigger] = (counts[a.trigger] || 0) + 1;
  const topTrigger = Object.entries(counts).sort((a,b) => b[1]-a[1])[0]?.[0] || null;

  return {
    total: attacks.length,
    today: attacks.filter(a => new Date(a.at) >= startToday).length,
    week: attacks.filter(a => new Date(a.at) >= startWeek).length,
    last: attacks.length ? attacks[attacks.length - 1].at : null,
    topTrigger,
    history: attacks.slice(-20).reverse()
  };
}

app.get('/api/stats', (req,res) => res.json(getStats()));

app.post('/api/attack', (req,res) => {
  const allowed = [
    'Breathing',
    'Being Gary',
    "Existing within Jeremiah's detection radius",
    'Making eye contact',
    'Unknown / Jeremiah felt like it'
  ];
  const chosen = allowed.includes(req.body?.trigger) ? req.body.trigger : 'Unknown / Jeremiah felt like it';
  attacks.push({id: Date.now().toString(36)+Math.random().toString(36).slice(2,7), at:new Date().toISOString(), trigger:chosen});
  if (attacks.length > 5000) attacks = attacks.slice(-5000);
  global.__jeremiahAttacks = attacks;
  res.status(201).json(getStats());
});

app.get('/', (req,res) => res.sendFile(path.join(__dirname,'index.html')));

module.exports = app;

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Jeremiah tracker running on ${port}`));
}
