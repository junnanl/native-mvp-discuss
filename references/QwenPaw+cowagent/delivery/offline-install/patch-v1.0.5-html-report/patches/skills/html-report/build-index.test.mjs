import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { extractFrontmatterFromHtml, buildIndex } from './build-index.mjs';

function makeReportsDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'reports-idx-'));
}

function writeFakeReport(dir, filename, fm) {
  const fmLines = Object.entries(fm).map(([k, v]) =>
    Array.isArray(v) ? `${k}: [${v.join(', ')}]` : `${k}: ${v}`
  ).join('\n');
  const html = `<html><body><script id="source-md" type="text/markdown">
---
${fmLines}
---

## Body
A paragraph of words to count.
</script></body></html>`;
  fs.writeFileSync(path.join(dir, filename), html, 'utf8');
}

test('extractFrontmatterFromHtml pulls fields from the embedded source-md script', () => {
  const html = `
<html><body>
<script id="source-md" type="text/markdown">
---
title: A worked example
summary: One sentence.
generated_by: node:test
date: 2026-05-05
tags: [a, b, c]
status: final
sources: 3
version: 2
eyebrow: Section · Subsection
---

## Body
</script>
</body></html>`;
  const fm = extractFrontmatterFromHtml(html);
  assert.equal(fm.title, 'A worked example');
  assert.equal(fm.summary, 'One sentence.');
  assert.equal(fm.generated_by, 'node:test');
  assert.equal(fm.date, '2026-05-05');
  assert.deepEqual(fm.tags, ['a', 'b', 'c']);
  assert.equal(fm.status, 'final');
  assert.equal(fm.sources, '3');
  assert.equal(fm.version, '2');
  assert.equal(fm.eyebrow, 'Section · Subsection');
});

test('extractFrontmatterFromHtml returns null when source script missing', () => {
  const html = `<html><body><p>No script.</p></body></html>`;
  assert.equal(extractFrontmatterFromHtml(html), null);
});

test('extractFrontmatterFromHtml returns null on malformed frontmatter', () => {
  const html = `<script id="source-md" type="text/markdown">
no frontmatter here just body
</script>`;
  assert.equal(extractFrontmatterFromHtml(html), null);
});

test('buildIndex sorts reports newest first by date then last_modified then slug', () => {
  const dir = makeReportsDir();
  writeFakeReport(dir, 'alpha-2026-05-10.html', {
    title: 'Alpha', summary: 'A.', generated_by: 'x', date: '2026-05-10', status: 'draft',
  });
  writeFakeReport(dir, 'bravo-2026-05-12.html', {
    title: 'Bravo', summary: 'B.', generated_by: 'x', date: '2026-05-12', status: 'final',
  });
  writeFakeReport(dir, 'charlie-2026-05-11.html', {
    title: 'Charlie', summary: 'C.', generated_by: 'x', date: '2026-05-11', status: 'reviewed',
  });
  const index = buildIndex(dir);
  assert.equal(index.report_count, 3);
  assert.deepEqual(index.reports.map(r => r.title), ['Bravo', 'Charlie', 'Alpha']);
  assert.ok(index.generated_at.match(/^\d{4}-\d{2}-\d{2}T/));
});

test('buildIndex skips files without an embedded source-md script', () => {
  const dir = makeReportsDir();
  writeFakeReport(dir, 'good-2026-05-12.html', {
    title: 'Good', summary: '.', generated_by: 'x', date: '2026-05-12', status: 'draft',
  });
  fs.writeFileSync(path.join(dir, 'orphan.html'), '<html><body>No script.</body></html>', 'utf8');
  const index = buildIndex(dir);
  assert.equal(index.report_count, 1);
  assert.equal(index.reports[0].title, 'Good');
});

test('buildIndex skips index.html itself', () => {
  const dir = makeReportsDir();
  writeFakeReport(dir, 'a-2026-05-12.html', {
    title: 'A', summary: '.', generated_by: 'x', date: '2026-05-12', status: 'draft',
  });
  writeFakeReport(dir, 'index.html', {
    title: 'Index', summary: '.', generated_by: 'x', date: '2099-01-01', status: 'draft',
  });
  const index = buildIndex(dir);
  assert.equal(index.report_count, 1);
  assert.equal(index.reports[0].title, 'A');
});

test('buildIndex omits optional fields when missing', () => {
  const dir = makeReportsDir();
  writeFakeReport(dir, 'minimal-2026-05-12.html', {
    title: 'Minimal', summary: '.', generated_by: 'x', date: '2026-05-12', status: 'draft',
  });
  const entry = buildIndex(dir).reports[0];
  assert.equal('tags' in entry, false);
  assert.equal('version' in entry, false);
  assert.equal('eyebrow' in entry, false);
});

test('buildIndex emits an empty index when no reports exist', () => {
  const dir = makeReportsDir();
  const index = buildIndex(dir);
  assert.equal(index.report_count, 0);
  assert.deepEqual(index.reports, []);
});

import { writeIndexArtifacts, safeJsonForScript } from './build-index.mjs';

test('writeIndexArtifacts writes index.json with the expected shape', () => {
  const dir = makeReportsDir();
  writeFakeReport(dir, 'a-2026-05-12.html', {
    title: 'A', summary: '.', generated_by: 'x', date: '2026-05-12', status: 'draft',
  });
  const index = buildIndex(dir);
  writeIndexArtifacts(dir, index);
  const jsonPath = path.join(dir, 'index.json');
  assert.ok(fs.existsSync(jsonPath), 'index.json should exist');
  const parsed = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  assert.equal(parsed.report_count, 1);
  assert.equal(parsed.reports[0].title, 'A');
});

test('safeJsonForScript escapes embedded </script>', () => {
  const json = safeJsonForScript({ title: 'A </script> attack' });
  assert.doesNotMatch(json, /<\/script>/);
  assert.match(json, /<\\\/script>/);
  assert.equal(JSON.parse(json.replace(/<\\\/script>/g, '</script>')).title, 'A </script> attack');
});

import { sweepInlineIndex } from './build-index.mjs';

function writeReportWithPlaceholder(dir, filename, fm) {
  const fmLines = Object.entries(fm).map(([k, v]) =>
    Array.isArray(v) ? `${k}: [${v.join(', ')}]` : `${k}: ${v}`
  ).join('\n');
  const html = `<html><body>
<script id="report-index" type="application/json">
{ "generated_at": "", "current_slug": "", "reports": [] }
</script>
<script id="source-md" type="text/markdown">
---
${fmLines}
---

## Body
</script>
</body></html>`;
  fs.writeFileSync(path.join(dir, filename), html, 'utf8');
}

test('sweepInlineIndex updates the report-index block in every report and stamps current_slug', () => {
  const dir = makeReportsDir();
  writeReportWithPlaceholder(dir, 'a-2026-05-10.html', {
    title: 'A', summary: '.', generated_by: 'x', date: '2026-05-10', status: 'draft',
  });
  writeReportWithPlaceholder(dir, 'b-2026-05-12.html', {
    title: 'B', summary: '.', generated_by: 'x', date: '2026-05-12', status: 'final',
  });
  const index = buildIndex(dir);
  sweepInlineIndex(dir, index);

  const aHtml = fs.readFileSync(path.join(dir, 'a-2026-05-10.html'), 'utf8');
  const bHtml = fs.readFileSync(path.join(dir, 'b-2026-05-12.html'), 'utf8');
  const aData = JSON.parse(/<script id="report-index"[^>]*>([\s\S]*?)<\/script>/.exec(aHtml)[1]);
  const bData = JSON.parse(/<script id="report-index"[^>]*>([\s\S]*?)<\/script>/.exec(bHtml)[1]);

  assert.equal(aData.current_slug, 'a');
  assert.equal(bData.current_slug, 'b');
  assert.equal(aData.reports.length, 2);
  assert.equal(bData.reports.length, 2);
});

test('sweepInlineIndex is idempotent', () => {
  const dir = makeReportsDir();
  writeReportWithPlaceholder(dir, 'a-2026-05-10.html', {
    title: 'A', summary: '.', generated_by: 'x', date: '2026-05-10', status: 'draft',
  });
  const index = buildIndex(dir);
  sweepInlineIndex(dir, index);
  const before = fs.readFileSync(path.join(dir, 'a-2026-05-10.html'), 'utf8');
  sweepInlineIndex(dir, index);
  const after = fs.readFileSync(path.join(dir, 'a-2026-05-10.html'), 'utf8');
  assert.equal(before, after);
});

test('sweepInlineIndex skips files without the report-index placeholder', () => {
  const dir = makeReportsDir();
  fs.writeFileSync(path.join(dir, 'orphan.html'), '<html><body>No placeholder.</body></html>', 'utf8');
  writeReportWithPlaceholder(dir, 'a-2026-05-10.html', {
    title: 'A', summary: '.', generated_by: 'x', date: '2026-05-10', status: 'draft',
  });
  const index = buildIndex(dir);
  sweepInlineIndex(dir, index);
  const orphan = fs.readFileSync(path.join(dir, 'orphan.html'), 'utf8');
  assert.equal(orphan, '<html><body>No placeholder.</body></html>');
});

test('sweepInlineIndex skips index.html', () => {
  const dir = makeReportsDir();
  fs.writeFileSync(path.join(dir, 'index.html'),
    '<html><body><script id="report-index" type="application/json">{"reports":[]}</script></body></html>',
    'utf8'
  );
  writeReportWithPlaceholder(dir, 'a-2026-05-10.html', {
    title: 'A', summary: '.', generated_by: 'x', date: '2026-05-10', status: 'draft',
  });
  const index = buildIndex(dir);
  const before = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  sweepInlineIndex(dir, index);
  const after = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  assert.equal(before, after);
});

test('writeIndexArtifacts also writes index.html with the expected table shape', () => {
  const dir = makeReportsDir();
  writeFakeReport(dir, 'a-2026-05-12.html', {
    title: 'Alpha', summary: 'Lede.', generated_by: 'x',
    date: '2026-05-12', status: 'draft', tags: ['x', 'y'],
  });
  const index = buildIndex(dir);
  writeIndexArtifacts(dir, index);
  const htmlPath = path.join(dir, 'index.html');
  assert.ok(fs.existsSync(htmlPath));
  const html = fs.readFileSync(htmlPath, 'utf8');
  assert.match(html, /<title>Reports/);
  assert.match(html, /Research vault/);
  assert.match(html, /1 report/);
  assert.match(html, /<script id="report-index" type="application\/json">/);
  assert.match(html, /<table class="reports-table"/);
  assert.match(html, /<th[^>]*data-col="date"/);
  assert.match(html, /<th[^>]*data-col="title"/);
  assert.match(html, /<th[^>]*data-col="status"/);
  assert.match(html, /Alpha/);
  assert.match(html, /class="status-dot status-dot--draft"/);
});
