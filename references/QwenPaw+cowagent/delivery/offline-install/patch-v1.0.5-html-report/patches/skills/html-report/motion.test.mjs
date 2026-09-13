import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const skillDir = path.dirname(new URL(import.meta.url).pathname);
const TEMPLATE = fs.readFileSync(path.join(skillDir, 'template.html'), 'utf8');

/* -------------------------------------------------------------------------
   Phase 1 — Edge-fade mask
   ------------------------------------------------------------------------- */

test('phase 1: page-fade-top markup exists at top level', () => {
  assert.match(
    TEMPLATE,
    /<div class="page-fade-top"\s+aria-hidden="true">\s*<\/div>/
  );
});

test('phase 1: .page-fade-top is fixed at viewport top, non-interactive, gradient uses var(--bg), z-index 22', () => {
  // Extract the .page-fade-top rule body
  const m = TEMPLATE.match(/\.page-fade-top\s*\{([^}]*)\}/);
  assert.ok(m, '.page-fade-top rule missing');
  const body = m[1];
  assert.match(body, /position:\s*fixed/, 'position: fixed missing');
  assert.match(body, /pointer-events:\s*none/, 'pointer-events: none missing');
  assert.match(body, /background:\s*linear-gradient\([^)]*var\(--bg\)[^)]*\)/, 'gradient with var(--bg) missing');
  assert.match(body, /z-index:\s*22/, 'z-index: 22 missing');
  assert.match(body, /height:\s*24px/, 'height: 24px missing');
});

test('phase 1: .page-fade-top is hidden in print', () => {
  // The existing @media print block hides .topbar, .progress, .skip-link, etc.
  // .page-fade-top must be in that list.
  assert.match(
    TEMPLATE,
    /@media print\s*\{[\s\S]*?\.page-fade-top[\s\S]*?display:\s*none/,
    '.page-fade-top should be in @media print hide list'
  );
});

/* -------------------------------------------------------------------------
   Phase 2 — Sidenote fade-in
   ------------------------------------------------------------------------- */

test('phase 2: <head> contains js-on bootstrap script', () => {
  // Must run before <body> parses so .js-on is on <html> before sidenotes paint.
  const headMatch = TEMPLATE.match(/<head>([\s\S]*?)<\/head>/);
  assert.ok(headMatch, '<head> block missing');
  assert.match(
    headMatch[1],
    /<script>\s*document\.documentElement\.classList\.add\(['"]js-on['"]\)\s*;?\s*<\/script>/,
    'js-on bootstrap script missing from <head>'
  );
});

test('phase 2: sidenote CSS has transition + js-on scoped opacity states + reduced-motion override', () => {
  // .sidenote always has the transition (so the no-JS fallback degrades cleanly)
  assert.match(
    TEMPLATE,
    /\.sidenote\s*\{[^}]*transition:\s*opacity\s+240ms\s+cubic-bezier\(\.22,\s*1,\s*\.36,\s*1\)/,
    '.sidenote transition rule missing'
  );
  // Hidden state scoped to .js-on
  assert.match(
    TEMPLATE,
    /\.js-on\s+\.sidenote\s*\{\s*opacity:\s*0\s*;?\s*\}/,
    '.js-on .sidenote { opacity: 0 } missing'
  );
  // Revealed state
  assert.match(
    TEMPLATE,
    /\.js-on\s+\.sidenote\.is-revealed\s*\{\s*opacity:\s*1\s*;?\s*\}/,
    '.js-on .sidenote.is-revealed { opacity: 1 } missing'
  );
  // Reduced-motion override
  assert.match(
    TEMPLATE,
    /@media\s+\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\.js-on\s+\.sidenote\s*\{\s*opacity:\s*1[\s\S]*?\}/,
    'reduced-motion override for .js-on .sidenote missing'
  );
});

test('phase 2: sidenote observer wired with correct rootMargin and ancestor lookup', () => {
  assert.match(
    TEMPLATE,
    /rootMargin:\s*['"]0px 0px -30% 0px['"]/,
    'sidenote observer rootMargin "0px 0px -30% 0px" missing'
  );
  assert.match(
    TEMPLATE,
    /closest\(['"]p,\s*li,\s*blockquote['"]\)/,
    'closest("p, li, blockquote") ancestor lookup missing'
  );
  assert.match(
    TEMPLATE,
    /\.classList\.add\(['"]is-revealed['"]\)/,
    'is-revealed class application missing'
  );
});

test('phase 2: reduced-motion / no-IntersectionObserver early-out reveals all sidenotes', () => {
  // Must contain a matchMedia check for reduced motion.
  assert.match(
    TEMPLATE,
    /matchMedia\(['"]\(prefers-reduced-motion:\s*reduce\)['"]\)/,
    'matchMedia("(prefers-reduced-motion: reduce)") check missing'
  );
  // Must check for IntersectionObserver feature detection in the sidenote path.
  // (The template already has IntersectionObserver elsewhere; this asserts the
  //  early-out branch reveals all sidenotes when the feature is unavailable.)
  assert.match(
    TEMPLATE,
    /reduced\s*\|\|\s*!\(['"]IntersectionObserver['"]\s+in\s+window\)[\s\S]*?forEach[\s\S]*?is-revealed/,
    'sidenote reduced-motion / no-IO early-out branch missing'
  );
});

/* -------------------------------------------------------------------------
   Phase 3 — Sticky section indicator
   ------------------------------------------------------------------------- */

test('phase 3: section-indicator markup exists with aria-hidden and label span', () => {
  assert.match(
    TEMPLATE,
    /<div class="section-indicator"\s+id="section-indicator"\s+aria-hidden="true">[\s\S]*?<span class="section-indicator__label">[\s\S]*?<\/span>[\s\S]*?<\/div>/,
    'section-indicator markup with aria-hidden and label span missing'
  );
});

test('phase 3: .section-indicator CSS has correct position, opacity states, and responsive hiding', () => {
  const m = TEMPLATE.match(/\.section-indicator\s*\{([^}]*)\}/);
  assert.ok(m, '.section-indicator rule missing');
  const body = m[1];
  assert.match(body, /position:\s*fixed/, 'position: fixed missing');
  assert.match(body, /top:\s*var\(--s-4\)/, 'top: var(--s-4) missing');
  assert.match(body, /left:\s*var\(--s-4\)/, 'left: var(--s-4) missing');
  assert.match(body, /opacity:\s*0/, 'default opacity: 0 missing');
  assert.match(body, /transition:\s*opacity\s+200ms/, 'opacity transition missing');
  assert.match(body, /pointer-events:\s*none/, 'pointer-events: none missing');

  // Visible state
  assert.match(
    TEMPLATE,
    /\.section-indicator\.is-visible\s*\{\s*opacity:\s*1\s*;?\s*\}/,
    '.section-indicator.is-visible { opacity: 1 } missing'
  );

  // Hidden below 640px
  assert.match(
    TEMPLATE,
    /@media\s+\(max-width:\s*640px\)\s*\{[\s\S]*?\.section-indicator\s*\{\s*display:\s*none/,
    '.section-indicator should be hidden below 640px'
  );

  // Hidden in print
  assert.match(
    TEMPLATE,
    /@media\s+print\s*\{[\s\S]*?\.section-indicator\s*\{\s*display:\s*none[\s\S]*?\}|@media\s+print[\s\S]*?\.section-indicator/,
    '.section-indicator should be hidden in print'
  );
});

test('phase 3: existing active-heading observer updates the section-indicator label text', () => {
  // The existing observer at template.html:2052 should now also write
  // link.textContent.trim() to .section-indicator__label inside its callback.
  assert.match(
    TEMPLATE,
    /indicatorLabel\.textContent\s*=\s*link\.textContent\.trim\(\)/,
    'section-indicator label update wiring missing from active-heading observer'
  );
});

test('phase 3: h1 visibility observer toggles .is-visible with threshold 0', () => {
  assert.match(
    TEMPLATE,
    /new IntersectionObserver\(\s*entries\s*=>\s*\{[\s\S]*?h1Visible[\s\S]*?indicator\.classList\.toggle\(\s*['"]is-visible['"]/,
    'h1 visibility observer toggling .is-visible missing'
  );
  // Confirm threshold: 0
  assert.match(
    TEMPLATE,
    /h1Observer[\s\S]*?threshold:\s*0|threshold:\s*0[\s\S]*?h1Observer/,
    'h1 observer threshold: 0 missing'
  );
});

test('phase 3: no-h2 guard prevents indicator from showing with empty label', () => {
  assert.match(
    TEMPLATE,
    /hasH2\s*=\s*document\.querySelector\(['"]article h2['"]\)\s*!==\s*null/,
    'hasH2 guard for no-<h2> case missing'
  );
});
