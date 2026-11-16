# Centennial Fountain

Four static pages for an independent Chicago visitor guide. Source is in `build.mjs`; shared styles and browser modules are in `dist/`. No framework or runtime dependencies are required.

## Local use

- `npm run build` regenerates the four HTML pages, sitemap and robots file.
- `npm run dev` serves `dist/` on port 4173.
- `npm test` runs 12 schedule tests.

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

Explore and Visit share anchored detail popovers in `dist/hotspots.js`. Opening unique markers fills a three-part discovery counter for the current page visit. Markers pulse twice on entry, then stay bright; reduced-motion preferences disable the pulses. The Visit map uses desktop and mobile SVG views of the same schematic; button coordinates are tied to each viewBox. The full fountain photograph keeps its original aspect ratio so its markers stay on the correct details.

Primary content sources are linked in the site. The operator schedule takes precedence over conflicting older listings. The district was founded in 1889; the reversal occurred in 1900; the fountain dedication was in 1989. Viewpoint access is documented using park, Riverwalk and bridge sources, and original photographs; it is not a live access guarantee.

The maps and cannon are original schematic vector illustrations. The game uses one Fire control and automatically repeating boats. Water must hit the boat to score, with one point available per boat. A hit creates a splash at the point of contact. The game pauses outside the viewport; reduced motion uses a stationary boat with a manual movement control.

## Browser verification

`tests/browser.mjs` contains the desktop/mobile, keyboard, reduced-motion, game and no-JavaScript checks used during development. Install the optional browser test dependency with `npm install`, then run `npx playwright install chromium`. With the preview server on port 4173, run `npm run test:browser`. Existing installations can be selected with `PLAYWRIGHT_MODULE_PATH` and `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Screenshots are written to `/tmp/centennial-*`.

## Hosting

`.openai/hosting.json` declares the private Sites project and static output. Canonical URLs and share metadata use the Sites origin. CentennialFountain.com is the site identity; connecting that custom domain requires its owner’s DNS configuration and has not been performed.

## Interaction-first layout

The photo explorers and river switch lead their pages. Secondary history, access notes and source material use native disclosures; incoming `#sources`, `#directions` and `#static-maps` links open their corresponding disclosure. The home page links to the three experiences with visual cards. Keep required photo credits beside images when editing these layouts.
