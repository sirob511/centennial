// A reproducible screenshot of the site's countdown UI for static link previews.
// Photo: JeremyA, CC BY-SA 2.5; source and license in research-assets.json.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const asset = async (name, type) => `data:${type};base64,${(await readFile(new URL(`../dist/assets/${name}`, import.meta.url))).toString('base64')}`;
const [photo, bodyFont, headingFont] = await Promise.all([
  asset('cascade.jpg', 'image/jpeg'),
  asset('font-1.woff2', 'font/woff2'),
  asset('font-7.woff2', 'font/woff2'),
]);
const output = fileURLToPath(new URL('../dist/assets/water-cannon-countdown.jpg', import.meta.url));
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}),
});
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Water cannon countdown sharing card</title><style>
    @font-face{font-family:DM;src:url('${bodyFont}');font-weight:400 700}
    @font-face{font-family:Manrope;src:url('${headingFont}');font-weight:400 800}
    *{box-sizing:border-box}body{margin:0;width:1200px;height:630px;overflow:hidden;background:#102d3b;color:#fffaf0;font-family:DM,Arial,sans-serif}
    .photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 48%}
    .shade{position:absolute;inset:0;background:linear-gradient(180deg,#081f2b75,#081f2b12 30%,#081f2b40 65%,#081f2bea)}
    .brand{position:absolute;left:58px;top:35px;display:flex;align-items:center;gap:16px;text-shadow:0 2px 10px #102d3b88}
    .brand svg{width:48px;height:43px}.brand strong{display:block;font:750 21px Manrope,sans-serif;letter-spacing:-.02em}
    .brand small{display:block;margin-top:5px;font-size:12px;font-weight:600;letter-spacing:.25em}
    .card{position:absolute;left:170px;top:142px;width:860px;padding:28px 44px 24px;border:1px solid #617f8855;border-top:4px solid #ffda58;border-radius:22px;background:#102d3bf5;box-shadow:0 18px 60px #071c2770;text-align:center}
    h1{font:750 44px/1.15 Manrope,sans-serif;letter-spacing:-.045em;margin:0 0 25px;color:#ffda58}
    .timer{display:flex;align-items:flex-start;justify-content:center;gap:20px}
    .unit{width:178px}.digits{position:relative;display:flex;align-items:center;justify-content:center;height:112px;border:1px solid #6f8b9655;border-radius:10px;background:linear-gradient(#2a4b59,#203f4c);box-shadow:0 6px 0 #061c27,0 9px 10px #061c2740}
    .digits::after{content:'';position:absolute;left:0;right:0;top:50%;border-top:1px solid #09263255}
    .dash{display:block;width:42px;height:12px;margin:0 7px;border-radius:2px;background:#fffaf0;box-shadow:0 2px 0 #061c2720}
    .unit small{display:block;font-size:13px;letter-spacing:.16em;font-weight:600;margin-top:17px;color:#c1d0d3}
    .colon{height:112px;display:flex;flex-direction:column;justify-content:center;gap:19px}
    .colon::before,.colon::after{content:'';width:8px;height:8px;border-radius:50%;background:#ffda58}
    .cta{display:inline-flex;align-items:center;gap:18px;margin-top:25px;font-size:21px;font-weight:600}.cta span{color:#ffda58;font-size:29px;line-height:1}
    .footer{position:absolute;left:58px;right:58px;bottom:31px;display:flex;justify-content:space-between;align-items:flex-end}
    .domain{font-size:19px;font-weight:600;letter-spacing:-.02em}.credit{font-size:11px;color:#d2dbdd}
  </style></head><body>
    <img class="photo" src="${photo}" alt="Centennial Fountain water arc"><div class="shade"></div>
    <div class="brand"><svg viewBox="0 0 46 40" aria-hidden="true"><path d="M5 31C5 5 35 5 40 31M10 31C10 13 31 13 35 31M15 31C15 21 26 21 30 31M2 36H44" fill="none" stroke="currentColor" stroke-width="2"/></svg><div><strong>Centennial Fountain</strong><small>CHICAGO</small></div></div>
    <section class="card"><h1>Water cannon countdown</h1><div class="timer" aria-label="Countdown preview">
      ${['HOURS','MINUTES','SECONDS'].map((unit, index) => `${index ? '<div class="colon"></div>' : ''}<div class="unit"><div class="digits"><i class="dash"></i><i class="dash"></i></div><small>${unit}</small></div>`).join('')}
    </div><div class="cta">See the current countdown <span>↗</span></div></section>
    <div class="footer"><span class="domain">centennialfountain.org</span><span class="credit">Photo: JeremyA · CC BY-SA 2.5 · cropped & overlaid</span></div>
  </body></html>`);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map(image => image.decode()));
  });
  const fits = await page.evaluate(() => document.documentElement.scrollWidth === 1200 && document.documentElement.scrollHeight === 630);
  if (!fits) throw new Error('Social card overflows its 1200×630 canvas');
  await page.screenshot({ path: output, type: 'jpeg', quality: 92 });
  console.log(`Rendered ${output} (1200×630)`);
} finally {
  await browser.close();
}
