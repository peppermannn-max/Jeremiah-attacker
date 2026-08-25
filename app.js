let attacks = globalThis.__jeremiahAttacks || [];
globalThis.__jeremiahAttacks = attacks;
function stats(){
 const now=new Date(),day=new Date(now.getFullYear(),now.getMonth(),now.getDate()),week=new Date(day);week.setDate(day.getDate()-day.getDay());
 const c={}; attacks.forEach(a=>c[a.trigger]=(c[a.trigger]||0)+1);
 return {total:attacks.length,today:attacks.filter(a=>new Date(a.at)>=day).length,week:attacks.filter(a=>new Date(a.at)>=week).length,last:attacks.at(-1)?.at||null,topTrigger:Object.entries(c).sort((a,b)=>b[1]-a[1])[0]?.[0]||null,history:attacks.slice(-20).reverse()};
}
module.exports=(req,res)=>{
 if(req.method==='GET') return res.status(200).json(stats());
 if(req.method==='POST'){
  const allowed=['Breathing','Being Gary','Existing near Jeremiah','Making eye contact','Speaking','Unknown / Jeremiah felt like it'];
  const trigger=allowed.includes(req.body?.trigger)?req.body.trigger:'Unknown / Jeremiah felt like it';
  attacks.push({at:new Date().toISOString(),trigger});globalThis.__jeremiahAttacks=attacks;
  return res.status(201).json(stats());
 }
 res.status(405).json({error:'Method not allowed'});
};