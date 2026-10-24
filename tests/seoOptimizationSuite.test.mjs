import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const WEB_DIR = path.resolve(import.meta.dirname, '..');
const PUBLIC_DIR = path.join(WEB_DIR, 'public');
const INDEX_HTML_PATH = path.join(WEB_DIR, 'index.html');

test('1. Technical SEO - robots.txt integrity & crawler access', () => {
  const robotsPath = path.join(PUBLIC_DIR, 'robots.txt');
  assert.ok(fs.existsSync(robotsPath), 'robots.txt must exist in public directory');
  
  const content = fs.readFileSync(robotsPath, 'utf8');
  assert.match(content, /User-agent:\s*\*[\s\S]*Allow:\s*\//i, 'Default crawl allowed');
  assert.match(content, /User-agent:\s*GPTBot/i, 'GPTBot explicitly allowed');
  assert.match(content, /User-agent:\s*ClaudeBot/i, 'ClaudeBot explicitly allowed');
  assert.match(content, /User-agent:\s*PerplexityBot/i, 'PerplexityBot explicitly allowed');
  assert.match(content, /User-agent:\s*Google-Extended/i, 'Google-Extended explicitly allowed');
  assert.match(content, /Sitemap:\s*https:\/\/my-piano\.evostackr\.in\/sitemap\.xml/i, 'Valid Sitemap directive');
  assert.match(content, /Host:\s*https:\/\/my-piano\.evostackr\.in/i, 'Valid Host directive');
});

test('2. Technical SEO - sitemap.xml validity & image extension', () => {
  const sitemapPath = path.join(PUBLIC_DIR, 'sitemap.xml');
  assert.ok(fs.existsSync(sitemapPath), 'sitemap.xml must exist in public directory');

  const content = fs.readFileSync(sitemapPath, 'utf8');
  assert.match(content, /<\?xml version="1\.0" encoding="UTF-8"\?>/i, 'XML declaration valid');
  assert.match(content, /<loc>https:\/\/my-piano\.evostackr\.in\/<\/loc>/i, 'Canonical URL present');
  assert.match(content, /<image:image>/i, 'Google image sitemap extension present');
  assert.match(content, /<priority>1\.0<\/priority>/i, 'Priority 1.0 defined');
});

test('3. GEO & LLM Optimization - llms.txt context document', () => {
  const llmsPath = path.join(PUBLIC_DIR, 'llms.txt');
  assert.ok(fs.existsSync(llmsPath), 'llms.txt must exist in public directory');

  const content = fs.readFileSync(llmsPath, 'utf8');
  assert.match(content, /Evostackr/i, 'Author organization Evostackr declared');
  assert.match(content, /support@evostackr\.in/i, 'Official contact email declared');
  assert.match(content, /88/i, '88-key specification present');
  assert.match(content, /Web Audio API/i, 'Web Audio API tech spec present');
});

test('4. Discovery - site.webmanifest PWA manifest validity', () => {
  const manifestPath = path.join(PUBLIC_DIR, 'site.webmanifest');
  assert.ok(fs.existsSync(manifestPath), 'site.webmanifest must exist');

  const content = fs.readFileSync(manifestPath, 'utf8');
  const json = JSON.parse(content);
  assert.ok(json.name.includes('88-Key') && json.name.includes('Piano'), 'Manifest name includes core keywords');
  assert.equal(json.display, 'standalone');
  assert.equal(json.theme_color, '#272727');
  assert.equal(json.background_color, '#121212');
  assert.ok(Array.isArray(json.icons) && json.icons.length > 0, 'Icons defined');
});

test('5. Discovery - OpenSearch & RSS Feeds', () => {
  const opensearchPath = path.join(PUBLIC_DIR, 'opensearch.xml');
  const feedPath = path.join(PUBLIC_DIR, 'feed.xml');
  assert.ok(fs.existsSync(opensearchPath), 'opensearch.xml must exist');
  assert.ok(fs.existsSync(feedPath), 'feed.xml must exist');

  const opensearchContent = fs.readFileSync(opensearchPath, 'utf8');
  assert.match(opensearchContent, /<ShortName>My Piano<\/ShortName>/i);
  assert.match(opensearchContent, /template="https:\/\/my-piano\.evostackr\.in\/\?q=\{searchTerms\}"/i);

  const feedContent = fs.readFileSync(feedPath, 'utf8');
  assert.match(feedContent, /<rss version="2\.0"/i);
  assert.match(feedContent, /support@evostackr\.in/i);
});

test('6. On-Page SEO & Semantic HTML - Headings & Elements', () => {
  const html = fs.readFileSync(INDEX_HTML_PATH, 'utf8');

  // Check single H1
  const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi);
  assert.ok(h1Matches, 'Page must contain an H1 heading');
  assert.equal(h1Matches.length, 1, 'Page must have exactly one H1 tag');
  assert.match(h1Matches[0], /88-Key/i, 'H1 must include primary keyword');

  // Check canonical tag
  assert.match(html, /<link rel="canonical" href="https:\/\/my-piano\.evostackr\.in\/"/i, 'Self-referential canonical URL valid');

  // Check title tag
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  assert.ok(titleMatch, 'Title tag must exist');
  const title = titleMatch[1].trim();
  assert.ok(title.length >= 30 && title.length <= 70, `Title length (${title.length}) is optimal`);

  // Check meta description
  const descMatch = html.match(/<meta name="description" content="([^"]+)"/i);
  assert.ok(descMatch, 'Meta description must exist');
  const desc = descMatch[1].trim();
  assert.ok(desc.length >= 100 && desc.length <= 175, `Meta description length (${desc.length}) is optimal`);
});

test('7. Structured Data - JSON-LD Schema.org Graph Completeness', () => {
  const html = fs.readFileSync(INDEX_HTML_PATH, 'utf8');
  const schemaMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  assert.ok(schemaMatch, 'JSON-LD script block must exist');

  const schemaJson = JSON.parse(schemaMatch[1]);
  assert.equal(schemaJson['@context'], 'https://schema.org', 'Context must be schema.org');
  assert.ok(Array.isArray(schemaJson['@graph']), '@graph array must exist');

  const types = schemaJson['@graph'].map(e => e['@type']);
  const requiredTypes = [
    'Organization',
    'WebSite',
    'WebPage',
    'BreadcrumbList',
    'SoftwareApplication',
    'HowTo',
    'Article',
    'FAQPage'
  ];

  requiredTypes.forEach(req => {
    assert.ok(types.includes(req), `Schema graph must include @type "${req}"`);
  });

  // Verify Organization attribution
  const org = schemaJson['@graph'].find(e => e['@type'] === 'Organization');
  assert.equal(org.name, 'Evostackr');
  assert.equal(org.email, 'support@evostackr.in');
});

test('8. SXO & Technical Navigation - Internal Link Resolution', () => {
  const html = fs.readFileSync(INDEX_HTML_PATH, 'utf8');

  // Extract all href="#id" internal links
  const hashLinks = [...html.matchAll(/href="#([a-zA-Z0-9\-_]+)"/g)].map(m => m[1]);
  assert.ok(hashLinks.length > 0, 'Internal hash navigation links must exist');

  // Verify each target ID exists in the HTML
  hashLinks.forEach(targetId => {
    const idRegex = new RegExp(`id="${targetId}"`, 'i');
    assert.ok(idRegex.test(html), `Internal anchor target "#${targetId}" must exist in DOM`);
  });
});
