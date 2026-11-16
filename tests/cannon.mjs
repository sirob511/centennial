import assert from 'node:assert/strict';
const clockContexts=new WeakSet();

export async function checkCannon(page, {reduced = false} = {}) {
  if(!clockContexts.has(page.context())) {
    await page.clock.install({time:new Date('2026-11-15T12:00:00-06:00')});
    clockContexts.add(page.context());
  }
  await page.goto('http://127.0.0.1:4173/play/', {waitUntil:'networkidle'});
  const root=page.locator('[data-cannon]');
  await root.locator('[data-fire]').waitFor();
  await root.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
  await page.clock.pauseAt((await page.evaluate(()=>Date.now()))+60000);
  await page.clock.runFor(48);
  const fire=root.locator('[data-fire]');
  const state=()=>root.evaluate(el=>({
    ...el.querySelector('.cannon-shell').dataset,
    score:Number(el.querySelector('[data-score]').textContent),
    boats:[...el.querySelectorAll('[data-boat]')].map(boat=>({
      id:Number(boat.dataset.boatId),center:Number(boat.dataset.center),hit:boat.dataset.hit==='true',
      transform:boat.getAttribute('transform'),wet:boat.querySelector('[data-boat-wet]').getAttribute('opacity')
    })),
    water:el.querySelector('[data-water]').getAttribute('opacity'),text:el.textContent
  }));
  const step=async(ms=100)=>{await page.clock.runFor(ms);return state()};
  const until=async(predicate,description,max=80)=>{
    let current=await state();
    for(let i=0;i<max&&!predicate(current);i++)current=await step();
    assert.ok(predicate(current),`${description}: ${JSON.stringify(current)}`);
    return current;
  };
  const activate=async key=>{await fire.focus();await page.keyboard.press(key)};
  const assertOverlap=async()=>{
    const visible=await root.locator('[data-boat]').evaluateAll(boats=>boats.filter(boat=>{
      const b=boat.getBoundingClientRect(),scene=boat.closest('svg').getBoundingClientRect();
      return b.right>scene.left&&b.left<scene.right;
    }).length);
    assert.ok(visible>=2,'next boat is visible before the previous boat leaves');
  };
  assert.doesNotMatch((await state()).text,/Free play|Play again|gold ring|Fire before/i);
  assert.equal(await root.locator('[data-start], [data-cannon-toggle], [data-exit]').count(),0);
  const first=await state(),startingRound=Number(first.round);
  if(reduced){
    const advance=root.locator('[data-advance]');
    assert.equal(await advance.isVisible(),true);
    assert.equal(await root.locator('[data-motion]').isDisabled(),true);
    await step(800);
    assert.deepEqual((await state()).boats,first.boats,'reduced motion freezes every boat');
    for(let i=0;i<4;i++)await advance.click({force:true});
    assert.equal((await state()).score,0,'passing without a shot is a miss');
    assert.equal((await state()).result,'miss');
    await activate('Enter');
    assert.equal((await state()).water,'1','reduced motion fires immediately');
    assert.equal((await state()).waterContact,'river','late shot misses the departed boat');
    await advance.click({force:true});
    assert.equal(Number((await state()).round),startingRound+1,'manual movement also admits the next boat early');
    assert.equal((await state()).phase,'firing','spawning preserves the active shot');
    await assertOverlap();
    await advance.click({force:true});
    assert.equal((await state()).score,1,'the next boat can intersect an existing shot');
    assert.equal((await state()).waterContact,'boat');
    await activate('Space');
    assert.equal((await state()).score,1,'repeated fire cannot duplicate a boat score');
    for(let i=0;i<6&&Number((await state()).round)===startingRound+1;i++)await advance.click({force:true});
    await activate('Enter');
    for(let i=0;i<2;i++)await advance.click({force:true});
    assert.equal((await state()).score,2,'another boat scores independently');
  }else{
    await until(s=>Number(s.boatCenter)<780,'first boat passes without firing');
    assert.equal((await state()).score,0);
    assert.equal((await state()).result,'miss');
    const arrival=await until(s=>Number(s.round)>startingRound,'next boat arrives in under three seconds',10);
    await assertOverlap();
    const predecessor=arrival.boats.find(b=>b.id===startingRound);
    assert.ok(predecessor.center>600,'previous boat is still near mid-scene');
    assert.equal(arrival.score,0);
    await activate('Enter');
    const target=Number(arrival.round);
    const hit=await until(s=>s.boats.some(b=>b.id===target&&b.hit),'water hits the second boat');
    assert.equal(hit.score,1);
    assert.equal(hit.waterContact,'boat');
    assert.equal(await root.locator('[data-splash]').getAttribute('data-surface'),'boat');
    assert.equal(hit.boats.find(b=>b.id===target).wet,'1');
    assert.equal(hit.boats.find(b=>b.id===startingRound).wet,'0','wet state belongs only to the hit boat');
    assert.equal(await fire.evaluate(el=>document.activeElement===el),true,'fire keeps keyboard focus');
    await fire.click({force:true});
    assert.equal((await state()).score,1,'repeat fire during a burst cannot duplicate score');
    await until(s=>s.phase==='ready','shot reloads automatically');
    assert.equal((await state()).score,1,'a continuous burst scores once per boat');
    const beforeHide=await state(),viewport=page.viewportSize();
    await page.setViewportSize({...viewport,height:200});
    await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
    await step();
    const hidden=await state();await step(1600);
    assert.deepEqual((await state()).boats,hidden.boats,'offscreen game freezes movement and arrivals');
    await page.setViewportSize(viewport);
    await root.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
    await step();
    const next=await until(s=>Number(s.round)>Number(beforeHide.round),'arrivals resume after returning');
    await activate('Space');
    await until(s=>s.boats.some(b=>b.id===Number(next.round)&&b.hit),'third boat gets splashed');
    assert.equal((await state()).score,2,'new boat earns another point');
    await root.locator('[data-motion]').click({force:true});
    const paused=await state();await step(3000);
    assert.deepEqual((await state()).boats,paused.boats,'pause freezes all boats and arrivals');
    assert.equal(await root.locator('[data-advance]').isVisible(),true);
    await page.setViewportSize({width:viewport.width<600?1440:390,height:1000});
    await step();
    const resized=await state();
    assert.deepEqual(resized.boats.map(({id,center,hit})=>({id,center,hit})),paused.boats.map(({id,center,hit})=>({id,center,hit})),'resizing preserves each boat and its score');
    await page.setViewportSize(viewport);
    await root.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
    await step();
    await root.locator('[data-motion]').click({force:true});
    await step(300);
    assert.ok((await state()).boats[0].center<paused.boats[0].center,'resume continues boat movement');
    await step(20000);
    assert.ok((await state()).boats.length<=3,'departed boats are removed during sustained play');
  }
  assert.equal(await page.locator('body').evaluate(el=>el.scrollWidth<=innerWidth),true);
  await page.clock.resume();
}
