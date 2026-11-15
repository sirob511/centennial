const {chromium}=await import(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{}),args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1440,height:1000},timezoneId:'America/Los_Angeles'});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});

async function checkExplorer(testPage, path) {
  const visit = path === 'visit';
  const ids = visit ? ['north', 'south', 'bridge'] : ['sundial', 'basins', 'cannon'];
  const destinations = {north:'41.888842,-87.617747',south:'41.888094,-87.616825',bridge:'41.88853,-87.61482'};
  const complete = visit ? 'All viewpoints explored!' : 'All details discovered!';
  const explorer = testPage.locator('[data-hotspots]');
  await testPage.waitForFunction(() => document.querySelector('[data-hotspots]')?.dataset.enhanced === 'true');
  assert.equal(await explorer.locator('[data-discovery-count]').textContent(), '0 / 3');
  const motion = explorer.locator('[data-marker-motion]');
  const firstMarker = explorer.locator('.hotspot').first();
  await motion.click();
  assert.equal(await motion.getAttribute('aria-pressed'), 'true');
  assert.equal(await motion.textContent(), 'Resume pulses');
  assert.equal(await firstMarker.evaluate(el => getComputedStyle(el, '::before').animationName), 'none');
  await motion.click();
  assert.equal(await motion.getAttribute('aria-pressed'), 'false');
  assert.equal(await motion.textContent(), 'Pause pulses');
  assert.equal(await firstMarker.evaluate(el => getComputedStyle(el, '::before').animationName), 'marker-beacon');

  for (const [index, id] of ids.entries()) {
    const marker = explorer.locator(`.hotspot[data-feature="${id}"]`);
    const listButton = explorer.locator(`.feature-buttons [data-feature="${id}"]`);
    if (index === 1) await marker.click();
    else {
      await marker.focus();
      await testPage.keyboard.press('Enter');
    }
    const panel = explorer.locator(`[data-feature-panel="${id}"]`);
    assert.equal(await panel.isVisible(), true, `${path}: correct detail for ${id}`);
    assert.deepEqual(await explorer.locator('[data-feature-panel]').evaluateAll(panels => panels.filter(p => !p.hidden).map(p => p.dataset.featurePanel)), [id]);
    assert.equal(await marker.getAttribute('aria-expanded'), 'true');
    assert.equal(await listButton.getAttribute('aria-pressed'), 'true');
    assert.equal(await marker.getAttribute('data-discovered'), 'true');
    assert.equal(await listButton.getAttribute('data-discovered'), 'true');
    assert.equal(await explorer.locator(`[data-discovery-pip="${id}"]`).getAttribute('data-discovered'), 'true');
    assert.equal(await explorer.locator('[data-discovery-count]').textContent(), `${index + 1} / 3`);
    if (visit) {
      const destination = new URL(await panel.locator('a.button').getAttribute('href'));
      assert.equal(destination.hostname, 'www.google.com');
      assert.equal(destination.pathname, '/maps/search/');
      assert.equal(destination.searchParams.get('api'), '1');
      assert.equal(destination.searchParams.get('query'), destinations[id]);
    }
    await testPage.keyboard.press('Escape');
    assert.equal(await marker.evaluate(el => document.activeElement === el), true, `${path}: Escape restores ${id} focus`);
    assert.equal(await marker.getAttribute('aria-expanded'), 'false');
    assert.equal(await panel.isVisible(), false);

    // Opening the same discovery from the alternate control must not count twice.
    const announcement = await explorer.locator('[data-discovery-status]').textContent();
    await listButton.focus();
    await testPage.keyboard.press('Enter');
    assert.equal(await panel.isVisible(), true);
    assert.equal(await explorer.locator('[data-discovery-count]').textContent(), `${index + 1} / 3`);
    assert.equal(await explorer.locator('[data-discovery-status]').textContent(), announcement);
    await explorer.locator('.feature-close').click();
    assert.equal(await listButton.evaluate(el => document.activeElement === el), true);
  }
  assert.equal(await explorer.locator('[data-discovery-label]').textContent(), complete);
  assert.equal(await explorer.locator('[data-discovery-status]').textContent(), complete);
  await firstMarker.click();
  await testPage.mouse.click(10, 10);
  await testPage.waitForFunction(() => [...document.querySelectorAll('.hotspot')].every(el => el.getAttribute('aria-expanded') === 'false'));
}

async function checkReversal(testPage) {
  const root = testPage.locator('[data-reversal]');
  await testPage.waitForFunction(() => document.querySelector('[data-reversal]')?.dataset.enhanced === 'true');
  const frame = await root.locator('[data-map]').boundingBox();
  assert.equal(await root.locator('[data-era-count]').textContent(), '1 / 2');
  await root.locator('[data-map-pause]').click();
  assert.equal(await root.locator('[data-map-pause]').getAttribute('aria-pressed'), 'true');
  await root.locator('[data-era="after"]').focus();
  await testPage.keyboard.press('Enter');
  assert.equal(await root.getAttribute('data-current-era'), 'after');
  assert.equal(await root.locator('[data-era="after"]').getAttribute('aria-pressed'), 'true');
  assert.match(await root.locator('[data-map-status]').textContent(), /away from/);
  assert.equal(await root.locator('[data-era-count]').textContent(), '2 / 2');
  assert.equal(await root.locator('[data-era-progress]').textContent(), 'Both eras explored!');
  assert.equal(await root.locator('.river-map').evaluateAll(maps => maps.every(m => m.classList.contains('after'))), true);
  assert.equal(await root.locator('.flow-arrows').first().evaluate(el => getComputedStyle(el).animationPlayState), 'paused');
  const afterFrame = await root.locator('[data-map]').boundingBox();
  assert.equal(afterFrame.width, frame.width);
  assert.equal(afterFrame.height, frame.height);
  await root.locator('[data-era="before"]').focus();
  await testPage.keyboard.press('Space');
  assert.equal(await root.getAttribute('data-current-era'), 'before');
  assert.match(await root.locator('[data-map-status]').textContent(), /toward Lake Michigan/);
  assert.equal(await root.locator('[data-era-count]').textContent(), '2 / 2');
  await root.locator('[data-map-pause]').click();
  assert.equal(await root.locator('.flow-arrows').first().evaluate(el => getComputedStyle(el).animationPlayState), 'running');
}

await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});await page.locator('img').evaluateAll(async imgs=>{imgs.forEach(i=>i.loading='eager');await Promise.all(imgs.map(i=>i.decode()))});await page.screenshot({path:'/tmp/centennial-home-desktop.png',fullPage:true});
assert.match(await page.locator('[data-schedule-label]').textContent(),/Next cannon firing|Water cannon returns in|Cannon firing window ends in/);
await page.locator('[data-cannon-toggle]').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('[data-cannon-toggle]').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('[data-lamp]').first().getAttribute('fill'),'#ff664d');assert.equal(await page.locator('[data-water]').getAttribute('opacity'),'0');await page.waitForTimeout(2600);assert.equal(await page.locator('[data-water]').getAttribute('opacity'),'1');await page.locator('[data-cannon]').screenshot({path:'/tmp/centennial-cannon-on.png'});await page.keyboard.press('Space');await page.waitForTimeout(1300);assert.equal(await page.locator('[data-water]').getAttribute('opacity'),'0');
await page.locator('[data-start]').click();assert.equal(await page.locator('[data-fire]').evaluate(el=>document.activeElement===el),true);await page.waitForTimeout(3000);await page.locator('[data-fire]').click();await page.waitForTimeout(3100);assert.match(await page.locator('[data-title]').textContent(),/Beautiful timing/);assert.equal(await page.locator('[data-score]').textContent(),'1');assert.equal(await page.locator('[data-result-panel]').isVisible(),true);await page.locator('[data-fire]').click();await page.waitForTimeout(6100);assert.match(await page.locator('[data-title]').textContent(),/slipped past/);await page.locator('[data-exit]').click();assert.equal(await page.locator('[data-panel]').isVisible(),false);
for(const path of ['visit','about','river-reversal']){await page.goto(`http://127.0.0.1:4173/${path}/`,{waitUntil:'networkidle'});assert.equal(await page.locator('h1').count(),1);assert.ok(await page.locator('meta[property="og:image"]').getAttribute('content'));assert.equal(await page.locator('body').evaluate(e=>e.scrollWidth<=innerWidth),true);await page.locator('img').evaluateAll(async imgs=>{imgs.forEach(i=>i.loading='eager');await Promise.all(imgs.map(i=>i.decode()))});await page.screenshot({path:`/tmp/centennial-${path}-desktop.png`,fullPage:true});if(path==='visit'||path==='about')await checkExplorer(page,path)}
await checkReversal(page);

const mobile=await context.newPage();await mobile.setViewportSize({width:390,height:844});for(const path of ['', 'visit/','about/','river-reversal/']){await mobile.goto(`http://127.0.0.1:4173/${path}`,{waitUntil:'networkidle'});assert.equal(await mobile.locator('body').evaluate(e=>e.scrollWidth<=innerWidth),true,`Overflow ${path}`);await mobile.locator('img').evaluateAll(async imgs=>{imgs.forEach(i=>i.loading='eager');await Promise.all(imgs.map(i=>i.decode()))});assert.equal(await mobile.locator('img').evaluateAll(imgs=>imgs.every(i=>i.complete&&i.naturalWidth>0)),true,`Images ${path}`);await mobile.screenshot({path:`/tmp/centennial-${path.replace('/','')||'home'}-mobile.png`,fullPage:true});if(path==='visit/'||path==='about/')await checkExplorer(mobile,path.replace('/',''))}
await checkReversal(mobile);
for(const [path,id] of [['about','sources'],['visit','directions'],['river-reversal','static-maps']]){
 await mobile.goto(`http://127.0.0.1:4173/${path}/#${id}`,{waitUntil:'networkidle'});
 const disclosure=mobile.locator(`#${id}`);assert.equal(await disclosure.getAttribute('open'),'');
 const summary=await disclosure.locator('summary').boundingBox();assert.ok(summary.y>=0&&summary.y+summary.height<844,`${id}: linked summary visible`);
}
const reduced=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const r=await reduced.newPage();await r.goto('http://127.0.0.1:4173/');await r.locator('[data-start]').click();const boat=await r.locator('[data-boat]').getAttribute('transform');await r.waitForTimeout(500);assert.equal(await r.locator('[data-boat]').getAttribute('transform'),boat);await r.locator('[data-fire]').click();await r.waitForTimeout(1900);for(let i=0;i<5;i++)await r.locator('[data-advance]').click();assert.match(await r.locator('[data-title]').textContent(),/Beautiful timing/);await r.locator('[data-cannon-toggle]').click();assert.equal(await r.locator('[data-cannon-toggle]').getAttribute('aria-pressed'),'true');await r.waitForTimeout(1700);await r.locator('[data-cannon-toggle]').focus();await r.keyboard.press('Enter');assert.equal(await r.locator('[data-water]').getAttribute('opacity'),'0');
for(const path of ['about','visit']){await r.goto(`http://127.0.0.1:4173/${path}/`,{waitUntil:'networkidle'});assert.equal(await r.locator('[data-marker-motion]').isVisible(),false);assert.equal(await r.locator('.hotspot').first().evaluate(el=>getComputedStyle(el,'::before').animationName),'none');await r.locator('.hotspot').first().focus();await r.keyboard.press('Enter');assert.equal(await r.locator('[data-discovery-count]').textContent(),'1 / 3')}
const noJS=await browser.newContext({javaScriptEnabled:false});const n=await noJS.newPage();for(const path of ['', 'visit/','about/','river-reversal/']){await n.goto(`http://127.0.0.1:4173/${path}`);assert.ok((await n.locator('main').textContent()).length>500)}
assert.deepEqual(errors,[]);console.log('PASS: all four pages; desktop/mobile layout; images; cannon warning/build/off; timed challenge success/replay/miss; fountain and viewpoint discovery progress, pulse controls, keyboard/focus and map destinations; river map; reduced motion; no-JS essential content; no console or HTTP errors.');await browser.close();
