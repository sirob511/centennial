const {chromium}=await import(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
import assert from 'node:assert/strict';
import {checkCannon} from './cannon.mjs';
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
  const firstMarker = explorer.locator('.hotspot').first();
  assert.equal(await explorer.locator('[data-marker-motion]').count(), 0);
  assert.equal(await firstMarker.evaluate(el => getComputedStyle(el, '::before').animationIterationCount), '2');

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
assert.match(await page.locator('[data-schedule-label]').textContent(),/Water cannon fires in:|Water cannon returns in:|Firing window ends in:/);
assert.equal(await page.locator('[data-cannon]').count(),0,'home focuses on the attraction');
assert.equal(await page.evaluate(()=>performance.getEntriesByType('resource').some(entry=>new URL(entry.name).pathname==='/cannon.js')),false,'home does not load the game');
await page.locator('header nav').getByRole('link',{name:'Play',exact:true}).click();
assert.equal(new URL(page.url()).pathname,'/play/');
await page.locator('[data-cannon] [data-fire]').waitFor();
await page.goto('http://127.0.0.1:4173/#cannon',{waitUntil:'networkidle'});
await page.waitForURL('http://127.0.0.1:4173/play/');
await page.locator('[data-cannon] [data-fire]').waitFor();
await checkCannon(page);
for(const path of ['play','visit','about','river-reversal']){await page.goto(`http://127.0.0.1:4173/${path}/`,{waitUntil:'networkidle'});assert.equal(await page.locator('h1').count(),1);assert.ok(await page.locator('meta[property="og:image"]').getAttribute('content'));assert.equal(new URL(await page.locator('link[rel="canonical"]').getAttribute('href')).pathname,`/${path}/`);assert.equal(await page.locator('header nav a[aria-current="page"]').getAttribute('href'),`/${path}/`);assert.equal(await page.locator('body').evaluate(e=>e.scrollWidth<=innerWidth),true);await page.locator('img').evaluateAll(async imgs=>{imgs.forEach(i=>i.loading='eager');await Promise.all(imgs.map(i=>i.decode()))});await page.screenshot({path:`/tmp/centennial-${path}-desktop.png`,fullPage:true});if(path==='visit'||path==='about')await checkExplorer(page,path)}
await checkReversal(page);

const mobile=await context.newPage();await mobile.setViewportSize({width:390,height:844});for(const path of ['', 'play/','visit/','about/','river-reversal/']){await mobile.goto(`http://127.0.0.1:4173/${path}`,{waitUntil:'networkidle'});assert.equal(await mobile.locator('body').evaluate(e=>e.scrollWidth<=innerWidth),true,`Overflow ${path}`);await mobile.locator('img').evaluateAll(async imgs=>{imgs.forEach(i=>i.loading='eager');await Promise.all(imgs.map(i=>i.decode()))});assert.equal(await mobile.locator('img').evaluateAll(imgs=>imgs.every(i=>i.complete&&i.naturalWidth>0)),true,`Images ${path}`);await mobile.screenshot({path:`/tmp/centennial-${path.replace('/','')||'home'}-mobile.png`,fullPage:true});if(path==='visit/'||path==='about/')await checkExplorer(mobile,path.replace('/',''))}
await checkReversal(mobile);
await checkCannon(mobile);
for(const [path,id] of [['about','sources'],['visit','directions'],['river-reversal','static-maps']]){
 await mobile.goto(`http://127.0.0.1:4173/${path}/#${id}`,{waitUntil:'networkidle'});
 const disclosure=mobile.locator(`#${id}`);assert.equal(await disclosure.getAttribute('open'),'');
 const summary=await disclosure.locator('summary').boundingBox();assert.ok(summary.y>=0&&summary.y+summary.height<844,`${id}: linked summary visible`);
}
const reduced=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const r=await reduced.newPage();await checkCannon(r,{reduced:true});
for(const path of ['about','visit']){await r.goto(`http://127.0.0.1:4173/${path}/`,{waitUntil:'networkidle'});assert.equal(await r.locator('[data-marker-motion]').isVisible(),false);assert.equal(await r.locator('.hotspot').first().evaluate(el=>getComputedStyle(el,'::before').animationName),'none');await r.locator('.hotspot').first().focus();await r.keyboard.press('Enter');assert.equal(await r.locator('[data-discovery-count]').textContent(),'1 / 3')}
const noJS=await browser.newContext({javaScriptEnabled:false});const n=await noJS.newPage();for(const path of ['', 'visit/','about/','river-reversal/']){await n.goto(`http://127.0.0.1:4173/${path}`);assert.ok((await n.locator('main').textContent()).length>500)}
await n.goto('http://127.0.0.1:4173/play/');assert.equal(await n.locator('[data-cannon] .js-fallback').isVisible(),true);assert.match(await n.locator('[data-cannon]').textContent(),/JavaScript/);assert.equal(await n.locator('header nav a[href="/visit/"]').isVisible(),true);
assert.deepEqual(errors,[]);console.log('PASS: all five pages; dedicated Play route and navigation; home excludes the game module; desktop/mobile layout; images; cannon hits/misses, once-per-boat scoring, automatic boat loop, keyboard, pause and offscreen freeze; fountain and viewpoint discovery progress, finite pulses, keyboard/focus and map destinations; river map; reduced motion; no-JS essential content; no console or HTTP errors.');await browser.close();
