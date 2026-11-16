let instance=0;
const css=`
.cannon-shell{--game-gold:#ffe17a;--game-ink:#102f3d;position:relative;overflow:hidden;border:1px solid #214956;border-radius:18px;background:#102f3d;color:#f7f6e9;box-shadow:0 20px 55px #15323d16}.cannon-shell button{font-family:inherit}.cannon-scene{position:relative;aspect-ratio:1200/540;overflow:hidden;background:#193b50}.cannon-scene-art,.cannon-scene-art>svg{display:block;width:100%;height:100%}.cannon-hud{position:absolute;inset:20px 24px auto;display:flex;justify-content:space-between;align-items:center;gap:16px;pointer-events:none}.cannon-score{display:flex;align-items:center;gap:9px;padding:10px 15px;border:1px solid #f8f4d829;border-radius:30px;background:#103243d9;backdrop-filter:blur(9px);color:var(--game-gold);font-size:12px;font-weight:650;line-height:1.3;font-variant-numeric:tabular-nums}.cannon-score svg{width:19px;height:19px}.cannon-score strong{font-size:19px;color:#fff2b8}.cannon-score-label{color:#d2e3de;font-size:11px}.cannon-motion{pointer-events:auto;display:grid;place-items:center;width:44px;height:44px;padding:11px;border:1px solid #f8f4d82e;border-radius:50%;background:#103243c9;color:#d2e5df;cursor:pointer;backdrop-filter:blur(9px)}.cannon-motion svg{width:18px;height:18px}.cannon-motion:hover{background:#285363;color:#fff}.cannon-motion:disabled{opacity:.5;cursor:default}.cannon-controls{display:flex;align-items:center;justify-content:center;gap:22px;padding:19px 24px;background:#102f3d;border-top:1px solid #89b9b424}.cannon-fire{position:relative;isolation:isolate;display:flex;align-items:center;justify-content:center;gap:13px;overflow:hidden;min-width:200px;min-height:62px;border:1px solid #ffe17a;border-radius:999px;padding:13px 38px;background:var(--game-gold);color:#102f3d;font-size:23px;font-weight:750;line-height:1.2;cursor:pointer;box-shadow:0 4px 0 #bba34d;transition:transform .15s,box-shadow .15s,background .15s}.cannon-fire svg{height:25px;width:25px}.cannon-fire:before{content:'';position:absolute;inset:0;z-index:-1;background:#fff3b0;transform:scaleX(var(--charge,0));transform-origin:left}.cannon-fire:hover{background:#ffeb9e;transform:translateY(-2px);box-shadow:0 6px 0 #bba34d,0 0 35px #ffe17a25}.cannon-fire:active{transform:translateY(2px);box-shadow:0 2px 0 #bba34d}.cannon-fire[aria-disabled=true]{background:#c4ae64;border-color:#c4ae64;box-shadow:0 3px 0 #817448;cursor:default;transform:none}.cannon-fire:focus-visible,.cannon-motion:focus-visible,.cannon-advance:focus-visible{outline:3px solid #ff8a69;outline-offset:4px}.cannon-status{position:absolute;right:24px;display:flex;align-items:center;gap:7px;color:#bad1d2;font-size:11px;line-height:1.4;white-space:nowrap}.cannon-dot{height:6px;width:6px;border-radius:50%;background:#82b9b5}.cannon-shell[data-water-contact=boat] [data-splash]>path{stroke-width:2;opacity:.95}.cannon-shell[data-phase=firing] .cannon-dot{background:#ffe17a;box-shadow:0 0 12px #ffe17a}.cannon-advance{min-height:48px;padding:10px 15px;border:1px solid #729aa566;border-radius:99px;background:#1c4655;color:#e3eeeb;font-size:12px;cursor:pointer}.cannon-advance:hover{background:#285a69}.cannon-advance[hidden]{display:none}.cannon-result{position:absolute;transform:translate(-50%,-100%);display:flex;align-items:center;gap:8px;padding:9px 14px;border-radius:99px;white-space:nowrap;pointer-events:none;background:#ffe17a;color:#143742;box-shadow:0 5px 20px #09243040;font-size:18px;font-weight:750;letter-spacing:-.03em}.cannon-result[hidden]{display:none}.cannon-result span{display:grid;place-items:center;border-left:1px solid #14374230;padding-left:8px;font-size:16px}.cannon-shell[data-result=hit] .cannon-result{animation:cannon-hit .4s both}.cannon-shell[data-result=miss] .cannon-result{background:#d9e8e4b8;font-size:13px;color:#204653}.cannon-shell[data-result=miss] .cannon-result span{display:none}.cannon-shell[data-compact=true] .cannon-scene{aspect-ratio:720/650}.cannon-shell[data-compact=true] .cannon-hud{inset:13px 13px auto}.cannon-shell[data-compact=true] .cannon-score{padding:8px 12px;gap:7px}.cannon-shell[data-compact=true] .cannon-controls{gap:10px;padding:16px 13px 18px}.cannon-shell[data-compact=true] .cannon-fire{min-width:0;flex:1;max-width:245px;min-height:58px;padding:12px 24px;font-size:22px}.cannon-shell[data-compact=true] .cannon-status{display:none}.cannon-shell[data-compact=true] .cannon-result{font-size:15px;padding:8px 12px}.cannon-shell[data-compact=true] .cannon-result span{font-size:14px}.cannon-shell[data-manual=true] .cannon-status{display:none}
@keyframes cannon-hit{0%{opacity:0;transform:translate(-50%,-75%) scale(.6)}70%{opacity:1;transform:translate(-50%,-105%) scale(1.06)}100%{transform:translate(-50%,-100%) scale(1)}}
@media(prefers-reduced-motion:reduce){.cannon-shell *{animation:none!important;transition:none!important}}
`;
const clamp=(v,min=0,max=1)=>Math.min(max,Math.max(min,v));
const ease=v=>{v=clamp(v);return v*v*(3-2*v)};
function scene(id,compact=false){
const arc=compact?[167.5,418.6,220,110,460,170,650,515]:[225,298,397,52,741,81,1040,410];
const windows=(x,y,cols,rows,dx=12,dy=12,color='#ffe4a0')=>Array.from({length:cols*rows},(_,i)=>`<rect x="${x+i%cols*dx}" y="${y+Math.floor(i/cols)*dy}" width="3" height="5" fill="${color}" opacity=".45"/>`).join('');
const ripples=Array.from({length:55},(_,i)=>{const x=(i*173+59)%1190,y=323+(i*41)%211,l=18+(i*19)%91;return `<path d="M${x} ${y}q${l*.24} -2 ${l*.5} 0t${l*.5} 0" fill="none" stroke="${i%3?'#b4d2cd':'#164b5a'}" stroke-width="${i%4?1:1.7}" opacity="${i%3?.27:.18}"/>`}).join('');
const arcs=Array.from({length:12},(_,i)=>{const o=(i-5.5)*.9;return `<path data-stream d="M${arc[0]} ${arc[1]+o*.15}C${arc[2]+o*.3} ${arc[3]+o},${arc[4]-o} ${arc[5]+o*2},${arc[6]+o*1.4} ${arc[7]+o*1.1}" pathLength="100" fill="none" stroke="${i%3?'#f2faf5':'#b2dfe0'}" stroke-width="${i===5?3:1.1}" stroke-linecap="round" opacity="${i===5?.87:.38}" stroke-dasharray="0 101"/>`}).join('');
const drops=Array.from({length:95},(_,i)=>`<ellipse data-drop cx="225" cy="298" rx="${.7+i%4*.19}" ry="${1.2+i%5*.22}" fill="#f5ffff" opacity="0"/>`).join('');
return `<svg viewBox="0 0 ${compact?720:1200} ${compact?650:540}" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">Fire the Centennial Fountain water cannon</title><desc id="${id}-desc">An illustrated north-bank stone fountain at the left, Chicago skyline and passing tour boat. Fire water onto passing boats. Each boat splashed earns a point. The fire button is below the river.</desc><defs><linearGradient id="${id}-sky" x2=".2" y2="1"><stop stop-color="#153347"/><stop offset="1" stop-color="#b6c7b2"/></linearGradient><linearGradient id="${id}-river" x2=".2" y2="1"><stop stop-color="#347b81"/><stop offset=".4" stop-color="#235e6e"/><stop offset="1" stop-color="#123f53"/></linearGradient><linearGradient id="${id}-glass" x2="1" y2=".1"><stop stop-color="#477780"/><stop offset=".45" stop-color="#749b9b"/><stop offset="1" stop-color="#365f72"/></linearGradient><linearGradient id="${id}-reflect" x2="0" y2="1"><stop stop-color="#284d5c" stop-opacity=".19"/><stop offset="1" stop-color="#284d5c" stop-opacity="0"/></linearGradient><filter id="${id}-glow" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="5"/></filter></defs>
<rect width="1200" height="650" fill="url(#${id}-sky)"/><circle cx="1037" cy="87" r="38" fill="#fff9df" opacity=".65"/><g fill="none" stroke="#fffdf0" stroke-width="12" stroke-linecap="round" opacity=".26"><path d="M68 109h113m43 0h41M408 79h107m24 0h20M1003 173h127"/></g><g fill="none" stroke="#718d90" stroke-width="1.5" opacity=".65"><path d="M341 111q7-5 14 0q6-5 13 0M380 94q5-4 10 0q5-4 10 0"/></g>
<g transform="${compact?'translate(-420 60)':'translate(0 0)'}"><g fill="#4e787e"><path d="M0 221h58v-36h31v25h32v-53h41v27h30v-45h53v40h32v-37h27v45h45v-68h36v34h31v-19h28v31h36v-50h41v32h29v-68h30v38h31v-19h36v-43h25v103H0Z"/><path d="M1024 225h36v-43h29v-29h39v35h25v-79h47v186h-176Z"/></g><g fill="#385e6d" opacity=".52"><path d="M24 238h75v-62h26v91H24ZM276 248h69v-84h40v112H276ZM448 244h91v-45h53v83H448Z"/></g>
<g><path d="M607 287V204h18v-22h12v-32h9v-27h10l5-23 5 23h10v27h9v32h12v22h16v83Z" fill="#9eb2a0"/><path d="M661 100l5 23h10v27h9v32h12v22h16v83h-40V151h-12Z" fill="#6c8d87"/><path d="M642 151h39M633 181h57M624 204h78" stroke="#eff0dd" stroke-width="3"/><circle cx="660" cy="169" r="10" fill="#f4efd9" stroke="#94a59c" stroke-width="1.5"/><path d="M660 162v7l5 3" fill="none" stroke="#657c79" stroke-width="1.5"/>${windows(638,216,5,6,10,11,'#f4d996')}<rect x="608" y="278" width="105" height="9" fill="#adb6a8"/></g>
<g><path d="M727 288V160h9v-23h8v-21l6-10 6 10v21h12v-21l7-16 7 16v21h12v-21l6-10 6 10v21h8v23h9v128Z" fill="#527f83"/><path d="M779 137h15v-21l6-10 6 10v21h8v23h9v128h-44Z" fill="#3d6973"/><path d="M737 160l13-30 11 30 14-28 14 28 11-30 13 30" fill="none" stroke="#c8cec0" stroke-width="3"/>${windows(741,176,6,9,12,12,'#ffe3a0')}<path d="M735 171v108m13-108v108m13-108v108m13-108v108m13-108v108m13-108v108m13-108v108" stroke="#d2d4c2" opacity=".35"/></g>
<g><path d="M848 288V166h12V94h13V69h26V46h3v23h24v25h13v72h14v122Z" fill="url(#${id}-glass)"/><path d="M901 46V26" stroke="#68818b" stroke-width="2"/><path d="M860 104h79M860 120h79M860 136h79M860 152h79M849 179h104M849 197h104M849 215h104M849 233h104M849 251h104M849 269h104" stroke="#d1dad0" opacity=".55"/><path d="M879 73v213m14-213v213m14-213v213m14-213v213" stroke="#d8dfd5" opacity=".4"/><path d="M848 166h105" stroke="#5a7b87" stroke-width="3"/></g>
<g><path d="M969 287V188h75v99Z" fill="#376975"/>${windows(979,201,5,6,12,12,'#ffdf92')}<path d="M1059 287V155h66v132Z" fill="#2c5c6d"/><path d="M1070 164v116m11-116v116m11-116v116m11-116v116m11-116v116" stroke="#c2d0c8" stroke-width="2" opacity=".29"/><path d="M1140 287V214h60v73Z" fill="#658886"/>${windows(1150,224,4,5)}<path d="M375 285V230h84v55Z" fill="#376e76"/>${windows(386,240,6,3,11)}<path d="M477 285V211h103v74Z" fill="#608b8a"/>${windows(489,224,7,4)}</g>
<path d="M0 279H1200v28H0Z" fill="#a8bfa7"/><path d="M0 279H1200v6H0Z" fill="#efdaa6"/><path d="M0 303H1200v6H0Z" fill="#657e7c"/><g fill="#315c62"><circle cx="298" cy="263" r="17"/><circle cx="321" cy="266" r="12"/><circle cx="347" cy="262" r="18"/><circle cx="369" cy="266" r="11"/><circle cx="565" cy="263" r="15"/><circle cx="589" cy="268" r="10"/><circle cx="998" cy="264" r="16"/><circle cx="1020" cy="269" r="11"/><circle cx="1177" cy="265" r="17"/></g><path d="M280 289H1200M280 295H1200" stroke="#9eaa98" opacity=".65"/>
</g><rect y="${compact?369:309}" width="1200" height="350" fill="url(#${id}-river)"/><g fill="url(#${id}-reflect)"><path d="M612 309h101l-14 141h-73Z"/><path d="M729 309h95l-9 122h-78Z"/><path d="M848 309h107l-24 180h-62Z"/><path d="M1060 309h66l-9 100h-48Z"/></g><path d="M0 321q196-13 387 1t387 0 426 3" fill="none" stroke="#b0c8ba" stroke-width="2" opacity=".5"/><path d="M0 453q170-20 384-6t408-3 408-2V540H0Z" fill="#174455" opacity=".3"/><g data-ripples>${ripples}</g>
<g data-boat transform="translate(853 337)"><path d="M-28 93q91-8 183 0t126 0" fill="none" stroke="#bad8d3" stroke-width="2" opacity=".58"/><path d="M-39 101q102-7 208 0t124 0" fill="none" stroke="#9ec7c5" opacity=".35"/><path d="M0 60h254l-25 29H28Z" fill="#f3f0dc"/><path d="M8 68h237l-8 8H16Z" fill="#ed875f"/><path d="M28 89h201" stroke="#244a59" stroke-width="4"/><path d="M30 38h181l21 23H24Z" fill="#edf0df"/><path d="M44 42h25v14H40Zm31 0h24v14H75Zm30 0h24v14h-24Zm30 0h24v14h-24Zm30 0h24v14h-24Zm30 0h13l13 14h-26Z" fill="#255467"/><path d="M38 29h156l20 9H28Z" fill="#e9e8d5"/><path d="M35 28h160M44 17v12m29-12v12m29-12v12m29-12v12m29-12v12m29-12v12M44 20h145" fill="none" stroke="#8fa79e"/><g fill="#264b59"><circle cx="62" cy="19" r="3"/><path d="M58 28v-5q4-5 8 0v5Z"/><circle cx="89" cy="18" r="3"/><path d="M85 28v-6q4-4 8 0v6Z"/><circle cx="118" cy="20" r="3"/><path d="M114 28v-4q4-4 8 0v4Z"/><circle cx="151" cy="18" r="3"/><path d="M147 28v-6q4-4 8 0v6Z"/><circle cx="175" cy="19" r="3"/><path d="M171 28v-5q4-4 8 0v5Z"/></g><path d="M211 11v28" stroke="#42656e" stroke-width="1.5"/><path d="M212 12h15l-5 5 5 5h-15Z" fill="#e4795c"/><g data-boat-wet opacity="0"><path d="M30 38h181l21 23H24Z" fill="#8be0e3" fill-opacity=".28"/><path d="M36 31h158M35 62h191" stroke="#b9f5f0" stroke-width="3" stroke-linecap="round"/><path d="M49 34v11m26-11v7m36-7v13m38-13v8m35-8v12M63 64v12m53-12v9m67-9v13" stroke="#b5f5f1" stroke-width="2.5" stroke-linecap="round" opacity=".8"/></g></g>
<g transform="${compact?'translate(10 210) scale(.7)':'translate(0 0)'}"><path d="M0 398l112-32 150 35 46 32L0 526Z" fill="#82958b"/><path d="M0 398l112-32 150 35 18 15L0 489Z" fill="#dbd9bf"/><path d="M0 416l130-37 126 30" fill="none" stroke="#eee8d1" stroke-width="3"/><path d="M0 477l280-61v16L0 500Z" fill="#9aaa99"/><path d="M0 489l280-61" stroke="#c8cfb7" stroke-width="2"/><path d="M0 444l246-52M50 384l156 52M104 370l143 55" stroke="#a6b39f" opacity=".6"/>
<ellipse cx="132" cy="400" rx="126" ry="28" fill="#667f78" opacity=".3"/><path d="M23 381q107-47 222 0v17q-107 47-222 0Z" fill="#82978c"/><ellipse cx="134" cy="381" rx="111" ry="29" fill="#c3c9b5"/><ellipse cx="134" cy="381" rx="97" ry="23" fill="#537f7d"/><path d="M49 367q84-38 171 0v19q-81 35-171 0Z" fill="#93a497"/><ellipse cx="134" cy="367" rx="86" ry="24" fill="#d4d5be"/><path d="M70 351q64-29 129 0v18q-63 31-129 0Z" fill="#8a9e92"/><ellipse cx="134" cy="351" rx="65" ry="20" fill="#bec8b3"/><path d="M91 330q44-20 87 0v23q-41 23-87 0Z" fill="#aeb8a6"/><ellipse cx="134" cy="330" rx="43" ry="13" fill="#d3d5be"/><path d="M114 285h41v49q-19 11-41 0Z" fill="#b1bcaa"/><path d="M155 285l20-6v51l-20 4Z" fill="#879e92"/><path d="M114 285l20-7 41 1-20 6Z" fill="#e0dec5"/><path d="M159 309l52-27 23 10-48 33Z" fill="#d1d4bf"/><path d="M186 325l48-33v16l-48 32Z" fill="#8a9f93"/><path d="M159 309l27 16v15l-27-15Z" fill="#afbeaa"/><path d="M219 297l11-6 9 6-10 7Z" fill="#486d6b"/><path d="M40 383q93 31 187 0M65 369q70 22 137 0M85 353q49 16 97 0" fill="none" stroke="#eef0d9" stroke-width="1.4" opacity=".7"/>
<g><path d="M190 295v-11m22 0v-1" stroke="#566e66" stroke-width="3"/><circle cx="190" cy="282" r="6.2" fill="#5a6f66"/><circle cx="212" cy="276" r="6.2" fill="#5a6f66"/><circle data-glow cx="190" cy="282" r="9" fill="#fa654d" opacity="0" filter="url(#${id}-glow)"/><circle data-glow cx="212" cy="276" r="9" fill="#fa654d" opacity="0" filter="url(#${id}-glow)"/><circle data-lamp cx="190" cy="282" r="4.1" fill="#8c4e41"/><circle data-lamp cx="212" cy="276" r="4.1" fill="#8c4e41"/></g>
</g><g data-water opacity="0">${arcs}${drops}<g data-splash opacity="0" transform="${compact?'translate(-390 103)':'translate(0 0)'}"><ellipse cx="1040" cy="412" rx="31" ry="5" fill="#d0ece7" opacity=".3"/><ellipse data-ring cx="1040" cy="412" rx="37" ry="7" fill="none" stroke="#c1e0dc" stroke-width="1.4" opacity=".55"/>${Array.from({length:12},(_,i)=>`<path d="M1040 410q${(i-5.5)*4} -${10+i%4*5} ${(i-5.5)*8} 1" fill="none" stroke="#d7eeee" stroke-width="${i%3?1:1.6}" opacity=".6"/>`).join('')}</g></g></svg>`;
}
const fireIcon='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2v6m0 8v6M2 12h6m8 0h6M5 5l4 4m6 6 4 4M5 19l4-4m6-6 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const pauseIcon='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
const playIcon='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m8 4 13 8-13 8Z"/></svg>';
export function initCannon(root){
  root.__destroy?.();
  if(!document.getElementById('cannon-styles')){
    const style=document.createElement('style');style.id='cannon-styles';style.textContent=css;document.head.append(style);
  }
  const id=`cannon-${++instance}`;
  let compact=root.clientWidth<600;
  root.innerHTML=`<div class="cannon-shell" data-compact="${compact}" data-round="1" data-hit="false" data-phase="ready">
    <div class="cannon-scene"><div class="cannon-scene-art">${scene(id,compact)}</div>
      <div class="cannon-hud"><span class="cannon-score" aria-label="Boats splashed: 0"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C9 7 4 11 4 15a8 8 0 0 0 16 0c0-4-5-8-8-13Z"/></svg><strong data-score>0</strong><span class="cannon-score-label">splashed</span></span><button class="cannon-motion" data-motion aria-pressed="false" aria-label="Pause boat motion" title="Pause boat motion">${pauseIcon}</button></div>
      <div class="cannon-result" data-result-panel hidden aria-hidden="true"><strong data-result-title>Splash!</strong><span>+1</span></div>
    </div>
    <div class="cannon-controls"><button class="cannon-fire" data-fire aria-label="Fire the water cannon" aria-disabled="false">${fireIcon}Fire!</button><button class="cannon-advance" data-advance hidden aria-label="Move the boat forward">Move boat <span aria-hidden="true">←</span></button><span class="cannon-status" aria-hidden="true"><span class="cannon-dot"></span><span data-status>Ready</span></span></div>
    <span class="sr-only" data-announcement role="status" aria-live="polite" aria-atomic="true"></span></div>`;
  const q=selector=>root.querySelector(selector),all=selector=>[...root.querySelectorAll(selector)];
  const el={shell:q('.cannon-shell'),scene:q('.cannon-scene-art'),fire:q('[data-fire]'),advance:q('[data-advance]'),announce:q('[data-announcement]'),status:q('[data-status]'),motion:q('[data-motion]'),score:q('[data-score]'),scoreLabel:q('.cannon-score'),result:q('[data-result-panel]'),resultTitle:q('[data-result-title]')};
  const game={time:0,round:1,score:0,shot:null,feedbackUntil:0,feedbackBoat:null,boats:[{id:1,center:1250,hit:false,miss:false}]};
  function attachBoat(boat){
    boat.node=el.boatTemplate.cloneNode(true);boat.node.dataset.boatId=String(boat.id);
    boat.wet=boat.node.querySelector('[data-boat-wet]');el.boats.append(boat.node);
  }
  function readScene(){
    el.boatTemplate=q('[data-boat]');el.boats=document.createElementNS('http://www.w3.org/2000/svg','g');el.boats.dataset.boats='';
    el.boatTemplate.replaceWith(el.boats);game.boats.forEach(attachBoat);
    for(const key of ['water','splash','ring','ripples'])el[key]=q(`[data-${key}]`);
    for(const [key,selector] of [['lamps','lamp'],['glows','glow'],['streams','stream'],['drops','drop']])el[key]=all(`[data-${selector}]`);
  }
  readScene();
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  let reduced=media.matches,manualPause=false,frame=0,destroyed=false,visible=false,lastTick=performance.now();
  const still=()=>reduced||manualPause;
  const announce=text=>el.announce.textContent=text;
  const shotAge=()=>game.shot===null?Infinity:game.time-game.shot;
  function power(){
    const age=shotAge();
    if(age>=1400)return 0;
    if(still())return age<1150?1:0;
    return age<220?ease(age/220):age<1050?1:1-ease((age-1050)/350);
  }
  function waterPoint(t,offset=0){
    const p=compact?[167.5,418.6,220,110,460,170,650,515]:[225,298,397,52,741,81,1040,410],u=1-t;
    return {x:u*u*u*p[0]+3*u*u*t*p[2]+3*u*t*t*p[4]+t*t*t*p[6],y:u*u*u*p[1]+3*u*u*t*p[3]+3*u*t*t*p[5]+t*t*t*p[7]+offset};
  }
  // Intersect the descending stream with the actual filled deck, cabin and hull
  // outlines, including their sloped sides. The earliest contact clips the water.
  function boatContact(boatX,boatY,scale){
    const outlines=[[[38,29],[194,29],[214,38],[28,38]],[[30,38],[211,38],[232,61],[24,61]],[[0,60],[254,60],[229,89],[28,89]]];
    let contact=null;
    for(const outline of outlines){
      for(let edge=0;edge<outline.length;edge++){
        const a=outline[edge],b=outline[(edge+1)%outline.length],ax=boatX+a[0]*scale,ay=boatY+a[1]*scale,bx=boatX+b[0]*scale,by=boatY+b[1]*scale;
        const side=t=>{const p=waterPoint(t);return(p.x-ax)*(by-ay)-(p.y-ay)*(bx-ax)};
        let lo=.55,value=side(lo);
        for(let step=1;step<=10;step++){
          const hi=.55+.045*step,next=side(hi);
          if(value*next<=0){
            let left=lo,right=hi,leftValue=value;
            for(let i=0;i<20;i++){const mid=(left+right)/2,middle=side(mid);if(leftValue*middle<=0)right=mid;else{left=mid;leftValue=middle}}
            const t=(left+right)/2,p=waterPoint(t);
            if(p.x>=Math.min(ax,bx)-.01&&p.x<=Math.max(ax,bx)+.01&&p.y>=Math.min(ay,by)-.01&&p.y<=Math.max(ay,by)+.01&&(!contact||t<contact.t))contact={...p,t};
          }
          lo=hi;value=next;
        }
      }
    }
    return contact;
  }
  function showResult(hit,boat){
    game.feedbackBoat=boat;
    el.shell.dataset.result=hit?'hit':'miss';el.resultTitle.textContent=hit?'Splash!':'Missed!';el.result.hidden=false;
    game.feedbackUntil=game.time+(hit?1800:1000);
  }
  function nextBoat(center){
    const boat={id:++game.round,center,hit:false,miss:false};
    game.boats.push(boat);attachBoat(boat);
  }
  function render(allowScoring=visible&&!document.hidden){
    const paused=still(),scale=compact?.84:1,strength=power();
    let contact=null,contactBoat=null;
    for(const boat of game.boats){
      boat.x=(compact?boat.center*.6:boat.center)-127*scale;
      boat.y=(compact?439:337)+(paused?0:Math.sin(game.time*.0018+boat.id)*.7);
      boat.node.setAttribute('transform',`translate(${boat.x.toFixed(2)} ${boat.y.toFixed(2)}) scale(${scale})`);
      boat.node.dataset.center=boat.center.toFixed(1);
      const candidate=boatContact(boat.x,boat.y,scale);
      if(candidate&&(!contact||candidate.t<contact.t)){contact=candidate;contactBoat=boat}
    }
    const touching=contact&&strength>=contact.t;
    if(touching&&!contactBoat.hit&&allowScoring){
      contactBoat.hit=true;game.score+=1;el.score.textContent=String(game.score);el.scoreLabel.setAttribute('aria-label',`Boats splashed: ${game.score}`);showResult(true,contactBoat);announce(`Splash! ${game.score} ${game.score===1?'boat':'boats'} splashed.`);
    }
    for(const boat of game.boats){
      if(!boat.hit&&!boat.miss&&boat.center<780&&allowScoring){boat.miss=true;showResult(false,boat);announce('Missed. Another boat is on its way.')}
      boat.wet.setAttribute('opacity',boat.hit?'1':'0');boat.node.dataset.hit=String(boat.hit);
    }
    const newest=game.boats.at(-1);
    el.shell.dataset.round=String(newest.id);el.shell.dataset.hit=String(newest.hit);
    el.shell.dataset.boatCenter=newest.center.toFixed(1);el.shell.dataset.boatCount=String(game.boats.length);
    if(game.time>game.feedbackUntil)el.result.hidden=true;
    if(!el.result.hidden&&game.feedbackBoat){
      const boat=game.feedbackBoat;
      el.result.style.left=`${clamp((boat.x+127*scale)/(compact?720:1200),.15,.85)*100}%`;
      el.result.style.top=`${(boat.y-16)/(compact?650:540)*100}%`;
    }
    const age=shotAge(),phase=age<1400?'firing':age<1700?'reloading':'ready';
    el.shell.dataset.phase=phase;el.fire.setAttribute('aria-disabled',String(phase!=='ready'));el.fire.style.setProperty('--charge',phase==='ready'?'0':String(clamp(age/1700)));
    el.status.textContent=phase==='ready'?'Ready':phase==='reloading'?'Refilling…':'Water away!';
    const lit=age<1100;el.lamps.forEach(lamp=>lamp.setAttribute('fill',lit?'#ff664d':'#8c4e41'));el.glows.forEach(glow=>glow.setAttribute('opacity',lit?'.85':'0'));
    el.water.setAttribute('opacity',strength>.001?'1':'0');
    el.shell.dataset.waterContact=touching?'boat':strength>.99?'river':'none';
    if(strength>.001){
      const length=touching?contact.t:strength;
      // Clip the actual cubic, not its stroke length: Bezier t is not arc length.
      el.streams.forEach((stream,i)=>{
        const p=compact?[167.5,418.6,220,110,460,170,650,515]:[225,298,397,52,741,81,1040,410],o=(i-5.5)*.9;
        const points=[[p[0],p[1]+o*.15],[p[2]+o*.3,p[3]+o],[p[4]-o,p[5]+o*2],[p[6]+o*1.4,p[7]+o*1.1]];
        const mix=(a,b)=>[a[0]+(b[0]-a[0])*length,a[1]+(b[1]-a[1])*length];
        const a=mix(points[0],points[1]),b=mix(points[1],points[2]),c=mix(points[2],points[3]),d=mix(a,b),e=mix(b,c),end=touching?[contact.x+o*.4,contact.y]:mix(d,e);
        stream.setAttribute('d',`M${points[0].join(' ')}C${a.join(' ')},${d.join(' ')},${end.join(' ')}`);stream.setAttribute('stroke-dasharray','100 101');
      });
      const time=paused?0:game.time;
      el.drops.forEach((drop,i)=>{const t=(i*.61803398875+time*(.00018+i%5*.000004))%1,point=waterPoint(t,Math.sin(i*19.18+time*.002)*(.6+t*5.5));drop.setAttribute('cx',point.x.toFixed(2));drop.setAttribute('cy',point.y.toFixed(2));drop.setAttribute('opacity',t<length?String((.25+i%5*.1)*Math.min(1,t*12)):'0')});
      const impact=touching?contact:waterPoint(1);
      el.splash.setAttribute('transform',`translate(${(impact.x-1040).toFixed(2)} ${(impact.y-410).toFixed(2)})`);
      el.splash.setAttribute('opacity',touching?'1':String(ease((strength-.92)/.08)));
      el.splash.dataset.surface=touching?'boat':'river';
      const ring=paused?1:1+Math.sin(game.time*.009)*.18;el.ring.setAttribute('rx',String((touching?27:37)*ring));el.ring.setAttribute('ry',String((touching?5:7)*ring));
    }
    el.ripples.setAttribute('transform',`translate(${paused?0:Math.sin(game.time*.0003)*2} ${compact?60:0})`);
  }
  function advance(milliseconds,manual=false){
    game.time+=milliseconds;
    const distance=manual?125:milliseconds*.22;
    for(const boat of game.boats)boat.center-=distance;
    // Keep arrivals 2.5 seconds apart, independent of boats leaving the scene.
    const newest=game.boats.at(-1);
    if(newest.center<=700)nextBoat(newest.center+550);
    game.boats=game.boats.filter(boat=>{if(boat.center>=-240)return true;boat.node.remove();return false});
    render(true);
  }
  function tick(now){
    if(destroyed)return;
    const delta=Math.min(now-lastTick,80);lastTick=now;
    if(visible&&!document.hidden&&!still())advance(delta);
    frame=requestAnimationFrame(tick);
  }
  function fire(){
    if(shotAge()<1700)return;
    game.shot=game.time;announce('Water away!');render(true);
  }
  el.fire.addEventListener('click',fire);
  el.advance.addEventListener('click',()=>{if(still())advance(400,true)});
  function updateMotion(){
    const paused=still();el.shell.dataset.manual=String(paused);el.advance.hidden=!paused;
    const label=reduced?'Reduced motion is on':paused?'Resume boat motion':'Pause boat motion';
    el.motion.setAttribute('aria-pressed',String(paused));el.motion.setAttribute('aria-label',label);el.motion.title=label;el.motion.innerHTML=paused&&!reduced?playIcon:pauseIcon;el.motion.disabled=reduced;render();
  }
  el.motion.addEventListener('click',()=>{manualPause=!manualPause;updateMotion()});
  const motionChange=event=>{reduced=event.matches;updateMotion()};media.addEventListener('change',motionChange);
  const visibility=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting&&entries[0].intersectionRatio>=.8;el.shell.dataset.visible=String(visible);lastTick=performance.now()},{threshold:[0,.8]});visibility.observe(el.fire);
  const resize=new ResizeObserver(()=>{
    const nextCompact=root.clientWidth<600;if(nextCompact===compact)return;
    compact=nextCompact;el.shell.dataset.compact=String(compact);el.scene.innerHTML=scene(id,compact);readScene();render();
  });resize.observe(root);
  updateMotion();render();frame=requestAnimationFrame(tick);
  root.__destroy=()=>{destroyed=true;cancelAnimationFrame(frame);resize.disconnect();visibility.disconnect();media.removeEventListener('change',motionChange)};
  return {destroy:root.__destroy,fire};
}
