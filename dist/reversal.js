const layouts = {
  desktop: {
    width: 1000, height: 540,
    shore: 'M770-10C750 60 774 95 750 150S795 225 766 290 774 400 750 550H1020V-10Z',
    bank: 'M750-10C730 60 754 95 730 150S775 225 746 290 754 400 730 550',
    river: 'M390-20L402 90 448 154 445 230Q445 255 478 255L778 255M445 247L445 345 356 400',
    canal: 'M356 400L280 425 208 490 160 560',
    riverWidth: 30,
    beforeArrows: ['M530 255H585', 'M645 255H700', 'M445 183V220', 'M445 332V290'],
    afterArrows: ['M705 255H650', 'M590 255H535', 'M445 285V330', 'M347 404L302 419', 'M249 454L212 488'],
    fountain: '677 240', north: '938 45',
  },
  mobile: {
    width: 440, height: 470,
    shore: 'M344-10C329 54 351 99 338 149S355 222 341 278 350 374 334 480H450V-10Z',
    bank: 'M330-10C315 54 337 99 324 149S341 222 327 278 336 374 320 480',
    river: 'M169-10L178 65 205 115V181Q205 202 227 202H350M205 195V300L164 339',
    canal: 'M164 339L115 356 79 396 54 430',
    riverWidth: 23,
    beforeArrows: ['M236 202H271', 'M289 202H323', 'M205 150V179', 'M205 276V240'],
    afterArrows: ['M325 202H291', 'M274 202H240', 'M205 238V278', 'M156 342L122 353', 'M106 367L81 395'],
    fountain: '304 187', north: '412 26',
  },
};

function mapLabels(after, mobile) {
  if (mobile) return `<g class="map-labels" fill="#173e46" font-family="Arial,sans-serif">
    <text x="357" y="88" font-size="21" font-style="italic">Lake</text>
    <text x="338" y="114" font-size="21" font-style="italic">Michigan</text>
    <text x="223" y="239" font-size="17">Chicago River</text>
    <text x="237" y="287" font-size="12" letter-spacing="2">CHICAGO</text>
    <text x="23" y="270" font-size="17">Chicago Sanitary</text>
    <text x="23" y="292" font-size="17">and Ship Canal</text>
    ${after ? '<text x="23" y="314" font-size="13">Opened in 1900</text>' : '<text x="23" y="314" font-size="13">Future route</text><text x="23" y="331" font-size="13">Opened in 1900</text>'}
    ${after ? '<text x="145" y="386" font-size="13">Toward the</text><text x="145" y="404" font-size="13">Des Plaines River ↙</text>' : '<text x="145" y="404" font-size="13">Southwest ↙</text>'}
    <text x="223" y="108" font-size="17">Centennial</text>
    <text x="223" y="129" font-size="17">Fountain</text>
    <text x="223" y="148" font-size="12">Present-day</text>
    <text x="223" y="164" font-size="12">location</text>
    <path d="M272 159L289 161" stroke="#466b67" fill="none"/>
    <text x="18" y="452" font-size="10" fill="#4b6763">SCHEMATIC · NOT TO SCALE</text>
  </g>`;
  return `<g class="map-labels" fill="#173e46" font-family="Arial,sans-serif">
    <text x="817" y="170" font-size="29" font-style="italic">Lake</text>
    <text x="800" y="206" font-size="29" font-style="italic">Michigan</text>
    <text x="490" y="220" font-size="21">Chicago River</text>
    <text x="490" y="350" font-size="15" letter-spacing="3">CHICAGO</text>
    <text x="73" y="356" font-size="20">Chicago Sanitary</text>
    <text x="73" y="382" font-size="20">and Ship Canal</text>
    <text x="73" y="406" font-size="14">${after ? 'Opened in 1900' : 'Future route · opened in 1900'}</text>
    ${after ? '<text x="300" y="479" font-size="14">Toward the Des Plaines</text><text x="300" y="499" font-size="14">River ↙</text>' : '<text x="74" y="501" font-size="14">Southwest ↙</text>'}
    <text x="520" y="170" font-size="16">Centennial Fountain</text>
    <text x="520" y="191" font-size="13">Present-day location</text>
    <path d="M651 192L675 212" stroke="#466b67" fill="none"/>
    <text x="30" y="525" font-size="12" fill="#4b6763">SCHEMATIC · NOT TO SCALE</text>
  </g>`;
}

export function riverMap(after = false, id = 'main', animated = true, mobile = false) {
  const l = mobile ? layouts.mobile : layouts.desktop;
  const arrows = after ? l.afterArrows : l.beforeArrows;
  return `<svg class="river-map ${after ? 'after' : 'before'} ${animated ? 'animated' : ''}" viewBox="0 0 ${l.width} ${l.height}" role="img" aria-labelledby="${id}-title ${id}-desc">
    <title id="${id}-title">${after ? 'After 1900: away from Lake Michigan' : 'Before 1900: toward Lake Michigan'}</title>
    <desc id="${id}-desc">Schematic map. ${after ? 'Water travels west from Lake Michigan, then southwest through the Chicago Sanitary and Ship Canal toward the Des Plaines River.' : 'The Chicago River flows east into Lake Michigan. The future Sanitary and Ship Canal route is shown as a dotted line.'} The fountain’s present-day location is marked on the north bank.</desc>
    <defs>
      <pattern id="${id}-grid" width="${mobile ? 31 : 46}" height="${mobile ? 31 : 46}" patternUnits="userSpaceOnUse"><path d="M${mobile ? 31 : 46} 0H0V${mobile ? 31 : 46}" fill="none" stroke="#d0d8c9" stroke-width="1"/></pattern>
      <marker id="${id}-arrow" viewBox="0 0 12 12" refX="8" refY="6" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M3 2L9 6L3 10" fill="none" stroke="#ffe45c" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></marker>
    </defs>
    <rect width="${l.width}" height="${l.height}" fill="#e9ecdf"/>
    <rect width="${l.width}" height="${l.height}" fill="url(#${id}-grid)"/>
    <path d="${l.shore}" fill="#81c2c0"/>
    <path d="${l.bank}" fill="none" stroke="#d2ddc5" stroke-width="${mobile ? 13 : 18}"/>
    <path d="${l.river}" fill="none" stroke="#197e87" stroke-width="${l.riverWidth}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${l.canal}" fill="none" stroke="${after ? '#197e87' : '#869e8d'}" stroke-width="${after ? l.riverWidth : 4}" stroke-dasharray="${after ? 'none' : '7 9'}" stroke-linecap="round" stroke-linejoin="round"/>
    <g class="flow-arrows" stroke="#ffe45c" stroke-width="${mobile ? 3.5 : 4}" stroke-linecap="round" fill="none" marker-end="url(#${id}-arrow)">${arrows.map(d => `<path d="${d}"/>`).join('')}</g>
    <g class="map-fountain-pin" transform="translate(${l.fountain})"><path d="M0 0C-4-7-14-16-14-25a14 14 0 0 1 28 0C14-16 4-7 0 0Z" fill="#ee7652" stroke="#fff9ed" stroke-width="2"/><circle cy="-24" r="4" fill="#fff9ed"/></g>
    ${mapLabels(after, mobile)}
    <g transform="translate(${l.north})" fill="#264c54"><path d="M0 23V0L-5 9M0 0L5 9" fill="none" stroke="#264c54" stroke-width="2"/><text x="-5" y="39" font-family="Arial" font-size="13">N</text></g>
  </svg>`;
}

export function interactiveRiverMap(after = false) {
  return `<div class="river-map-desktop">${riverMap(after, 'main-desktop')}</div><div class="river-map-mobile">${riverMap(after, 'main-mobile', true, true)}</div>`;
}

export function initReversal() {
  const root = document.querySelector('[data-reversal]');
  if (!root) return;
  const map = root.querySelector('[data-map]');
  const buttons = [...root.querySelectorAll('[data-era]')];
  const status = root.querySelector('[data-map-status]');
  const count = root.querySelector('[data-era-count]');
  const progress = root.querySelector('[data-era-progress]');
  const explored = new Set(['before']);
  root.dataset.currentEra = 'before';
  root.dataset.erasComplete = 'false';
  root.dataset.enhanced = 'true';

  buttons.forEach(button => button.addEventListener('click', () => {
    const era = button.dataset.era;
    if (era === root.dataset.currentEra) return;
    const after = era === 'after';
    buttons.forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    map.innerHTML = interactiveRiverMap(after);
    root.dataset.currentEra = era;
    if (!explored.has(era)) {
      explored.add(era);
      if (count) count.textContent = `${explored.size} / 2`;
      if (progress) progress.textContent = explored.size === 2 ? 'Both eras explored!' : 'eras explored';
      root.dataset.erasComplete = String(explored.size === 2);
    }
    status.textContent = after
      ? 'After 1900 — water flows away from the lake, toward the canal.'
      : 'Before 1900 — the river carries water toward Lake Michigan.';
  }));

  const pause = root.querySelector('[data-map-pause]');
  if (pause) pause.addEventListener('click', () => {
    const paused = root.classList.toggle('map-paused');
    pause.setAttribute('aria-pressed', String(paused));
    pause.textContent = paused ? 'Resume arrows' : 'Pause arrows';
  });
}
