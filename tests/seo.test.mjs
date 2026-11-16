import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import {
  escapeHtml, getSiteOrigin, llmsText, metadata, scheduleText,
  siteOrigin, sources, structuredData,
} from '../seo.mjs';
import { SCHEDULE } from '../dist/schedule.js';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const paths = ['/', '/visit/', '/about/', '/river-reversal/', '/play/'];
const decode = value => value.replace(/&(amp|lt|gt|quot|#39);/g,
  (_, entity) => ({ amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" }[entity]));
const text = html => decode(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
const attrs = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)]
  .map(([, name, value]) => [name, decode(value)]));
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))]
  .map(([tag]) => attrs(tag));
const meta = (html, key) => tags(html, 'meta').filter(tag => tag.name === key || tag.property === key);
const metaValue = (html, key) => {
  const found = meta(html, key);
  assert.equal(found.length, 1, `Expected one ${key} meta tag`);
  return found[0].content;
};
const jsonLd = html => [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
  .map(([, value]) => JSON.parse(value));
const main = html => {
  const matches = [...html.matchAll(/<main\b[^>]*>([\s\S]*?)<\/main>/g)];
  assert.equal(matches.length, 1, 'Expected one semantic main region');
  return matches[0][1];
};
const pages = await Promise.all(paths.map(async path => ({
  path, html: await readFile(resolve(dist, `.${path}index.html`), 'utf8'),
})));

test('every public page has unique metadata and one matching public canonical', () => {
  if (!process.env.SITE_URL) assert.equal(siteOrigin, 'https://centennialfountain.org');
  const titles = new Set();
  const descriptions = new Set();
  for (const { path, html } of pages) {
    const expectedUrl = `${siteOrigin}${path}`;
    const titleTags = [...html.matchAll(/<title>([\s\S]*?)<\/title>/g)];
    assert.equal(titleTags.length, 1, `${path}: one document title`);
    const title = text(titleTags[0][1]);
    const description = metaValue(html, 'description');
    assert.ok(title.length > 15 && description.length > 50, `${path}: descriptive metadata`);
    assert.ok(!titles.has(title), `${path}: unique title`);
    assert.ok(!descriptions.has(description), `${path}: unique description`);
    titles.add(title);
    descriptions.add(description);
    assert.deepEqual(tags(html, 'link').filter(tag => tag.rel === 'canonical')
      .map(tag => tag.href), [expectedUrl]);
    assert.equal(metaValue(html, 'og:url'), expectedUrl);
    assert.equal(metaValue(html, 'og:title'), title);
    assert.equal(metaValue(html, 'og:description'), description);
    assert.equal(metaValue(html, 'twitter:title'), title);
    assert.equal(metaValue(html, 'twitter:description'), description);
    assert.match(metaValue(html, 'robots'), /(?:^|,)index(?:,|$)/);
    assert.match(metaValue(html, 'robots'), /max-image-preview:large/);
    assert.doesNotMatch(metaValue(html, 'robots'), /noindex|nosnippet/);
    assert.match(html, /<html\b[^>]*lang="en(?:-US)?"/);
  }
});

test('social previews have absolute images, dimensions and accessible descriptions', () => {
  for (const { path, html } of pages) {
    assert.equal(metaValue(html, 'og:image'), `${siteOrigin}/assets/water-cannon-preview.jpg`, path);
    assert.equal(metaValue(html, 'twitter:image'), metaValue(html, 'og:image'));
    assert.equal(metaValue(html, 'og:image:type'), 'image/jpeg');
    assert.equal(metaValue(html, 'og:image:width'), '1200');
    assert.equal(metaValue(html, 'og:image:height'), '630');
    assert.equal(metaValue(html, 'twitter:card'), 'summary_large_image');
    assert.ok(metaValue(html, 'og:image:alt').length > 20);
    assert.equal(metaValue(html, 'twitter:image:alt'), metaValue(html, 'og:image:alt'));
  }
});

test('structured data identifies the guide separately and resolves graph references', () => {
  const allNodes = pages.flatMap(({ html }) => jsonLd(html).flatMap(data => data['@graph'] ?? []));
  const allIds = new Set(allNodes.map(node => node['@id']).filter(Boolean));
  function checkReferences(value) {
    if (!value || typeof value !== 'object') return;
    if (value['@id']) assert.ok(allIds.has(value['@id']), `Unresolved schema ID: ${value['@id']}`);
    for (const nested of Object.values(value)) {
      if (Array.isArray(nested)) nested.forEach(checkReferences);
      else checkReferences(nested);
    }
  }
  for (const { path, html } of pages) {
    const documents = jsonLd(html);
    assert.equal(documents.length, 1, `${path}: one JSON-LD graph`);
    assert.equal(documents[0]['@context'], 'https://schema.org');
    const graph = documents[0]['@graph'];
    assert.equal(new Set(graph.map(node => node['@id'])).size, graph.length, `${path}: unique graph IDs`);
    const website = graph.find(node => node['@type'] === 'WebSite');
    assert.equal(website['@id'], `${siteOrigin}/#website`);
    assert.equal(website.url, `${siteOrigin}/`);
    assert.match(website.description, /independent.*unaffiliated/i);
    const page = graph.find(node => ['WebPage', 'AboutPage'].includes(node['@type']));
    assert.equal(page.url, `${siteOrigin}${path}`);
    assert.equal(page['@id'], `${page.url}#webpage`);
    assert.equal(page.name, text(html.match(/<title>([\s\S]*?)<\/title>/)[1]));
    assert.equal(page.description, metaValue(html, 'description'));
    assert.equal(page.isPartOf['@id'], website['@id']);
    const attraction = graph.find(node => node['@type'] === 'TouristAttraction');
    if (['/', '/visit/', '/about/'].includes(path)) {
      assert.ok(attraction, `${path}: fountain entity`);
      assert.equal(attraction['@id'], `${siteOrigin}/#fountain`);
      assert.equal(attraction.geo['@type'], 'GeoCoordinates');
      assert.equal(attraction.address.addressLocality, 'Chicago');
      assert.ok(attraction.sameAs.includes(sources.operator));
      assert.equal(attraction.openingHoursSpecification, undefined,
        'Hourly cannon bursts must not be represented as continuous attraction opening hours');
    }
    assert.doesNotMatch(JSON.stringify(graph), /"(?:aggregateRating|review|SearchAction|FAQPage)"/,
      'Do not fabricate ratings, search actions or FAQ markup absent from this guide');
    assert.equal(page.dateModified, undefined, 'Build time must not masquerade as content verification time');
    graph.forEach(checkReferences);
  }
});

test('breadcrumbs follow the visible Home-to-current-page navigation', () => {
  for (const { path, html } of pages) {
    const graph = jsonLd(html)[0]['@graph'];
    const breadcrumb = graph.find(node => node['@type'] === 'BreadcrumbList');
    if (path === '/') {
      assert.equal(breadcrumb, undefined);
      continue;
    }
    assert.ok(breadcrumb, `${path}: breadcrumb schema`);
    const items = breadcrumb.itemListElement;
    assert.deepEqual(items.map(item => item.position), [1, 2]);
    assert.deepEqual(items.map(item => item.item), [`${siteOrigin}/`, `${siteOrigin}${path}`]);
    assert.equal(items[0].name, 'Home');
    assert.ok(text(html).includes(items[1].name), `${path}: current breadcrumb label is visible`);
    const page = graph.find(node => ['WebPage', 'AboutPage'].includes(node['@type']));
    assert.equal(page.breadcrumb['@id'], breadcrumb['@id']);
  }
});

test('core visitor facts and authoritative links are available in static HTML', () => {
  for (const path of ['/', '/visit/']) {
    const html = pages.find(page => page.path === path).html;
    const body = main(html);
    const readable = text(body);
    for (const fact of ['Nicholas J. Melas Centennial Fountain', 'River Esplanade Park',
      'N McClurg Court', 'E River Drive', 'Chicago', scheduleText]) {
      assert.ok(readable.includes(fact), `${path}: static visitor fact: ${fact}`);
    }
    assert.ok(tags(body, 'a').some(tag => tag.href === sources.operator), `${path}: operator source link`);
    assert.match(readable, /not live operating status/i);
  }
  const aboutLinks = tags(main(pages.find(page => page.path === '/about/').html), 'a').map(tag => tag.href);
  for (const source of [sources.operator, sources.architecture, sources.architect, sources.history]) {
    assert.ok(aboutLinks.includes(source), `About page links to primary source ${source}`);
  }
});

test('pages retain one H1 and headings without trailing periods', () => {
  for (const { path, html } of pages) {
    const body = main(html);
    assert.equal([...body.matchAll(/<h1\b[^>]*>/g)].length, 1, `${path}: one H1`);
    for (const [, heading] of body.matchAll(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/g)) {
      assert.doesNotMatch(text(heading), /\.$/, `${path}: ${text(heading)}`);
    }
  }
});

test('internal links and media resolve to generated routes or bundled assets', async () => {
  for (const { path, html } of pages) {
    for (const [, , rawValue] of html.matchAll(/\b(href|src)="([^"]*)"/g)) {
      const value = decode(rawValue);
      if (!value || value.startsWith('#')) continue;
      const url = new URL(value, `${siteOrigin}${path}`);
      if (url.origin !== siteOrigin) continue;
      let filename = resolve(dist, `.${decodeURIComponent(url.pathname)}`);
      if (url.pathname.endsWith('/')) filename = resolve(filename, 'index.html');
      const info = await stat(filename).catch(() => null);
      assert.ok(info?.isFile(), `${path}: missing local target ${value}`);
    }
  }
});

test('sitemap and crawler rules use only public canonical URLs', async () => {
  const sitemap = await readFile(resolve(dist, 'sitemap.xml'), 'utf8');
  const robots = await readFile(resolve(dist, 'robots.txt'), 'utf8');
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => decode(url));
  assert.deepEqual(urls, paths.map(path => `${siteOrigin}${path}`));
  assert.match(sitemap, /xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/);
  assert.match(robots, /^User-agent:\s*\*\s*$/m);
  assert.match(robots, /^Allow:\s*\/\s*$/m);
  assert.ok(robots.includes(`Sitemap: ${siteOrigin}/sitemap.xml`));
  assert.doesNotMatch(robots, /^Disallow:\s*\/\s*$/m);
  assert.doesNotMatch(`${sitemap}\n${robots}`, /chatgpt\.site|404\.html/);
});

test('llms index reuses page metadata, canonical URLs and actual schedule verification date', async () => {
  const content = await readFile(resolve(dist, 'llms.txt'), 'utf8');
  const pageData = pages.map(({ path, html }) => [path,
    text(html.match(/<title>([\s\S]*?)<\/title>/)[1]), metaValue(html, 'description')]);
  assert.equal(content, llmsText(pageData));
  assert.ok(content.includes(`Schedule verification date: ${SCHEDULE.lastChecked}`));
  assert.ok(content.includes(scheduleText));
  assert.doesNotMatch(content, /chatgpt\.site|404\.html/);
});

test('the missing-page response is noindex and outside the sitemap', async () => {
  const html = await readFile(resolve(dist, '404.html'), 'utf8');
  assert.match(metaValue(html, 'robots'), /(?:^|[,\s])noindex(?:[,\s]|$)/);
  assert.ok(tags(main(html), 'a').some(tag => tag.href === '/'), 'Missing page offers a path home');
  const sitemap = await readFile(resolve(dist, 'sitemap.xml'), 'utf8');
  assert.doesNotMatch(sitemap, /404/);
});

test('origin configuration accepts HTTPS origins and rejects ambiguous URLs', () => {
  assert.equal(getSiteOrigin('https://CentennialFountain.org/'), 'https://centennialfountain.org');
  assert.equal(getSiteOrigin('https://preview.example.com'), 'https://preview.example.com');
  for (const invalid of ['http://example.com', 'ftp://example.com', 'example.com',
    'https://name:password@example.com', 'https://example.com/path',
    'https://example.com/?page=1', 'https://example.com/#home']) {
    assert.throws(() => getSiteOrigin(invalid), undefined, invalid);
  }
});

test('metadata escapes HTML and keeps JSON-LD valid with hostile punctuation', () => {
  const value = `A & B < C > D "quoted" 'single' </script><script>alert(1)</script>`;
  assert.equal(escapeHtml(`&<>"'`), '&amp;&lt;&gt;&quot;&#39;');
  const page = { path: '/visit/', title: value, description: value, label: 'Visit' };
  const html = metadata(page);
  assert.equal(metaValue(html, 'description'), value);
  assert.equal(metaValue(html, 'og:title'), value);
  assert.doesNotMatch(html, /<script>alert/);
  assert.equal([...html.matchAll(/<\/script>/g)].length, 1);
  assert.deepEqual(jsonLd(html)[0], structuredData(page));
});
