# Centennial Fountain

Five static pages for an independent Chicago visitor guide. Source is in `build.mjs` and `seo.mjs`; shared styles and browser modules are in `dist/`. No framework or runtime dependencies are required.

## Local use

- `npm run build` regenerates the five HTML pages, 404 page, sitemap, robots file and optional AI reading index.
- `npm run dev` serves `dist/` on port 4173.
- `npm test` runs schedule and SEO regression tests after building.

## Schedule maintenance

Edit `SCHEDULE` in `dist/schedule.js`. The timezone is America/Chicago. The published season is May 1–September 30, with hourly starts from 10 through 23 and five-minute windows. `lastChecked` records the actual verification date, not an automatic timestamp. Check the linked MWRD operator page before updating it. The app shows scheduled operation, not live telemetry.

Date exceptions use Chicago calendar dates:

```js
exceptions: {
  '2027-07-04': { closed: true, reason: 'Scheduled maintenance' },
  '2027-07-05': { hours: [12, 16], durationMinutes: 5 }
}
```

`closedDates` supports an additional list of full-day closures. No exceptions are assumed or fabricated in the initial configuration. If changing schedule constants or the verified date, also update the human-readable schedule text in `build.mjs` and rebuild.

## Content and assets

Original photo records, camera coordinates where available, source links and reuse licenses are in `research-assets.json`. Resized/cropped photographs retain their original Creative Commons licenses. Captions link to original files and licenses. Fountain hotspots are percentage-positioned against the uncropped front photograph; their positions remain fixed relative to its features as it scales.

The Open Graph and Twitter card uses `dist/assets/water-cannon-preview.jpg` (1200×630). The real fountain photograph leads, with a large “Chicago’s water cannon” headline and a secondary clock/“Next splash” cue. The static image contains no stale countdown numbers. Regenerate with `npm run build:social` after installing the optional Playwright browser dependency; the same browser environment overrides used by browser tests are supported. Set `SOCIAL_PREVIEW_PATH=/tmp/social-thumbnail.png` to also render a 400×210 readability proof. The generated JPEG is committed, so ordinary production builds need no browser. Its background adapts JeremyA’s `cascade` photograph, with a crop and text overlay, under [CC BY-SA 2.5](https://creativecommons.org/licenses/by-sa/2.5); the image includes credit and the original source is recorded in `research-assets.json`. Earlier share images remain available for previously cached links.

Explore and Visit share anchored detail popovers in `dist/hotspots.js`. Opening unique markers fills a three-part discovery counter for the current page visit. Markers pulse twice on entry, then stay bright; reduced-motion preferences disable the pulses. The Visit map uses desktop and mobile SVG views of the same schematic, with high-contrast street labels and both bridge streets visible on mobile. Numbered viewpoint buttons and detail cards identify nearby intersections and the correct river/bridge level; button coordinates are tied to each viewBox. The full fountain photograph keeps its original aspect ratio so its markers stay on the correct details.

Primary content sources are linked in the site. The operator schedule takes precedence over conflicting older listings. The district was founded in 1889; the reversal occurred in 1900; the fountain dedication was in 1989. Viewpoint access is documented using park, Riverwalk and bridge sources, and original photographs; it is not a live access guarantee.

The maps and cannon are original schematic vector illustrations. The game lives at `/play/` and loads its browser module only on that page; old `/#cannon` links redirect there. It uses one Fire control and a continuous flow of boats moving at 220 scene units per second, with a new boat every 2.5 seconds while previous boats continue across the river. Water must hit the boat to score, with one point available per boat. A hit creates a splash at the point of contact. The game pauses outside the viewport; reduced motion freezes all boats and arrivals, with a manual movement control. Each boat keeps its own hit state through viewport changes, and active water bursts continue across arrivals.

## Browser verification

`tests/browser.mjs` contains the desktop/mobile, keyboard, reduced-motion, game and no-JavaScript checks used during development. Install the optional browser test dependency with `npm install`, then run `npx playwright install chromium`. With the preview server on port 4173, run `npm run test:browser`. Existing installations can be selected with `PLAYWRIGHT_MODULE_PATH` and `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Screenshots are written to `/tmp/centennial-*`.

## Hosting

Vercel builds from the repository root using `vercel.json`: `npm run build` generates the site and `dist` is the output directory. The five pages use static directory routes, so no catch-all rewrite is needed.

The public production domain is **https://centennialfountain.org**. The verified `www` domain redirects to the apex in Vercel. `.openai/hosting.json` declares a separate private Sites copy. Publishing to Sites does not push GitHub or deploy the public Vercel site; those are separate operations. Do not change the Sites audience to make the production domain discoverable.

## Search and AI discovery

`seo.mjs` generates unique titles/descriptions, canonical URLs, Open Graph/Twitter metadata, and JSON-LD for the independent website, its pages, breadcrumbs and the fountain attraction. The guide is not the fountain operator. Schema matches visible content; cannon firing windows are not encoded as the park's opening hours. No ratings, reviews, affiliations or live operational status are invented.

All canonical URLs, schema IDs, social images, sitemap entries and `llms.txt` links use `https://centennialfountain.org`. To intentionally move the public site, build with `SITE_URL=https://your-public-domain.example npm run build` and configure that domain in hosting. Keep a single canonical origin across public mirrors. `trailingSlash: true` in Vercel matches the static directory URLs and avoids canonical redirects. Missing routes return `404.html` with `noindex`; they are excluded from the sitemap.

Location, schedule, fountain history and river-reversal explanations are readable in the initial HTML with JavaScript disabled. The generated schedule summary uses `SCHEDULE`, and existing `lastChecked` dates change only after actual source verification. The optional `/llms.txt` provides a short reading index and source links for tools that use it; it is not a requirement or a ranking signal for Google. The wildcard allow rule in `/robots.txt` permits search crawlers, including OAI-SearchBot; no new training-bot policy has been introduced.

After deploying the public site, verify public HTTP 200 responses without authentication or `noindex` headers, a real 404 for missing pages, and reachable `/robots.txt` and `/sitemap.xml`. Submit `https://centennialfountain.org/sitemap.xml` through the owner's Google Search Console and Bing Webmaster Tools accounts when available. These ownership-dependent submissions are separate from code deployment; indexing and AI citations are not guaranteed. Official guidance: [Google AI search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), [structured data](https://developers.google.com/search/docs/appearance/structured-data/sd-policies), [OpenAI crawlers](https://developers.openai.com/api/docs/bots).

## Interaction-first layout

The home page leads with a large fountain photograph, a short water-cannon introduction and one Visit action. A centered countdown overlays the photo with a prominent heading and boxed timer digits; full hours are on `/visit/#hours`. Visual cards link to Visit, Explore and River Reversal; a secondary Play link leads to the separate game page. The photo explorers and river switch lead their pages. Secondary history, access notes and source material use native disclosures; incoming `#sources`, `#directions` and `#static-maps` links open their corresponding disclosure. Keep required photo credits beside images when editing these layouts.
