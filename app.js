const $ = (id) => document.getElementById(id);
const total = $('total'), today = $('today'), week = $('week'), last = $('last');
const topTrigger = $('topTrigger'), history = $('history'), button = $('attackButton');
const trigger = $('trigger'), flash = $('flash'), status = $('status');

function niceTime(value) {
  if (!value) return 'Never';
  return new Date(value).toLocaleString([], {month:'short', day:'numeric', hour:'numeric', minute:'2-digit'});
}

function render(data) {
  total.textContent = data.total ?? 0;
  today.textContent = data.today ?? 0;
  week.textContent = data.week ?? 0;
  topTrigger.textContent = data.topTrigger || '—';
  last.textContent = 'Last attack: ' + niceTime(data.last);

  if (!data.history || !data.history.length) {
    history.innerHTML = '<p class="empty">No attacks recorded yet. The peace is suspicious.</p>';
    return;
  }
  history.innerHTML = data.history.map((a, i) => `
    <div class="incident">
      <div class="num">#${(data.total || 0) - i}</div>
      <div><strong>${escapeHtml(a.trigger || 'Unknown trigger')}</strong><small>${niceTime(a.at)}</small></div>
    </div>`).join('');
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

async function refresh() {
  try {
    const r = await fetch('/api/stats', {cache:'no-store'});
    if (!r.ok) throw new Error();
    render(await r.json());
    status.textContent = 'SYSTEM ARMED • STAY VIGILANT';
  } catch {
    status.textContent = 'CONNECTION ISSUE • RETRYING';
  }
}

button.addEventListener('click', async () => {
  button.disabled = true;
  button.classList.add('pressed');
  status.textContent = 'LOGGING JEREMIAH INCIDENT…';
  try {
    const r = await fetch('/api/attack', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({trigger:trigger.value})
    });
    if (!r.ok) throw new Error();
    render(await r.json());
    flash.classList.add('show');
    setTimeout(() => flash.classList.remove('show'), 1500);
    status.textContent = 'ATTACK CONFIRMED • INCIDENT LOGGED';
  } catch {
    status.textContent = 'FAILED TO LOG • TRY AGAIN';
    alert('The attack could not be recorded. We still know what Jeremiah did.');
  } finally {
    setTimeout(() => { button.disabled = false; button.classList.remove('pressed'); }, 350);
  }
});

refresh();
setInterval(refresh, 5000);
