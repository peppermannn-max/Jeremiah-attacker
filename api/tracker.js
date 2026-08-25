let attacks = globalThis.__jeremiahAttacks || [];
globalThis.__jeremiahAttacks = attacks;

function getStats(){
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const week = new Date(today);
  week.setDate(today.getDate() - today.getDay());

  const counts = {};

  attacks.forEach(a => {
    counts[a.trigger] = (counts[a.trigger] || 0) + 1;
  });

  return {
    total: attacks.length,
    today: attacks.filter(a => new Date(a.at) >= today).length,
    week: attacks.filter(a => new Date(a.at) >= week).length,
    last: attacks.length ? attacks[attacks.length - 1].at : null,
    topTrigger: Object.entries(counts)
      .sort((a,b) => b[1] - a[1])[0]?.[0] || null,
    history: attacks.slice(-20).reverse()
  };
}

module.exports = (req,res) => {

  if(req.method === 'GET'){
    return res.status(200).json(getStats());
  }

  if(req.method === 'POST'){

    const allowed = [
      'Breathing',
      'Being Gary',
      'Existing near Jeremiah',
      'Making eye contact',
      'Speaking',
      'Unknown / Jeremiah felt like it'
    ];

    const trigger = allowed.includes(req.body?.trigger)
      ? req.body.trigger
      : 'Unknown / Jeremiah felt like it';

    attacks.push({
      at: new Date().toISOString(),
      trigger
    });

    globalThis.__jeremiahAttacks = attacks;

    return res.status(201).json(getStats());
  }

  return res.status(405).json({
    error:'Method not allowed'
  });
};
