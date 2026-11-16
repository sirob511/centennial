import {getSchedule} from './schedule.js';
import {initReversal} from './reversal.js';
const cards=[...document.querySelectorAll('.schedule-card')];
let previousAnnouncement='';
let scheduleResult;
let scheduleComputed=0;

function renderCountdown(clock,remaining,state){
  const days=Math.floor(remaining/86400);
  const withDays=state==='off-season'||days>0;
  const units=withDays?['days','hours','minutes','seconds']:['hours','minutes','seconds'];
  const values=[Math.floor(remaining/3600)%24,Math.floor(remaining%3600/60),remaining%60];
  if(withDays)values.unshift(days);
  const format=withDays?'days':'hours';
  if(clock.dataset.format!==format){
    clock.innerHTML=units.map(unit=>`<span class="countdown-part" aria-hidden="true"><span data-clock-value></span><small>${unit}</small></span>`).join('');
    clock.dataset.format=format;
  }
  clock.querySelectorAll('[data-clock-value]').forEach((element,index)=>{
    element.textContent=String(values[index]).padStart(2,'0');
  });
  const duration=values.map((value,index)=>`${value} ${units[index]}`).join(' ');
  clock.setAttribute('aria-label',`${duration} ${state==='spraying'?'remaining in the scheduled cannon firing window':'until the next scheduled cannon firing'}`);
}

function updateSchedule(){
  const now=new Date();
  if(!scheduleResult||now-scheduleComputed>15000||+scheduleResult.targetAt<=+now){
    scheduleResult=getSchedule(now);
    scheduleComputed=+now;
  }
  const r=scheduleResult;
  const remaining=r.targetAt?Math.max(0,Math.ceil((r.targetAt-now)/1000)):null;
  const label=r.state==='spraying'?'Cannon firing window ends in':r.state==='off-season'?'Water cannon returns in':r.state==='closed'?'Water cannon on pause':'Next cannon firing';
  const nextTime=r.state==='spraying'?'Five-minute scheduled window · Chicago time':r.state==='closed'?`${r.reason} Next: ${r.nextLabel}`:r.state==='off-season'?`Season opens ${r.dateLabel} · ${r.timeLabel}`:`${r.nextLabel} · Chicago time`;
  const announcement=r.state==='spraying'?'Within a scheduled cannon firing window. This is not live operating status.':r.state==='closed'?`Scheduled closure. ${nextTime}`:`${label}. ${nextTime}. Based on the operator’s schedule.`;
  for(const card of cards){
    card.dataset.scheduleState=r.state;
    card.querySelector('[data-state]').textContent=r.state==='off-season'?'Off-season · back in May':r.state==='closed'?'Scheduled closure':r.state==='spraying'?'Within a scheduled firing window':'The water cannon countdown';
    card.querySelector('[data-schedule-label]').textContent=card.classList.contains('schedule-compact')
      ? r.state==='spraying'?'Firing window ends in:':r.state==='off-season'?'Water cannon returns in:':r.state==='closed'?'Water cannon on pause':'Water cannon fires in:'
      : label;
    const clock=card.querySelector('[data-countdown]');
    if(r.state==='closed'||remaining===null){
      clock.dataset.format='message';
      clock.textContent=r.state==='closed'?'Temporarily closed':'Check with MWRD';
      clock.setAttribute('aria-label',r.reason||'Check the operator’s schedule');
    }else renderCountdown(clock,remaining,r.state);
    card.querySelector('[data-next-time]').textContent=nextTime;
    if(announcement!==previousAnnouncement)card.querySelector('[data-schedule-announcement]').textContent=announcement;
  }
  previousAnnouncement=announcement;
}
if(cards.length){
  updateSchedule();
  setInterval(()=>{if(!document.hidden)updateSchedule()},1000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateSchedule()});
}
const cannon=document.querySelector('[data-cannon]');if(cannon)import('./cannon.js').then(({initCannon})=>initCannon(cannon)).catch(()=>{cannon.innerHTML='<p class="js-fallback">The cannon game could not load. Refresh to try again.</p>'});
const explorers=[...document.querySelectorAll('[data-hotspots]')];
if(explorers.length)import('./hotspots.js').then(({initHotspots})=>explorers.forEach(initHotspots));
initReversal();

async function revealLinkedDetails(){
  if((location.pathname==='/'||location.pathname==='/index.html')&&location.hash==='#cannon'){
    location.replace('/play/');
    return;
  }
  const target=document.getElementById(location.hash.slice(1));
  if(target?.tagName!=='DETAILS')return;
  target.open=true;
  await document.fonts.ready;
  requestAnimationFrame(()=>{
    if(location.hash.slice(1)===target.id)target.scrollIntoView({block:'start',behavior:'instant'});
  });
}
revealLinkedDetails();
window.addEventListener('hashchange',revealLinkedDetails);
