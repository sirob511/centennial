let instance=0;
const css=`
.cannon-shell{--game-gold:#ffe17a;--game-ink:#102f3d;position:relative;overflow:hidden;border:1px solid #214956;border-radius:18px;background:#102f3d;color:#f7f6e9;box-shadow:0 20px 55px #15323d16}.cannon-shell button{font-family:inherit}.cannon-scene{position:relative;aspect-ratio:1200/540;overflow:hidden;background:#193b50}.cannon-scene-art,.cannon-scene-art>svg{display:block;width:100%;height:100%}.cannon-hud{position:absolute;inset:22px 25px auto;display:flex;justify-content:space-between;align-items:center;gap:16px;pointer-events:none}.cannon-mode,.cannon-score{display:flex;align-items:center;gap:9px;padding:9px 13px;border:1px solid #f8f4d829;border-radius:30px;background:#103243c4;backdrop-filter:blur(9px);font-size:11px;font-weight:650;line-height:1.3}.cannon-mode:before{content:'';height:6px;width:6px;border-radius:50%;background:#80d2c7;box-shadow:0 0 0 4px #80d2c719}.cannon-score{color:var(--game-gold);font-variant-numeric:tabular-nums}.cannon-score svg{width:15px;height:15px}.cannon-controls{display:flex;align-items:center;justify-content:space-between;gap:22px;padding:22px 26px;background:#102f3d;border-top:1px solid #89b9b424}.cannon-actions{display:flex;align-items:center;gap:11px}.cannon-button{display:inline-flex;align-items:center;justify-content:center;gap:14px;border:1px solid #ffe17a;padding:14px 22px;min-height:54px;border-radius:999px;background:var(--game-gold);color:#102f3d;font-size:14px;font-weight:750;line-height:1.25;cursor:pointer;transition:transform .18s,background .18s,box-shadow .18s;box-shadow:0 3px 0 #bba34d}.cannon-button:hover{background:#ffeb9e;transform:translateY(-2px);box-shadow:0 5px 0 #bba34d,0 0 30px #ffe17a20}.cannon-button:active{transform:translateY(2px);box-shadow:0 1px 0 #bba34d}.cannon-button svg{width:19px;height:19px;flex-shrink:0}.cannon-secondary{border-color:#7ea4ad66;color:#eef6ef;background:transparent;font-size:12px;box-shadow:none}.cannon-secondary:hover{background:#214956;box-shadow:none}.cannon-button:focus-visible,.cannon-motion:focus-visible{outline:3px solid #ff8a69;outline-offset:4px}.cannon-button:disabled{opacity:.7;cursor:default;transform:none;box-shadow:none}.cannon-control-meta{display:flex;align-items:center;gap:20px}.cannon-status{display:flex;align-items:center;gap:8px;font-size:11px;line-height:1.4;color:#c2d6d6;white-space:nowrap}.cannon-dot{width:7px;height:7px;border-radius:50%;background:#8faeb3;flex-shrink:0}.cannon-dot[data-state=warning]{background:#ff8669;box-shadow:0 0 0 5px #ff86691f}.cannon-dot[data-state=on]{background:#8ee4d2;box-shadow:0 0 0 5px #8ee4d21c}.cannon-motion{display:flex;align-items:center;justify-content:center;gap:6px;padding:10px 0;min-height:44px;border:0;background:none;color:#a5c2c8;font-size:10px;cursor:pointer;white-space:nowrap}.cannon-motion:disabled{cursor:default}.cannon-challenge{display:grid;grid-template-columns:1fr auto;align-items:center;gap:16px 30px;padding:24px 26px;background:#153b49;border-top:1px solid #7fa6a72b}.cannon-challenge[hidden],.cannon-challenge [hidden]{display:none}.cannon-challenge-title{margin:0 0 5px;color:#f7f6e9;font-size:23px;font-weight:600;letter-spacing:-.035em;line-height:1.2}.cannon-challenge-copy{font-size:12px;color:#b5ced0;line-height:1.5}.cannon-timer{font-size:11px;font-variant-numeric:tabular-nums;color:#ffe17a;margin-top:8px}.cannon-challenge-actions{display:flex;align-items:center;gap:10px}.cannon-challenge-actions>[data-fire]{min-width:144px;min-height:58px;font-size:16px}.cannon-exit{font-size:11px;border:0;min-height:44px;padding:8px;background:none;color:#b5ced0;cursor:pointer}.cannon-exit:hover{color:white}.cannon-progress{position:relative;height:4px;grid-column:1/-1;border-radius:10px;background:#7caeb533;overflow:hidden}.cannon-progress>div{width:0;height:100%;background:#83d8cd;box-shadow:0 0 12px #83d8cd}.cannon-shell[data-mode=challenge] .cannon-controls{padding-block:12px}.cannon-shell[data-mode=challenge] .cannon-controls .cannon-button{min-height:42px;padding:10px 16px;font-size:11px;box-shadow:none;background:transparent;border-color:#719ba755;color:#c2d6d6}.cannon-shell[data-mode=challenge] [data-start]{display:none}.cannon-shell[data-result=success] .cannon-scene{box-shadow:inset 0 0 80px #ffe17a30}.cannon-result{position:absolute;left:50%;top:34%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:7px;white-space:nowrap;pointer-events:none;filter:drop-shadow(0 5px 15px #09243090)}.cannon-result[hidden]{display:none}.cannon-result-symbol{display:grid;place-items:center;width:60px;height:60px;background:var(--game-gold);color:#193843;border-radius:50%;font-size:32px;box-shadow:0 0 0 8px #ffe17a28,0 0 0 17px #ffe17a0d}.cannon-result strong{font-size:clamp(20px,3vw,36px);font-weight:650;letter-spacing:-.04em;color:white}.cannon-shell[data-result=success] .cannon-result-symbol{animation:cannon-win .6s both}.cannon-shell[data-result=miss] .cannon-result-symbol{background:#b7d4d1;box-shadow:0 0 0 8px #b7d4d124}.cannon-shell[data-phase=warning] .cannon-mode:before{background:#ff8669;box-shadow:0 0 0 4px #ff866929}.cannon-shell[data-phase=on] .cannon-mode:before{background:#ffe17a;box-shadow:0 0 12px #ffe17a}.cannon-shell[data-compact=true] .cannon-scene{aspect-ratio:720/650}.cannon-shell[data-compact=true] .cannon-hud{inset:15px 15px auto}.cannon-shell[data-compact=true] .cannon-controls{display:block;padding:17px}.cannon-shell[data-compact=true] .cannon-actions{display:grid;grid-template-columns:1.15fr 1fr;gap:9px}.cannon-shell[data-compact=true] .cannon-button{padding:12px;font-size:12px;gap:7px;min-height:52px}.cannon-shell[data-compact=true] .cannon-secondary{font-size:11px}.cannon-shell[data-compact=true] .cannon-control-meta{justify-content:space-between;gap:10px;margin-top:10px}.cannon-shell[data-compact=true] .cannon-status{font-size:10px}.cannon-shell[data-compact=true] .cannon-motion{font-size:9px;min-height:30px;padding:5px 0}.cannon-shell[data-compact=true] .cannon-challenge{padding:19px 17px;grid-template-columns:1fr;gap:17px}.cannon-shell[data-compact=true] .cannon-challenge-title{font-size:22px}.cannon-shell[data-compact=true] .cannon-challenge-copy{font-size:11px}.cannon-shell[data-compact=true] .cannon-challenge-actions{display:grid;grid-template-columns:1fr auto;gap:9px}.cannon-shell[data-compact=true] .cannon-challenge-actions>[data-fire]{min-width:0;min-height:55px;font-size:16px}.cannon-shell[data-compact=true] [data-advance]:not([hidden]){grid-column:2}.cannon-shell[data-compact=true] [data-advance]:not([hidden])~[data-exit]{grid-column:1/-1;min-height:30px}.cannon-shell[data-compact=true][data-mode=challenge] .cannon-controls{display:flex;align-items:center;gap:12px;padding-block:10px}.cannon-shell[data-compact=true][data-mode=challenge] .cannon-actions{display:block}.cannon-shell[data-compact=true][data-mode=challenge] .cannon-control-meta{margin:0;flex:1;justify-content:flex-end}.cannon-shell[data-compact=true][data-mode=challenge] .cannon-status{display:none}.cannon-shell[data-compact=true] .cannon-result{top:38%}.cannon-shell[data-compact=true] .cannon-result-symbol{width:48px;height:48px;font-size:26px}.cannon-shell[data-compact=true] .cannon-result strong{font-size:25px}
@keyframes cannon-win{0%{transform:scale(.25) rotate(-35deg)}65%{transform:scale(1.15) rotate(8deg)}100%{transform:scale(1) rotate(0)}}
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
return `<svg viewBox="0 0 ${compact?720:1200} ${compact?650:540}" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">Fire the Centennial Fountain water cannon</title><desc id="${id}-desc">An illustrated north-bank stone fountain at the left, Chicago skyline and passing tour boat. Two red warning lamps illuminate before the virtual water cannon builds into an arc. Controls are below.</desc><defs><linearGradient id="${id}-sky" x2=".2" y2="1"><stop stop-color="#153347"/><stop offset="1" stop-color="#b6c7b2"/></linearGradient><linearGradient id="${id}-river" x2=".2" y2="1"><stop stop-color="#347b81"/><stop offset=".4" stop-color="#235e6e"/><stop offset="1" stop-color="#123f53"/></linearGradient><linearGradient id="${id}-glass" x2="1" y2=".1"><stop stop-color="#477780"/><stop offset=".45" stop-color="#749b9b"/><stop offset="1" stop-color="#365f72"/></linearGradient><linearGradient id="${id}-reflect" x2="0" y2="1"><stop stop-color="#284d5c" stop-opacity=".19"/><stop offset="1" stop-color="#284d5c" stop-opacity="0"/></linearGradient><filter id="${id}-glow" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="5"/></filter></defs>
<rect width="1200" height="650" fill="url(#${id}-sky)"/><circle cx="1037" cy="87" r="38" fill="#fff9df" opacity=".65"/><g fill="none" stroke="#fffdf0" stroke-width="12" stroke-linecap="round" opacity=".26"><path d="M68 109h113m43 0h41M408 79h107m24 0h20M1003 173h127"/></g><g fill="none" stroke="#718d90" stroke-width="1.5" opacity=".65"><path d="M341 111q7-5 14 0q6-5 13 0M380 94q5-4 10 0q5-4 10 0"/></g>
<g transform="${compact?'translate(-420 60)':'translate(0 0)'}"><g fill="#4e787e"><path d="M0 221h58v-36h31v25h32v-53h41v27h30v-45h53v40h32v-37h27v45h45v-68h36v34h31v-19h28v31h36v-50h41v32h29v-68h30v38h31v-19h36v-43h25v103H0Z"/><path d="M1024 225h36v-43h29v-29h39v35h25v-79h47v186h-176Z"/></g><g fill="#385e6d" opacity=".52"><path d="M24 238h75v-62h26v91H24ZM276 248h69v-84h40v112H276ZM448 244h91v-45h53v83H448Z"/></g>
<g><path d="M607 287V204h18v-22h12v-32h9v-27h10l5-23 5 23h10v27h9v32h12v22h16v83Z" fill="#9eb2a0"/><path d="M661 100l5 23h10v27h9v32h12v22h16v83h-40V151h-12Z" fill="#6c8d87"/><path d="M642 151h39M633 181h57M624 204h78" stroke="#eff0dd" stroke-width="3"/><circle cx="660" cy="169" r="10" fill="#f4efd9" stroke="#94a59c" stroke-width="1.5"/><path d="M660 162v7l5 3" fill="none" stroke="#657c79" stroke-width="1.5"/>${windows(638,216,5,6,10,11,'#f4d996')}<rect x="608" y="278" width="105" height="9" fill="#adb6a8"/></g>
<g><path d="M727 288V160h9v-23h8v-21l6-10 6 10v21h12v-21l7-16 7 16v21h12v-21l6-10 6 10v21h8v23h9v128Z" fill="#527f83"/><path d="M779 137h15v-21l6-10 6 10v21h8v23h9v128h-44Z" fill="#3d6973"/><path d="M737 160l13-30 11 30 14-28 14 28 11-30 13 30" fill="none" stroke="#c8cec0" stroke-width="3"/>${windows(741,176,6,9,12,12,'#ffe3a0')}<path d="M735 171v108m13-108v108m13-108v108m13-108v108m13-108v108m13-108v108m13-108v108" stroke="#d2d4c2" opacity=".35"/></g>
<g><path d="M848 288V166h12V94h13V69h26V46h3v23h24v25h13v72h14v122Z" fill="url(#${id}-glass)"/><path d="M901 46V26" stroke="#68818b" stroke-width="2"/><path d="M860 104h79M860 120h79M860 136h79M860 152h79M849 179h104M849 197h104M849 215h104M849 233h104M849 251h104M849 269h104" stroke="#d1dad0" opacity=".55"/><path d="M879 73v213m14-213v213m14-213v213m14-213v213" stroke="#d8dfd5" opacity=".4"/><path d="M848 166h105" stroke="#5a7b87" stroke-width="3"/></g>
<g><path d="M969 287V188h75v99Z" fill="#376975"/>${windows(979,201,5,6,12,12,'#ffdf92')}<path d="M1059 287V155h66v132Z" fill="#2c5c6d"/><path d="M1070 164v116m11-116v116m11-116v116m11-116v116m11-116v116" stroke="#c2d0c8" stroke-width="2" opacity=".29"/><path d="M1140 287V214h60v73Z" fill="#658886"/>${windows(1150,224,4,5)}<path d="M375 285V230h84v55Z" fill="#376e76"/>${windows(386,240,6,3,11)}<path d="M477 285V211h103v74Z" fill="#608b8a"/>${windows(489,224,7,4)}</g>
<path d="M0 279H1200v28H0Z" fill="#a8bfa7"/><path d="M0 279H1200v6H0Z" fill="#efdaa6"/><path d="M0 303H1200v6H0Z" fill="#657e7c"/><g fill="#315c62"><circle cx="298" cy="263" r="17"/><circle cx="321" cy="266" r="12"/><circle cx="347" cy="262" r="18"/><circle cx="369" cy="266" r="11"/><circle cx="565" cy="263" r="15"/><circle cx="589" cy="268" r="10"/><circle cx="998" cy="264" r="16"/><circle cx="1020" cy="269" r="11"/><circle cx="1177" cy="265" r="17"/></g><path d="M280 289H1200M280 295H1200" stroke="#9eaa98" opacity=".65"/>
</g><rect y="${compact?369:309}" width="1200" height="350" fill="url(#${id}-river)"/><g fill="url(#${id}-reflect)"><path d="M612 309h101l-14 141h-73Z"/><path d="M729 309h95l-9 122h-78Z"/><path d="M848 309h107l-24 180h-62Z"/><path d="M1060 309h66l-9 100h-48Z"/></g><path d="M0 321q196-13 387 1t387 0 426 3" fill="none" stroke="#b0c8ba" stroke-width="2" opacity=".5"/><path d="M0 453q170-20 384-6t408-3 408-2V540H0Z" fill="#174455" opacity=".3"/><g data-ripples>${ripples}</g><g data-target opacity="0"><ellipse cx="${compact?372:620}" cy="${compact?515:425}" rx="${compact?86:103}" ry="17" fill="#ffe17a" fill-opacity=".09" stroke="#ffe17a" stroke-width="2.5" stroke-dasharray="7 8" opacity=".95"/></g>
<g data-boat transform="translate(853 337)"><path d="M-28 93q91-8 183 0t126 0" fill="none" stroke="#bad8d3" stroke-width="2" opacity=".58"/><path d="M-39 101q102-7 208 0t124 0" fill="none" stroke="#9ec7c5" opacity=".35"/><path d="M0 60h254l-25 29H28Z" fill="#f3f0dc"/><path d="M8 68h237l-8 8H16Z" fill="#ed875f"/><path d="M28 89h201" stroke="#244a59" stroke-width="4"/><path d="M30 38h181l21 23H24Z" fill="#edf0df"/><path d="M44 42h25v14H40Zm31 0h24v14H75Zm30 0h24v14h-24Zm30 0h24v14h-24Zm30 0h24v14h-24Zm30 0h13l13 14h-26Z" fill="#255467"/><path d="M38 29h156l20 9H28Z" fill="#e9e8d5"/><path d="M35 28h160M44 17v12m29-12v12m29-12v12m29-12v12m29-12v12m29-12v12M44 20h145" fill="none" stroke="#8fa79e"/><g fill="#264b59"><circle cx="62" cy="19" r="3"/><path d="M58 28v-5q4-5 8 0v5Z"/><circle cx="89" cy="18" r="3"/><path d="M85 28v-6q4-4 8 0v6Z"/><circle cx="118" cy="20" r="3"/><path d="M114 28v-4q4-4 8 0v4Z"/><circle cx="151" cy="18" r="3"/><path d="M147 28v-6q4-4 8 0v6Z"/><circle cx="175" cy="19" r="3"/><path d="M171 28v-5q4-4 8 0v5Z"/></g><path d="M211 11v28" stroke="#42656e" stroke-width="1.5"/><path d="M212 12h15l-5 5 5 5h-15Z" fill="#e4795c"/></g>
<g transform="${compact?'translate(10 210) scale(.7)':'translate(0 0)'}"><path d="M0 398l112-32 150 35 46 32L0 526Z" fill="#82958b"/><path d="M0 398l112-32 150 35 18 15L0 489Z" fill="#dbd9bf"/><path d="M0 416l130-37 126 30" fill="none" stroke="#eee8d1" stroke-width="3"/><path d="M0 477l280-61v16L0 500Z" fill="#9aaa99"/><path d="M0 489l280-61" stroke="#c8cfb7" stroke-width="2"/><path d="M0 444l246-52M50 384l156 52M104 370l143 55" stroke="#a6b39f" opacity=".6"/>
<ellipse cx="132" cy="400" rx="126" ry="28" fill="#667f78" opacity=".3"/><path d="M23 381q107-47 222 0v17q-107 47-222 0Z" fill="#82978c"/><ellipse cx="134" cy="381" rx="111" ry="29" fill="#c3c9b5"/><ellipse cx="134" cy="381" rx="97" ry="23" fill="#537f7d"/><path d="M49 367q84-38 171 0v19q-81 35-171 0Z" fill="#93a497"/><ellipse cx="134" cy="367" rx="86" ry="24" fill="#d4d5be"/><path d="M70 351q64-29 129 0v18q-63 31-129 0Z" fill="#8a9e92"/><ellipse cx="134" cy="351" rx="65" ry="20" fill="#bec8b3"/><path d="M91 330q44-20 87 0v23q-41 23-87 0Z" fill="#aeb8a6"/><ellipse cx="134" cy="330" rx="43" ry="13" fill="#d3d5be"/><path d="M114 285h41v49q-19 11-41 0Z" fill="#b1bcaa"/><path d="M155 285l20-6v51l-20 4Z" fill="#879e92"/><path d="M114 285l20-7 41 1-20 6Z" fill="#e0dec5"/><path d="M159 309l52-27 23 10-48 33Z" fill="#d1d4bf"/><path d="M186 325l48-33v16l-48 32Z" fill="#8a9f93"/><path d="M159 309l27 16v15l-27-15Z" fill="#afbeaa"/><path d="M219 297l11-6 9 6-10 7Z" fill="#486d6b"/><path d="M40 383q93 31 187 0M65 369q70 22 137 0M85 353q49 16 97 0" fill="none" stroke="#eef0d9" stroke-width="1.4" opacity=".7"/>
<g><path d="M190 295v-11m22 0v-1" stroke="#566e66" stroke-width="3"/><circle cx="190" cy="282" r="6.2" fill="#5a6f66"/><circle cx="212" cy="276" r="6.2" fill="#5a6f66"/><circle data-glow cx="190" cy="282" r="9" fill="#fa654d" opacity="0" filter="url(#${id}-glow)"/><circle data-glow cx="212" cy="276" r="9" fill="#fa654d" opacity="0" filter="url(#${id}-glow)"/><circle data-lamp cx="190" cy="282" r="4.1" fill="#8c4e41"/><circle data-lamp cx="212" cy="276" r="4.1" fill="#8c4e41"/></g>
</g><g data-water opacity="0">${arcs}${drops}<g data-splash opacity="0" transform="${compact?'translate(-390 103)':'translate(0 0)'}"><ellipse cx="1040" cy="412" rx="31" ry="5" fill="#d0ece7" opacity=".3"/><ellipse data-ring cx="1040" cy="412" rx="37" ry="7" fill="none" stroke="#c1e0dc" stroke-width="1.4" opacity=".55"/>${Array.from({length:12},(_,i)=>`<path d="M1040 410q${(i-5.5)*4} -${10+i%4*5} ${(i-5.5)*8} 1" fill="none" stroke="#d7eeee" stroke-width="${i%3?1:1.6}" opacity=".6"/>`).join('')}</g></g></svg>`;
}
const fireIcon='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2v6m0 8v6M2 12h6m8 0h6M5 5l4 4m6 6 4 4M5 19l4-4m6-6 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
export function initCannon(root){
  root.__destroy?.();
  if(!document.getElementById('cannon-styles')){
    const style=document.createElement('style');style.id='cannon-styles';style.textContent=css;document.head.append(style);
  }
  const id=`cannon-${++instance}`;
  let compact=root.clientWidth<600;
  root.innerHTML=`<div class="cannon-shell" data-mode="free" data-compact="${compact}">
    <div class="cannon-scene"><div class="cannon-scene-art">${scene(id,compact)}</div>
      <div class="cannon-hud"><span class="cannon-mode" data-mode-label>Free play</span><span class="cannon-score" aria-label="Successful crossings"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2 3 6.6 7.2.8-5.3 4.9 1.5 7-6.4-3.6-6.4 3.6 1.5-7L1.8 9.4 9 8.6Z"/></svg><span data-score>0</span></span></div>
      <div class="cannon-result" data-result-panel hidden aria-hidden="true"><span class="cannon-result-symbol" data-result-symbol>★</span><strong data-result-title></strong></div>
    </div>
    <div class="cannon-controls"><div class="cannon-actions"><button class="cannon-button" data-cannon-toggle aria-pressed="false">${fireIcon}Fire the cannon</button><button class="cannon-button cannon-secondary" data-start>Boat challenge <span aria-hidden="true">→</span></button></div><div class="cannon-control-meta"><p class="cannon-status"><span class="cannon-dot" data-dot aria-hidden="true"></span><span data-status>Ready when you are</span></p><button class="cannon-motion" data-motion aria-pressed="false">Pause motion</button></div></div>
    <div class="cannon-challenge" data-panel hidden><div class="cannon-challenge-top"><h3 class="cannon-challenge-title" data-title>Catch the boat.</h3><p class="cannon-challenge-copy" data-copy></p><p class="cannon-timer" data-timer aria-live="off"></p></div><div class="cannon-challenge-actions"><button class="cannon-button" data-fire>Fire!</button><button class="cannon-button cannon-secondary" data-advance hidden>Move boat →</button><button class="cannon-exit" data-exit>Exit</button></div><div class="cannon-progress" aria-hidden="true"><div data-progress></div></div></div>
    <span class="sr-only" data-announcement role="status" aria-live="polite" aria-atomic="true"></span></div>`;
  const q=selector=>root.querySelector(selector),all=selector=>[...root.querySelectorAll(selector)];
  const el={shell:q('.cannon-shell'),scene:q('.cannon-scene-art'),toggle:q('[data-cannon-toggle]'),start:q('[data-start]'),panel:q('[data-panel]'),title:q('[data-title]'),copy:q('[data-copy]'),timer:q('[data-timer]'),fire:q('[data-fire]'),advance:q('[data-advance]'),exit:q('[data-exit]'),progress:q('[data-progress]'),announce:q('[data-announcement]'),status:q('[data-status]'),dot:q('[data-dot]'),motion:q('[data-motion]'),mode:q('[data-mode-label]'),score:q('[data-score]'),result:q('[data-result-panel]'),resultTitle:q('[data-result-title]'),resultSymbol:q('[data-result-symbol]')};
  function readScene(){
    for(const key of ['boat','target','water','splash','ring','ripples'])el[key]=q(`[data-${key}]`);
    for(const [key,selector] of [['lamps','lamp'],['glows','glow'],['streams','stream'],['drops','drop']])el[key]=all(`[data-${selector}]`);
  }
  readScene();
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  let reduced=media.matches,manualReduced=false,game=null,frame=0,destroyed=false,lastPhase='',lastRender=0,wins=0;
  const origin=performance.now(),base={on:false,start:0,stop:0,strength:0};
  const still=()=>reduced||manualReduced,announce=text=>el.announce.textContent=text;
  function baseStrength(now){
    if(base.on){const time=now-base.start;return time<1500?0:still()?1:ease((time-1500)/900)}
    return still()?0:base.strength*(1-ease((now-base.stop)/1100));
  }
  function burstStrength(now){
    if(!game||game.shot===null)return 0;
    const time=now-game.shot;
    if(time<1500||time>=6200)return 0;
    if(time<2400)return still()?1:ease((time-1500)/900);
    if(time<=5200)return 1;
    return still()?0:1-ease((time-5200)/1000);
  }
  function updateToggle(){el.toggle.innerHTML=game?'↗ Free play':base.on?`${fireIcon}Stop the cannon`:`${fireIcon}Fire the cannon`;el.toggle.setAttribute('aria-pressed',String(base.on))}
  function setOn(on,now=performance.now()){
    if(on===base.on)return;
    if(on){base.on=true;base.start=now;base.strength=0}else{base.strength=baseStrength(now);base.stop=now;base.on=false}
    updateToggle();render(now);
  }
  function clearResult(){el.result.hidden=true;delete el.shell.dataset.result}
  function endGame(speak=true){
    game=null;el.panel.hidden=true;el.target.setAttribute('opacity','0');el.shell.dataset.mode='free';el.mode.textContent='Free play';clearResult();updateToggle();
    if(speak)announce('Free play. Fire the cannon whenever you like.');
  }
  function startGame(){
    setOn(false);game={start:performance.now(),progress:0,shot:null,resolved:false,previous:1180};
    el.panel.hidden=false;el.target.setAttribute('opacity','1');el.shell.dataset.mode='challenge';el.mode.textContent='Boat challenge';clearResult();updateToggle();
    el.title.textContent='Catch the boat.';el.copy.textContent=still()?'Fire, then move the boat under the arch.':'Fire before the boat reaches the gold ring.';
    el.fire.innerHTML=`${fireIcon}Fire!`;el.fire.disabled=false;el.advance.hidden=!still();el.advance.disabled=false;
    announce(still()?'Boat challenge. Fire the cannon, wait for the water, then move the boat through the gold ring.':'Boat challenge. Fire before the boat reaches the gold ring. The water takes about two and a half seconds to build.');
    render(performance.now());
  }
  function finish(now){
    if(!game||game.resolved)return;
    const strength=burstStrength(now),elapsed=game.shot===null?null:now-game.shot,success=strength>=.72;
    game.resolved=true;
    const result=success?['Beautiful timing.','One perfect crossing. Go again?']:elapsed===null?['The boat slipped past.','Tap fire before it reaches the ring.']:elapsed<2400?['Just a little late.','Fire a little earlier next time.']:['A little too early.','Let the boat get a little closer.'];
    if(success){wins+=1;el.score.textContent=String(wins)}
    el.shell.dataset.result=success?'success':'miss';el.result.hidden=false;el.resultSymbol.textContent=success?'★':'↻';el.resultTitle.textContent=success?'Splash!':elapsed===null?'Missed it!':'Almost!';
    el.title.textContent=result[0];el.copy.textContent=result[1];el.timer.textContent=success?`★ ${wins} ${wins===1?'crossing':'crossings'}`:'';
    el.fire.disabled=false;el.fire.innerHTML='Play again <span aria-hidden="true">↻</span>';el.advance.disabled=true;el.advance.hidden=true;announce(result.join(' '));
  }
  function waterPoint(time,offset){
    const points=compact?[167.5,418.6,220,110,460,170,650,515]:[225,298,397,52,741,81,1040,410],u=1-time;
    return {x:u*u*u*points[0]+3*u*u*time*points[2]+3*u*time*time*points[4]+time*time*time*points[6],y:u*u*u*points[1]+3*u*u*time*points[3]+3*u*time*time*points[5]+time*time*time*points[7]+offset};
  }
  function render(now){
    const paused=still();let center;
    if(game){
      const progress=paused?game.progress:clamp((now-game.start)/14000);center=1180-progress*1350;
      el.progress.style.width=`${Math.min(progress/(560/1350),1)*100}%`;
      if(!game.resolved&&center<=620&&game.previous>620)finish(now);
      if(!game.resolved)el.timer.textContent=paused?'Your pace. Your splash.':`Boat arrives in ${Math.max(0,Math.ceil((center-620)/(1350/14)))}s`;
      game.previous=center;
    }else center=paused?920:1000-((now-origin)*.014%1380);
    const boatScale=compact?.84:1,boatX=(compact?center*.6:center)-127*boatScale,boatY=(compact?439:337)+(paused?0:Math.sin(now*.0018)*.7);
    el.boat.setAttribute('transform',`translate(${boatX.toFixed(2)} ${boatY.toFixed(2)}) scale(${boatScale})`);
    const power=Math.max(baseStrength(now),burstStrength(now));
    const warning=base.on&&now-base.start<1500||game&&game.shot!==null&&now-game.shot<1500;
    const phase=warning?'warning':power>.01?(base.on||game&&game.shot!==null&&now-game.shot<5200?'on':'draining'):'off';
    if(phase!==lastPhase){
      lastPhase=phase;const text={off:'Ready when you are',warning:'Here it comes…',on:'Making a splash',draining:'Winding down'}[phase];
      el.status.textContent=text;el.dot.dataset.state=phase;el.shell.dataset.phase=phase;if(!game)announce(text);
    }
    if(game&&game.shot!==null&&!game.resolved)el.fire.textContent=warning?'Get ready…':power>.01?'Splash!':'Burst complete';
    const lit=phase==='warning'||phase==='on';el.lamps.forEach(lamp=>lamp.setAttribute('fill',lit?'#ff664d':'#8c4e41'));el.glows.forEach(glow=>glow.setAttribute('opacity',lit?'.85':'0'));
    el.water.setAttribute('opacity',power>.001?'1':'0');
    if(power>.001){
      el.streams.forEach((stream,i)=>stream.setAttribute('stroke-dasharray',`${Math.max(0,power*100-i*.1).toFixed(2)} 101`));
      const time=paused?0:now;
      el.drops.forEach((drop,i)=>{const t=(i*.61803398875+time*(.00018+i%5*.000004))%1,point=waterPoint(t,Math.sin(i*19.18+time*.002)*(.6+t*5.5));drop.setAttribute('cx',point.x.toFixed(2));drop.setAttribute('cy',point.y.toFixed(2));drop.setAttribute('opacity',t<power?String((.25+i%5*.1)*Math.min(1,t*12)):'0')});
      el.splash.setAttribute('opacity',String(ease((power-.92)/.08)));const ring=paused?1:1+Math.sin(now*.003)*.13;el.ring.setAttribute('rx',String(37*ring));el.ring.setAttribute('ry',String(7*ring));
    }
    el.ripples.setAttribute('transform',`translate(${paused?0:Math.sin(now*.0003)*2} ${compact?60:0})`);
  }
  function tick(now){if(destroyed)return;if(!document.hidden&&now-lastRender>=(still()?100:16)){render(now);lastRender=now}frame=requestAnimationFrame(tick)}
  el.toggle.addEventListener('click',()=>{if(game)endGame(false);setOn(!base.on)});
  function frameGame(){
    const rect=root.getBoundingClientRect(),space=innerHeight-24;
    if(rect.top>=12&&rect.bottom<=innerHeight-12)return;
    const offset=rect.height<=space?(innerHeight-rect.height)/2:innerHeight-rect.height-12;
    window.scrollTo({top:Math.max(0,window.scrollY+rect.top-offset),behavior:'instant'});
  }
  el.start.addEventListener('click',()=>{startGame();el.fire.focus({preventScroll:true});frameGame()});
  el.fire.addEventListener('click',()=>{
    if(!game)return;if(game.resolved){startGame();frameGame();return}if(game.shot!==null)return;
    game.shot=performance.now();el.fire.disabled=true;el.fire.textContent='Get ready…';announce('Warning lights on. Water starts in one and a half seconds.');render(game.shot);
  });
  el.advance.addEventListener('click',()=>{if(game&&!game.resolved){game.progress=clamp(game.progress+.1);render(performance.now())}});
  el.exit.addEventListener('click',()=>{endGame();el.start.focus()});
  function updateMotion(){
    el.motion.setAttribute('aria-pressed',String(still()));el.motion.textContent=reduced?'Reduced motion':still()?'▶ Resume motion':'Ⅱ Pause motion';el.motion.disabled=reduced;
    if(game)startGame();render(performance.now());
  }
  el.motion.addEventListener('click',()=>{manualReduced=!manualReduced;updateMotion()});
  const motionChange=event=>{reduced=event.matches;updateMotion()};media.addEventListener('change',motionChange);
  const resize=new ResizeObserver(()=>{
    const nextCompact=root.clientWidth<600;if(nextCompact===compact)return;
    compact=nextCompact;el.shell.dataset.compact=String(compact);el.scene.innerHTML=scene(id,compact);readScene();el.target.setAttribute('opacity',game?'1':'0');render(performance.now());
  });resize.observe(root);
  updateMotion();render(origin);frame=requestAnimationFrame(tick);
  root.__destroy=()=>{destroyed=true;cancelAnimationFrame(frame);resize.disconnect();media.removeEventListener('change',motionChange)};
  return {destroy:root.__destroy,setOn,startChallenge:startGame};
}
