import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const skillDir = path.dirname(new URL(import.meta.url).pathname);
const TEMPLATE = fs.readFileSync(path.join(skillDir, 'template.html'), 'utf8');

test('template contains a report-index placeholder script', () => {
  assert.match(TEMPLATE, /<script id="report-index" type="application\/json">/);
  // Must have an empty default body so a never-swept report still parses.
  assert.match(TEMPLATE, /<script id="report-index" type="application\/json">\s*\{\s*"generated_at":\s*"",\s*"current_slug":\s*"",\s*"reports":\s*\[\]\s*\}\s*<\/script>/);
});

test('template contains Cmd-O overlay markup', () => {
  assert.match(TEMPLATE, /<div class="report-switcher"\s+id="report-switcher"\s+role="dialog"\s+aria-modal="true"/);
  assert.match(TEMPLATE, /<input[^>]*id="report-switcher-input"/);
  assert.match(TEMPLATE, /<ul[^>]*id="report-switcher-list"/);
  assert.match(TEMPLATE, /class="report-switcher__hint"/);
  assert.match(TEMPLATE, /aria-labelledby="report-switcher-title"/);
});

test('template overlay CSS uses existing tokens not new ones', () => {
  assert.doesNotMatch(TEMPLATE, /--switcher-/);
  assert.match(TEMPLATE, /\.report-switcher\s*\{/);
  assert.match(TEMPLATE, /\.report-switcher\[hidden\]/);
});

test('template topbar contains the open-switcher button', () => {
  assert.match(TEMPLATE, /<button[^>]*id="open-report-switcher"[^>]*>[\s\S]*?Reports[\s\S]*?<\/button>/);
  assert.match(TEMPLATE, /__openReportSwitcher/);
});

test('template includes the report-switcher script with key behaviors', () => {
  assert.match(TEMPLATE, /report-switcher-open/);
  assert.match(TEMPLATE, /report-switcher-close/);
  assert.match(TEMPLATE, /getElementById\(['"]report-index['"]\)/);
  assert.match(TEMPLATE, /title.*tags.*summary.*eyebrow|tags.*summary.*eyebrow.*title/s);
  assert.match(TEMPLATE, /current_slug/);
  assert.match(TEMPLATE, /e\.key\s*===\s*['"]o['"]/i);
  assert.match(TEMPLATE, /prefers-reduced-motion/);
});
