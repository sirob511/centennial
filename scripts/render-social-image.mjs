// A photo-led social card with typography sized for small link previews.
// Photo: JeremyA, CC BY-SA 2.5; source and license in research-assets.json.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const asset = async (name, type) => `data:${type};base64,${(await readFile(new URL(`../dist/assets/${name}`, import.meta.url))).toString('base64')}`;
const [photo, bodyFont, headingFont] = await Promise.all([
  asset('cascade.jpg', 'image/jpeg'),
  asset('font-1.woff2', 'font/woff2'),
  readFile(new URL('./assets/Fraunces.ttf', import.meta.url)).then(font => `data:font/ttf;base64,${font.toString('base64')}`),
]);
const output = fileURLToPath(new URL('../dist/assets/water-cannon-preview-v2.jpg', import.meta.url));
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}),
});
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Centennial Fountain sharing card</title><style>
    @font-face{font-family:DM;src:url('${bodyFont}');font-weight:400 700}
    @font-face{font-family:Fraunces;src:url('${headingFont}') format('truetype');font-weight:100 900}
    *{box-sizing:border-box}body{margin:0;width:1200px;height:630px;overflow:hidden;background:#102d3b;color:#fffaf0;font-family:DM,Arial,sans-serif}
    .photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 48%}
    .shade{position:absolute;inset:0;background:linear-gradient(180deg,#071e2a80,transparent 28%,transparent 45%,#071e2a95 68%,#071e2af5)}
    .brand{position:absolute;left:58px;top:34px;padding:16px 25px 18px;border-radius:3px;background:#fff4d9;color:#102d3b;font:750 52px/1.1 Fraunces,serif;font-variation-settings:'SOFT' 75,'WONK' 1,'opsz' 72;letter-spacing:-.035em;box-shadow:0 4px 18px #071e2a30}
    h1{position:absolute;left:58px;bottom:61px;font:750 88px/1.02 Fraunces,serif;font-variation-settings:'SOFT' 75,'WONK' 1,'opsz' 96;letter-spacing:-.035em;margin:0;text-shadow:0 2px 20px #071e2a55}
    h1 span{color:#ffda58}
    .countdown-cue{position:absolute;right:58px;bottom:74px;display:flex;align-items:center;gap:14px;border:2px solid #ffda5860;border-radius:50px;padding:17px 23px;background:#102d3bce;color:#ffda58;font-size:31px;font-weight:650}
    .countdown-cue svg{width:34px;height:38px;flex-shrink:0}
    .credit{position:absolute;right:58px;bottom:20px;color:#d4dfe0;font-size:18px}
  </style></head><body>
    <img class="photo" src="${photo}" alt="Centennial Fountain water arc"><div class="shade"></div>
    <div class="brand">Centennial Fountain</div>
    <h1>Chicago’s<br><span>water cannon</span></h1>
    <div class="countdown-cue"><svg viewBox="0 0 36 40" aria-hidden="true"><path d="M13 3h10M18 3v5m10 4 3-3" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="18" cy="24" r="13" fill="none" stroke="currentColor" stroke-width="3"/><path d="M18 16v9l6 3" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>Next splash ↗</div>
    <div class="credit">Photo: JeremyA · CC BY-SA 2.5</div>
  </body></html>`);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map(image => image.decode()));
  });
  const fits = await page.evaluate(() => document.documentElement.scrollWidth === 1200 && document.documentElement.scrollHeight === 630);
  if (!fits) throw new Error('Social card overflows its 1200×630 canvas');
  await page.screenshot({ path: output, type: 'jpeg', quality: 92 });
  if (process.env.SOCIAL_PREVIEW_PATH) {
    const image = await asset('water-cannon-preview-v2.jpg', 'image/jpeg');
    await page.setViewportSize({ width: 400, height: 210 });
    await page.setContent(`<html><body style="margin:0"><img src="${image}" width="400" height="210"></body></html>`);
    await page.locator('img').evaluate(image => image.decode());
    await page.screenshot({ path: process.env.SOCIAL_PREVIEW_PATH });
  }
  console.log(`Rendered ${output} (1200×630)`);
} finally {
  await browser.close();
}
