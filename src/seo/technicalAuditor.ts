import { AuditFinding } from './types';

/**
 * In-Browser Technical and On-Page SEO Diagnostic Engine
 * Performs live, non-destructive inspection of the DOM and document metadata.
 */
export class TechnicalAuditor {
  private findings: AuditFinding[] = [];

  /**
   * Run the complete technical audit suite against the current document
   */
  public runAudit(): AuditFinding[] {
    this.findings = [];

    this.checkTitleTag();
    this.checkMetaDescription();
    this.checkRobotsDirective();
    this.checkCanonicalUrl();
    this.checkHeadingHierarchy();
    this.checkImageOptimization();
    this.checkInternalLinks();
    this.checkStructuredData();
    this.checkDiscoveryFeeds();
    this.checkMobileViewport();
    this.checkSecurityAndCharEncoding();

    return this.findings;
  }

  private addFinding(finding: AuditFinding) {
    this.findings.push(finding);
  }

  private checkTitleTag() {
    const title = document.title;
    if (!title || title.trim().length === 0) {
      this.addFinding({
        id: 'title-missing',
        category: 'TECHNICAL',
        severity: 'CRITICAL',
        title: 'Missing Document Title',
        description: 'The page lacks a <title> tag, which is the most critical on-page ranking factor.',
        evidence: 'document.title is empty',
        recommendation: 'Add a descriptive title between 50-65 characters including primary target keywords.',
        impact: 'HIGH',
        effort: 'LOW'
      });
      return;
    }

    const length = title.trim().length;
    if (length < 30) {
      this.addFinding({
        id: 'title-short',
        category: 'ON_PAGE',
        severity: 'WARNING',
        title: 'Title Tag Too Short',
        description: 'The title tag may underutilize available pixel width in SERP snippets.',
        evidence: `Title "${title}" is ${length} characters.`,
        recommendation: 'Expand title with secondary keywords such as "88-Key Virtual Piano" and brand name.',
        impact: 'MEDIUM',
        effort: 'LOW'
      });
    } else if (length > 70) {
      this.addFinding({
        id: 'title-long',
        category: 'ON_PAGE',
        severity: 'WARNING',
        title: 'Title Tag May Truncate in SERP',
        description: 'Titles exceeding ~60-65 characters are often truncated by Google and Bing desktop/mobile displays.',
        evidence: `Title "${title}" is ${length} characters.`,
        recommendation: 'Trim title to under 65 characters while maintaining core keywords at the beginning.',
        impact: 'LOW',
        effort: 'LOW'
      });
    } else {
      this.addFinding({
        id: 'title-optimal',
        category: 'ON_PAGE',
        severity: 'PASS',
        title: 'Optimal Title Tag Length & Structure',
        description: 'Title tag length is within the ideal 30-65 character display range.',
        evidence: `Title: "${title}" (${length} chars)`,
        recommendation: 'Maintain current title and monitor CTR in search engines.',
        impact: 'HIGH',
        effort: 'LOW'
      });
    }
  }

  private checkMetaDescription() {
    const meta = document.querySelector('meta[name="description"]');
    const content = meta?.getAttribute('content')?.trim();

    if (!content) {
      this.addFinding({
        id: 'meta-desc-missing',
        category: 'ON_PAGE',
        severity: 'CRITICAL',
        title: 'Missing Meta Description',
        description: 'No meta description found. Search engines will auto-generate snippets from arbitrary page text.',
        evidence: 'meta[name="description"] not present',
        recommendation: 'Add an engaging meta description between 120-160 characters with call-to-action.',
        impact: 'HIGH',
        effort: 'LOW'
      });
      return;
    }

    const length = content.length;
    if (length < 70) {
      this.addFinding({
        id: 'meta-desc-short',
        category: 'ON_PAGE',
        severity: 'WARNING',
        title: 'Short Meta Description',
        description: 'Meta description does not provide sufficient detail to maximize search snippet click-through rate.',
        evidence: `Description is ${length} characters.`,
        recommendation: 'Expand to 120-160 characters describing 88 keys, acoustic sound, and instant browser play.',
        impact: 'MEDIUM',
        effort: 'LOW'
      });
    } else if (length > 170) {
      this.addFinding({
        id: 'meta-desc-long',
        category: 'ON_PAGE',
        severity: 'WARNING',
        title: 'Meta Description Exceeds Recommended Length',
        description: 'Descriptions over 160 characters risk mobile snippet truncation.',
        evidence: `Description is ${length} characters.`,
        recommendation: 'Condense description to under 160 characters.',
        impact: 'LOW',
        effort: 'LOW'
      });
    } else {
      this.addFinding({
        id: 'meta-desc-optimal',
        category: 'ON_PAGE',
        severity: 'PASS',
        title: 'Optimal Meta Description',
        description: 'Meta description length and structure are optimal for high-converting search snippets.',
        evidence: `"${content.substring(0, 80)}..." (${length} chars)`,
        recommendation: 'Periodically evaluate snippet CTR in Google Search Console.',
        impact: 'MEDIUM',
        effort: 'LOW'
      });
    }
  }

  private checkRobotsDirective() {
    const meta = document.querySelector('meta[name="robots"]');
    const content = meta?.getAttribute('content')?.toLowerCase() || '';

    if (!content) {
      this.addFinding({
        id: 'meta-robots-default',
        category: 'TECHNICAL',
        severity: 'INFO',
        title: 'Implicit Robots Directives (Default: Index, Follow)',
        description: 'Explicit meta robots tag provides certainty for advanced crawler directives.',
        evidence: 'No meta[name="robots"] found; relying on default behavior.',
        recommendation: 'Explicitly specify "index, follow, max-image-preview:large, max-snippet:-1".',
        impact: 'LOW',
        effort: 'LOW'
      });
      return;
    }

    if (content.includes('noindex')) {
      this.addFinding({
        id: 'meta-robots-noindex',
        category: 'TECHNICAL',
        severity: 'CRITICAL',
        title: 'Page Blocks Indexing via "noindex"',
        description: 'Search engines are instructed not to index this page.',
        evidence: `meta[name="robots"] content: "${content}"`,
        recommendation: 'Remove "noindex" immediately if this page is intended for public search visibility.',
        impact: 'HIGH',
        effort: 'LOW'
      });
    } else {
      this.addFinding({
        id: 'meta-robots-valid',
        category: 'TECHNICAL',
        severity: 'PASS',
        title: 'Indexable Meta Robots Configuration',
        description: 'Page allows indexing, link following, and large image preview snippets.',
        evidence: `Directives: "${content}"`,
        recommendation: 'Keep configuration intact.',
        impact: 'HIGH',
        effort: 'LOW'
      });
    }
  }

  private checkCanonicalUrl() {
    const canonical = document.querySelector('link[rel="canonical"]');
    const href = canonical?.getAttribute('href')?.trim();

    if (!href) {
      this.addFinding({
        id: 'canonical-missing',
        category: 'TECHNICAL',
        severity: 'CRITICAL',
        title: 'Missing Canonical Tag',
        description: 'Absence of a canonical tag can cause duplicate content issues across HTTP/HTTPS and URL parameters.',
        evidence: 'link[rel="canonical"] not found in head',
        recommendation: 'Add <link rel="canonical" href="https://my-piano.evostackr.in/"> to the document head.',
        impact: 'HIGH',
        effort: 'LOW'
      });
      return;
    }

    if (!href.startsWith('https://')) {
      this.addFinding({
        id: 'canonical-not-https',
        category: 'TECHNICAL',
        severity: 'WARNING',
        title: 'Non-HTTPS Canonical URL',
        description: 'Canonical tag should strictly point to secure HTTPS protocol.',
        evidence: `Canonical href is "${href}"`,
        recommendation: 'Change canonical URL to use https:// scheme.',
        impact: 'HIGH',
        effort: 'LOW'
      });
    } else {
      this.addFinding({
        id: 'canonical-valid',
        category: 'TECHNICAL',
        severity: 'PASS',
        title: 'Valid Self-Referential Canonical Tag',
        description: 'Canonical tag properly specifies the preferred canonical URL.',
        evidence: `Canonical: ${href}`,
        recommendation: 'Maintain canonical tag consistency across all environment deployments.',
        impact: 'HIGH',
        effort: 'LOW'
      });
    }
  }

  private checkHeadingHierarchy() {
    const h1Elements = document.querySelectorAll('h1');
    if (h1Elements.length === 0) {
      this.addFinding({
        id: 'heading-h1-missing',
        category: 'ON_PAGE',
        severity: 'CRITICAL',
        title: 'Missing H1 Heading',
        description: 'The page lacks an H1 tag. A single clear H1 is foundational for search engine topical relevance.',
        evidence: 'h1 count is 0',
        recommendation: 'Add a single top-level H1 heading communicating the primary page topic.',
        impact: 'HIGH',
        effort: 'LOW'
      });
    } else if (h1Elements.length > 1) {
      this.addFinding({
        id: 'heading-multiple-h1',
        category: 'ON_PAGE',
        severity: 'WARNING',
        title: 'Multiple H1 Headings Detected',
        description: 'Best practice recommends a single primary H1 heading per document for clear topic definition.',
        evidence: `Found ${h1Elements.length} H1 tags.`,
        recommendation: 'Convert secondary H1 tags to H2 subheadings.',
        impact: 'MEDIUM',
        effort: 'LOW'
      });
    } else {
      this.addFinding({
        id: 'heading-h1-valid',
        category: 'ON_PAGE',
        severity: 'PASS',
        title: 'Proper Single H1 Heading',
        description: 'Single H1 present with clear semantic relevance.',
        evidence: `H1: "${h1Elements[0].textContent?.trim()}"`,
        recommendation: 'Preserve H1 content alignment with primary target keywords.',
        impact: 'HIGH',
        effort: 'LOW'
      });
    }

    // Check heading sequence (no skips like H1 -> H3)
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    let previousLevel = 0;
    let hasSkippedLevel = false;

    headings.forEach(h => {
      const level = parseInt(h.tagName.substring(1), 10);
      if (previousLevel > 0 && level > previousLevel + 1) {
        hasSkippedLevel = true;
      }
      previousLevel = level;
    });

    if (hasSkippedLevel) {
      this.addFinding({
        id: 'heading-hierarchy-skip',
        category: 'ON_PAGE',
        severity: 'WARNING',
        title: 'Skipped Heading Levels in Document Structure',
        description: 'Headings should follow a sequential hierarchy (e.g., H1 -> H2 -> H3) without skipping levels for accessibility and crawler parsing.',
        evidence: 'Detected heading jump in document outline.',
        recommendation: 'Adjust heading tags so each nested section steps down by one level at a time.',
        impact: 'MEDIUM',
        effort: 'LOW'
      });
    } else {
      this.addFinding({
        id: 'heading-hierarchy-valid',
        category: 'ON_PAGE',
        severity: 'PASS',
        title: 'Sequential Heading Hierarchy',
        description: 'Document headings follow proper hierarchical nesting (H1 -> H2 -> H3).',
        evidence: `${headings.length} headings ordered sequentially.`,
        recommendation: 'Maintain structured outline for future content additions.',
        impact: 'MEDIUM',
        effort: 'LOW'
      });
    }
  }

  private checkImageOptimization() {
    const images = Array.from(document.querySelectorAll('img'));
    if (images.length === 0) {
      this.addFinding({
        id: 'images-none',
        category: 'SXO',
        severity: 'INFO',
        title: 'No Traditional <img> Elements in DOM',
        description: 'Keyboard graphics and UI icons are rendered via inline SVGs and CSS canvases.',
        evidence: 'img count is 0',
        recommendation: 'Ensure all SVG icons include aria-hidden="true" or role="img" with titles.',
        impact: 'LOW',
        effort: 'LOW'
      });
      return;
    }

    const missingAlt = images.filter(img => !img.hasAttribute('alt') || img.getAttribute('alt')?.trim() === '');
    if (missingAlt.length > 0) {
      this.addFinding({
        id: 'image-alt-missing',
        category: 'TECHNICAL',
        severity: 'WARNING',
        title: 'Images Missing Alt Attributes',
        description: 'Images without alt attributes hurt accessibility (WCAG 2.1) and image search ranking.',
        evidence: `${missingAlt.length} out of ${images.length} images lack descriptive alt text.`,
        recommendation: 'Add concise, descriptive alt attributes to all content images.',
        impact: 'HIGH',
        effort: 'LOW'
      });
    } else {
      this.addFinding({
        id: 'image-alt-valid',
        category: 'TECHNICAL',
        severity: 'PASS',
        title: 'All Images Have Descriptive Alt Attributes',
        description: 'Every image tag includes descriptive alternative text for screen readers and search bots.',
        evidence: `${images.length} images verified with alt tags.`,
        recommendation: 'Maintain alt tag standards for any newly published images.',
        impact: 'HIGH',
        effort: 'LOW'
      });
    }
  }

  private checkInternalLinks() {
    const internalAnchors = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
    const brokenAnchors: string[] = [];

    internalAnchors.forEach(a => {
      const href = a.getAttribute('href');
      if (href && href !== '#' && href.length > 1) {
        const targetId = href.substring(1);
        const targetEl = document.getElementById(targetId);
        if (!targetEl) {
          brokenAnchors.push(href);
        }
      }
    });

    if (brokenAnchors.length > 0) {
      this.addFinding({
        id: 'links-broken-anchors',
        category: 'TECHNICAL',
        severity: 'CRITICAL',
        title: 'Broken Internal Anchor Links Detected',
        description: 'Links pointing to on-page hash targets that do not exist in the DOM frustrate users and crawlers.',
        evidence: `Unmatched targets: ${brokenAnchors.slice(0, 5).join(', ')}`,
        recommendation: 'Ensure matching id attributes exist for all on-page anchor navigation links.',
        impact: 'HIGH',
        effort: 'LOW'
      });
    } else {
      this.addFinding({
        id: 'links-anchors-valid',
        category: 'TECHNICAL',
        severity: 'PASS',
        title: 'All Internal Anchor Links Resolve Successfully',
        description: 'All internal hash navigation targets exist in the DOM, guaranteeing a seamless user journey.',
        evidence: `${internalAnchors.length} internal navigation links verified.`,
        recommendation: 'Retest link resolution after modifying section IDs.',
        impact: 'HIGH',
        effort: 'LOW'
      });
    }
  }

  private checkStructuredData() {
    const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    if (scripts.length === 0) {
      this.addFinding({
        id: 'schema-missing',
        category: 'SCHEMA',
        severity: 'CRITICAL',
        title: 'Missing Schema.org Structured Data',
        description: 'No JSON-LD structured data found on the page.',
        evidence: 'script[type="application/ld+json"] count is 0',
        recommendation: 'Implement Schema.org JSON-LD graph with Organization, WebSite, and SoftwareApplication.',
        impact: 'HIGH',
        effort: 'LOW'
      });
      return;
    }

    let parsedGraphCount = 0;
    const recognizedTypes: string[] = [];

    scripts.forEach(script => {
      try {
        const json = JSON.parse(script.textContent || '{}');
        if (json['@graph'] && Array.isArray(json['@graph'])) {
          parsedGraphCount += json['@graph'].length;
          json['@graph'].forEach((entity: { '@type'?: string }) => {
            if (entity['@type']) recognizedTypes.push(entity['@type']);
          });
        } else if (json['@type']) {
          parsedGraphCount++;
          recognizedTypes.push(json['@type']);
        }
      } catch (e) {
        this.addFinding({
          id: 'schema-json-syntax-error',
          category: 'SCHEMA',
          severity: 'CRITICAL',
          title: 'JSON-LD Syntax Error',
          description: 'Failed to parse JSON-LD script content. Search engines will reject this structured data.',
          evidence: String(e),
          recommendation: 'Validate JSON-LD syntax using Google Rich Results Test or standard JSON linter.',
          impact: 'HIGH',
          effort: 'LOW'
        });
      }
    });

    const expectedTypes = ['Organization', 'WebSite', 'WebPage', 'SoftwareApplication', 'FAQPage', 'HowTo'];
    const missingTypes = expectedTypes.filter(t => !recognizedTypes.includes(t));

    if (missingTypes.length > 0) {
      this.addFinding({
        id: 'schema-incomplete-types',
        category: 'SCHEMA',
        severity: 'WARNING',
        title: 'Incomplete Schema Types in Structured Data Graph',
        description: 'Certain key schemas for rich search results are missing from the JSON-LD graph.',
        evidence: `Missing: ${missingTypes.join(', ')}`,
        recommendation: `Add missing schema declarations: ${missingTypes.join(', ')}.`,
        impact: 'MEDIUM',
        effort: 'LOW'
      });
    } else {
      this.addFinding({
        id: 'schema-graph-complete',
        category: 'SCHEMA',
        severity: 'PASS',
        title: 'Comprehensive Schema.org JSON-LD Graph',
        description: 'Structured data contains complete interconnected entities powering rich results and AI entity recognition.',
        evidence: `Verified ${recognizedTypes.length} schema entities (${Array.from(new Set(recognizedTypes)).join(', ')})`,
        recommendation: 'Keep structured data updated with any product feature additions.',
        impact: 'HIGH',
        effort: 'LOW'
      });
    }
  }

  private checkDiscoveryFeeds() {
    const opensearch = document.querySelector('link[rel="search"]');
    const rss = document.querySelector('link[rel="alternate"][type="application/rss+xml"]');

    if (!opensearch) {
      this.addFinding({
        id: 'opensearch-missing',
        category: 'TECHNICAL',
        severity: 'WARNING',
        title: 'Missing OpenSearch Autodiscovery Link',
        description: 'Browsers support instant search bar addition when <link rel="search" type="application/opensearchdescription+xml"> is present.',
        evidence: 'link[rel="search"] not in document head',
        recommendation: 'Add <link rel="search" type="application/opensearchdescription+xml" href="/opensearch.xml" title="My Piano"> to head.',
        impact: 'LOW',
        effort: 'LOW'
      });
    } else {
      this.addFinding({
        id: 'opensearch-present',
        category: 'TECHNICAL',
        severity: 'PASS',
        title: 'OpenSearch Autodiscovery Configured',
        description: 'Browser URL bar search engine discovery is enabled via OpenSearch descriptor.',
        evidence: `OpenSearch link: ${opensearch.getAttribute('href')}`,
        recommendation: 'Maintain OpenSearch XML file endpoint at /opensearch.xml.',
        impact: 'LOW',
        effort: 'LOW'
      });
    }

    if (!rss) {
      this.addFinding({
        id: 'rss-missing',
        category: 'TECHNICAL',
        severity: 'INFO',
        title: 'RSS Syndication Link Not Declared in Head',
        description: 'RSS feeds assist news readers and AI scrapers in detecting content updates.',
        evidence: 'link[rel="alternate"][type="application/rss+xml"] not found',
        recommendation: 'Add <link rel="alternate" type="application/rss+xml" href="/feed.xml"> to head.',
        impact: 'LOW',
        effort: 'LOW'
      });
    } else {
      this.addFinding({
        id: 'rss-present',
        category: 'TECHNICAL',
        severity: 'PASS',
        title: 'RSS Syndication Feed Linked',
        description: 'RSS feed is properly declared in document head for feed readers and content monitoring.',
        evidence: `Feed link: ${rss.getAttribute('href')}`,
        recommendation: 'Keep feed updated when new tutorials or features are published.',
        impact: 'LOW',
        effort: 'LOW'
      });
    }
  }

  private checkMobileViewport() {
    const viewport = document.querySelector('meta[name="viewport"]');
    const content = viewport?.getAttribute('content') || '';

    if (!content.includes('width=device-width')) {
      this.addFinding({
        id: 'viewport-missing-width',
        category: 'SXO',
        severity: 'CRITICAL',
        title: 'Improper Viewport Configuration',
        description: 'Mobile responsive scaling requires width=device-width to pass Google Mobile-Friendly checks.',
        evidence: `Viewport content: "${content}"`,
        recommendation: 'Set viewport content="width=device-width, initial-scale=1.0, viewport-fit=cover".',
        impact: 'HIGH',
        effort: 'LOW'
      });
    } else {
      this.addFinding({
        id: 'viewport-valid',
        category: 'SXO',
        severity: 'PASS',
        title: 'Responsive Mobile Viewport Configured',
        description: 'Viewport tag properly supports mobile devices with responsive device-width scaling.',
        evidence: `Viewport: "${content}"`,
        recommendation: 'Ensure touch targets remain at least 48x48px on mobile views.',
        impact: 'HIGH',
        effort: 'LOW'
      });
    }
  }

  private checkSecurityAndCharEncoding() {
    const charset = document.querySelector('meta[charset]');
    const charsetVal = charset?.getAttribute('charset')?.toUpperCase();

    if (charsetVal !== 'UTF-8') {
      this.addFinding({
        id: 'charset-missing',
        category: 'TECHNICAL',
        severity: 'WARNING',
        title: 'Non-UTF-8 or Missing Charset Declaration',
        description: 'Declaring UTF-8 character encoding at the very start of <head> avoids encoding mismatches.',
        evidence: `Charset: "${charsetVal || 'none'}"`,
        recommendation: 'Add <meta charset="UTF-8"> as the first child of <head>.',
        impact: 'MEDIUM',
        effort: 'LOW'
      });
    } else {
      this.addFinding({
        id: 'charset-valid',
        category: 'TECHNICAL',
        severity: 'PASS',
        title: 'Valid UTF-8 Character Encoding',
        description: 'Character encoding is explicitly set to UTF-8 in head.',
        evidence: 'meta[charset="UTF-8"] verified',
        recommendation: 'Keep charset declaration at top of head.',
        impact: 'MEDIUM',
        effort: 'LOW'
      });
    }
  }
}

export const technicalAuditor = new TechnicalAuditor();
