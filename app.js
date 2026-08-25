const socket = io();
const $ = id => document.getElementById(id);
const total = $('total'), today = $('today'), week = $('week'), last = $('last');
const history = $('history'), btn = $('attackBtn'), status = $('status'), flash = $('flash');

function fmt(iso) {
  if (!iso) return 'Never';
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return new Intl.DateTimeFormat(undefined, sameDay ? {hour:'numeric',minute:'2-digit'} : {month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}).format(d);
}
function render(s) {
  total.textContent = s.total;
  today.textContent = s.today;
  week.textContent = s.week;
  last.textContent = fmt(s.last);
  history.innerHTML = s.history.length ? s.history.map((a,i)=>`<div class="row"><strong>Attack #${s.total-i}</strong><time datetime="${a.at}">${fmt(a.at)}</time></div>`).join('') : '<p class="empty">No attacks recorded yet. Stay vigilant.</p>';
}
function alertFlash() {
  flash.classList.remove('go'); void flash.offsetWidth; flash.classList.add('go');
}
socket.on('stats', render);
socket.on('attack', () => { alertFlash(); status.textContent = '🚨 ATTACK RECORDED — everyone has been updated.'; });

btn.addEventListener('click', async () => {
  btn.disabled = true; status.textContent = 'Recording attack…';
  try {
    const r = await fetch('/api/attack', {method:'POST',headers:{'Content-Type':'application/json'}});
    if (!r.ok) throw new Error('Request failed');
    render(await r.json()); alertFlash(); status.textContent = '🚨 ATTACK RECORDED.';
  } catch { status.textContent = 'Could not record it. Try again.'; }
  finally { setTimeout(()=>btn.disabled=false,500); }
});

fetch('/api/stats').then(r=>r.json()).then(render).catch(()=>status.textContent='Connecting…');
