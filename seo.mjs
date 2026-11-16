import { SCHEDULE } from './dist/schedule.js';

export const siteName = 'Centennial Fountain Guide';
export const siteOrigin = getSiteOrigin(process.env.SITE_URL || 'https://centennialfountain.org');
export const fountainName = 'Nicholas J. Melas Centennial Fountain';
export const locationText = 'River Esplanade Park, at N McClurg Court and E River Drive on the north bank of the Chicago River';
export const sources = {
  operator: SCHEDULE.source,
  architecture: 'https://www.architecture.org/online-resources/buildings-of-chicago/nicholas-j-melas-centennial-fountain',
  architect: 'https://www.lohananderson.com/projects/other/121-centennial-fountain',
  history: 'https://mwrd.org/what-we-do/history-protecting-our-water-environment',
  park: 'https://www.chicagoparkdistrict.com/parks-facilities/river-esplanade-park',
};

export function getSiteOrigin(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('SITE_URL must be an HTTPS origin without a path, credentials, query or fragment');
  }
  return url.origin;
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const monthDay = value => new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(2000, value.month - 1, value.day)));
const hour = value => `${value % 12 || 12} ${value < 12 ? 'a.m.' : 'p.m.'}`;
export const seasonText = `${monthDay(SCHEDULE.seasonStart)}–${monthDay(SCHEDULE.seasonEnd)}`;
export const hoursText = `${hour(SCHEDULE.firstHour)} through ${hour(SCHEDULE.lastHour)}`;
export const scheduleText = `The water cannon is scheduled for ${SCHEDULE.durationMinutes} minutes at the top of each hour, ${hoursText}, ${seasonText}, in Chicago time (${SCHEDULE.timeZone}).`;
export const scheduleCaveat = 'The countdown follows the published schedule, not live operating status. Weather and maintenance may interrupt the cannon.';

export function structuredData({ path, title, description, label }) {
  const url = `${siteOrigin}${path}`;
  const attractionId = `${siteOrigin}/#fountain`;
  const page = {
    '@type': path === '/about/' ? 'AboutPage' : 'WebPage',
    '@id': `${url}#webpage`, url, name: title, description, inLanguage: 'en-US',
    isPartOf: { '@id': `${siteOrigin}/#website` },
    about: { '@id': attractionId },
    citation: path === '/river-reversal/' ? [sources.history] : [sources.operator, sources.park, sources.architecture],
  };
  const pageImage = { '/': 'cascade', '/visit/': 'detail', '/about/': 'front' }[path];
  if (pageImage) page.primaryImageOfPage = { '@type': 'ImageObject', url: `${siteOrigin}/assets/${pageImage}.jpg` };
  const graph = [
    { '@type': 'WebSite', '@id': `${siteOrigin}/#website`, url: `${siteOrigin}/`, name: siteName,
      description: 'An independent visitor guide to Centennial Fountain in Chicago, unaffiliated with MWRD or the City of Chicago.', inLanguage: 'en-US' },
    page,
  ];
  if (['/', '/visit/', '/about/'].includes(path)) {
    graph.push({
      '@type': 'TouristAttraction', '@id': attractionId, name: fountainName, alternateName: 'Centennial Fountain',
      description: `A fountain with stepped cascades and a water cannon in ${locationText}. Dedicated in 1989 to mark the water district’s centennial.`,
      url: `${siteOrigin}/about/`, image: `${siteOrigin}/assets/front.jpg`,
      geo: { '@type': 'GeoCoordinates', latitude: 41.888842, longitude: -87.617747 },
      address: { '@type': 'PostalAddress', streetAddress: 'N McClurg Court & E River Drive', addressLocality: 'Chicago', addressRegion: 'IL', addressCountry: 'US' },
      hasMap: 'https://www.google.com/maps/search/?api=1&query=41.888842%2C-87.617747',
      sameAs: [sources.operator, sources.architecture],
    });
  }
  if (path !== '/') {
    page.breadcrumb = { '@id': `${url}#breadcrumb` };
    graph.push({ '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteOrigin}/` },
      { '@type': 'ListItem', position: 2, name: label, item: url },
    ] });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

export function metadata(page) {
  const { path, title, description } = page;
  const attr = escapeHtml;
  return `<title>${attr(title)}</title>
<meta name="description" content="${attr(description)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${siteOrigin}${path}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${siteName}">
<meta property="og:locale" content="en_US">
<meta property="og:title" content="${attr(title)}">
<meta property="og:description" content="${attr(description)}">
<meta property="og:url" content="${siteOrigin}${path}">
<meta property="og:image" content="${siteOrigin}/assets/water-cannon-countdown.jpg">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Centennial Fountain’s water arc behind a boxed water cannon countdown preview. See the current countdown at centennialfountain.org.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${attr(title)}">
<meta name="twitter:description" content="${attr(description)}">
<meta name="twitter:image" content="${siteOrigin}/assets/water-cannon-countdown.jpg">
<meta name="twitter:image:alt" content="Centennial Fountain’s water arc behind a boxed water cannon countdown preview. See the current countdown at centennialfountain.org.">
<script type="application/ld+json">${JSON.stringify(structuredData(page)).replace(/</g, '\\u003c')}</script>`;
}

export function llmsText(pages) {
  return `# ${siteName}

> Independent visitor guide to ${fountainName} in Chicago. Unaffiliated with MWRD or the City of Chicago.

Canonical website: ${siteOrigin}/

## Visitor facts

- Location: ${locationText}, Chicago, Illinois, USA.
- ${scheduleText}
- ${scheduleCaveat}
- River Esplanade Park hours: 6 a.m.–11 p.m.; follow posted closures and leave by closing time.
- The fountain was dedicated in 1989; the Chicago River reversal occurred in 1900.
- Schedule verification date: ${SCHEDULE.lastChecked}. Check MWRD for current operations.
- The game and maps are illustrative; the game does not control the real fountain.

## Pages

${pages.map(([path, title, description]) => `- [${title}](${siteOrigin}${path}): ${description}`).join('\n')}

## Primary sources

${Object.entries(sources).map(([label, url]) => `- [${label}](${url})`).join('\n')}
`;
}
