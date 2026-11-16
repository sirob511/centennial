import assert from 'node:assert/strict';
const clockContexts=new WeakSet();

export async function checkCannon(page, {reduced = false} = {}) {
  // Install before loading because both physics and drawing use performance.now().
  if(!clockContexts.has(page.context())) {
    await page.clock.install({time:new Date('2026-11-15T12:00:00-06:00')});
    clockContexts.add(page.context());
  }
  await page.goto('http://127.0.0.1:4173/play/', {waitUntil:'networkidle'});
  const root = page.locator('[data-cannon]');
  await root.locator('[data-fire]').waitFor();
  await root.evaluate(el => el.scrollIntoView({block:'center',behavior:'instant'}));
  await page.clock.pauseAt((await page.evaluate(()=>Date.now()))+60000);
  await page.clock.runFor(48);
  const fire = root.locator('[data-fire]');
  const state = () => root.evaluate(el => ({
    ...el.querySelector('.cannon-shell').dataset,
    score:Number(el.querySelector('[data-score]').textContent),
    boat:el.querySelector('[data-boat]').getAttribute('transform'),
    water:el.querySelector('[data-water]').getAttribute('opacity'),
    text:el.textContent
  }));
  const step = async (ms=100) => {await page.clock.runFor(ms);return state()};
  const until = async (predicate, description, action=null, max=200) => {
    let current=await state();
    for(let i=0;i<max&&!predicate(current);i++) {
      if(action) await action(current);
      current=await step();
    }
    assert.ok(predicate(current),`${description}: ${JSON.stringify(current)}`);
    return current;
  };
  const activate = async key => {
    await fire.focus();
    await page.keyboard.press(key);
    return state();
  };

  assert.doesNotMatch((await state()).text,/Free play|Play again|gold ring|Fire before/i);
  assert.equal(await root.locator('[data-start], [data-cannon-toggle], [data-exit]').count(),0);
  assert.equal(await page.locator('body').evaluate(el=>el.scrollWidth<=innerWidth),true);

  const first = await state();
  const startingRound=Number(first.round);
  if(reduced) {
    const advance = root.locator('[data-advance]');
    assert.equal(await advance.isVisible(),true);
    assert.equal(await root.locator('[data-motion]').isDisabled(),true);
    await step(800);
    assert.equal((await state()).boat,first.boat,'reduced motion freezes the boat');
    for(let i=0;i<4;i++) await advance.click({force:true});
    assert.equal((await state()).score,0,'passing without a shot is a miss');
    assert.equal((await state()).result,'miss');
    await activate('Enter');
    assert.equal((await state()).water,'1','reduced motion fires immediately');
    for(let i=0;i<12&&Number((await state()).round)===startingRound;i++) await advance.click({force:true});
    assert.equal(Number((await state()).round),startingRound+1,'manual next boat requires no replay');
    assert.equal((await state()).score,0,'shooting after boat passed is a miss');
    await activate('Space');
    for(let i=0;i<2;i++) await advance.click({force:true});
    assert.equal((await state()).score,1,'manual boat intersects the water');
    assert.equal((await state()).waterContact,'boat');
    assert.equal(await root.locator('[data-splash]').getAttribute('data-surface'),'boat');
    for(let i=0;i<3;i++) await advance.click({force:true});
    await activate('Enter');
    assert.equal((await state()).score,1,'same manual boat scores at most once');
    for(let i=0;i<12&&Number((await state()).round)===startingRound+1;i++) await advance.click({force:true});
    assert.equal(Number((await state()).round),startingRound+2);
    await activate('Enter');
    for(let i=0;i<2;i++) await advance.click({force:true});
    assert.equal((await state()).score,2,'second boat scores independently');
  } else {
    await until(s=>Number(s.boatCenter)<760,'first boat passes without firing');
    assert.equal((await state()).score,0);
    assert.equal((await state()).result,'miss');
    await activate('Enter');
    await step(400);
    assert.equal((await state()).water,'1','shot draws visible water');
    assert.equal((await state()).waterContact,'river','late shot splashes river');
    assert.equal((await state()).score,0,'water missing boat earns no point');
    await until(s=>Number(s.round)>startingRound,'next boat arrives automatically');
    assert.equal((await state()).score,0);
    assert.equal(await fire.getAttribute('aria-disabled'),'false');
    await activate('Enter');
    const hit=await until(s=>s.hit==='true','water hits second boat');
    assert.equal(hit.score,1);
    assert.equal(hit.waterContact,'boat');
    assert.equal(await root.locator('[data-splash]').getAttribute('data-surface'),'boat');
    assert.equal(await root.locator('[data-boat-wet]').getAttribute('opacity'),'1');
    assert.equal(await fire.evaluate(el=>document.activeElement===el),true,'fire keeps keyboard focus');
    await fire.click({force:true});
    assert.equal((await state()).score,1,'repeat during burst cannot duplicate score');
    await until(s=>s.phase==='ready','shot reloads automatically');
    await activate('Space');
    await step(500);
    assert.equal((await state()).score,1,'firing again at same boat cannot duplicate score');
    const beforeHide=await state();
    const viewport=page.viewportSize();
    await page.setViewportSize({...viewport,height:200});
    await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
    await page.clock.runFor(100);
    const hidden=await state();
    await step(1600);
    assert.equal((await state()).boat,hidden.boat,'offscreen game is frozen');
    await page.setViewportSize(viewport);
    await root.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
    await page.clock.runFor(100);
    await until(s=>Number(s.round)>Number(beforeHide.round),'loop continues after returning');
    await activate('Enter');
    await until(s=>s.hit==='true','third boat gets splashed');
    assert.equal((await state()).score,2,'new boat earns another point');
    await root.locator('[data-motion]').click({force:true});
    assert.equal(await root.locator('[data-advance]').isVisible(),true);
    const paused=await state();
    await step(600);
    assert.equal((await state()).boat,paused.boat,'pause preserves position');
    await root.locator('[data-motion]').click({force:true});
    await step(300);
    assert.notEqual((await state()).boat,paused.boat,'resume continues boat');
  }
  assert.equal(await page.locator('body').evaluate(el=>el.scrollWidth<=innerWidth),true);
  await page.clock.resume();
}
