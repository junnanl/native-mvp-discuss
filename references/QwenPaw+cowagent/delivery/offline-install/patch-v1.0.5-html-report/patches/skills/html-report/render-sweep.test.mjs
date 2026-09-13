import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

const skillDir = path.dirname(new URL(import.meta.url).pathname);
const RENDER = path.join(skillDir, 'render.mjs');

function makeFixtureDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'report-sweep-'));
}

function writeReport(dir, name, frontmatter, body = '## A section\n\nBody.') {
  const fmLines = Object.entries(frontmatter).map(([k, v]) =>
    Array.isArray(v) ? `${k}: [${v.join(', ')}]` : `${k}: ${v}`
  ).join('\n');
  const md = `---\n${fmLines}\n---\n\n${body}\n`;
  const inputPath = path.join(dir, `${name}.md`);
  fs.writeFileSync(inputPath, md, 'utf8');
  return inputPath;
}

test('render rejects unknown status values', () => {
  const dir = makeFixtureDir();
  const input = writeReport(dir, 'bad-status', {
    title: 'Bad status',
    summary: 'Test.',
    generated_by: 'node:test',
    date: '2026-05-12',
    status: 'pending', // not in the closed set
  });
  let err;
  try {
    execFileSync('node', [RENDER, input], { encoding: 'utf8', stdio: 'pipe' });
  } catch (e) { err = e; }
  assert.ok(err, 'render should have exited non-zero');
  const stderr = (err.stderr || '') + (err.stdout || '');
  assert.match(stderr, /status/);
  assert.match(stderr, /draft|in-review|reviewed|final/);
});

test('render defaults missing status to draft and warns', () => {
  const dir = makeFixtureDir();
  const input = writeReport(dir, 'no-status', {
    title: 'No status',
    summary: 'Test.',
    generated_by: 'node:test',
    date: '2026-05-12',
  });
  const res = spawnSync('node', [RENDER, input], { encoding: 'utf8' });
  assert.equal(res.status, 0, `render should succeed; stderr=${res.stderr}`);
  assert.match(res.stderr, /defaulted status=draft/);
});

test('rendered report carries an inline report-index snapshot with current_slug', () => {
  const dir = makeFixtureDir();
  const input = writeReport(dir, 'fresh', {
    title: 'Fresh', summary: '.', generated_by: 'x',
    date: '2026-05-12', status: 'final',
  });
  execFileSync('node', [RENDER, input], { encoding: 'utf8' });
  const outputs = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'index.html');
  assert.equal(outputs.length, 1);
  const html = fs.readFileSync(path.join(dir, outputs[0]), 'utf8');
  const m = /<script id="report-index" type="application\/json">([\s\S]*?)<\/script>/.exec(html);
  assert.ok(m, 'inline index block must exist');
  const data = JSON.parse(m[1]);
  assert.ok(data.generated_at, 'generated_at should be populated');
  assert.equal(data.current_slug, 'fresh');
  assert.ok(Array.isArray(data.reports));
});

test('rendering a new report updates the snapshot of an existing report', () => {
  const dir = makeFixtureDir();
  writeReport(dir, 'alpha', {
    title: 'Alpha', summary: '.', generated_by: 'x',
    date: '2026-05-10', status: 'draft',
  });
  execFileSync('node', [RENDER, path.join(dir, 'alpha.md')], { encoding: 'utf8' });
  writeReport(dir, 'bravo', {
    title: 'Bravo', summary: '.', generated_by: 'x',
    date: '2026-05-12', status: 'final',
  });
  execFileSync('node', [RENDER, path.join(dir, 'bravo.md')], { encoding: 'utf8' });

  const alphaHtml = fs.readFileSync(
    path.join(dir, fs.readdirSync(dir).find(f => f.startsWith('alpha-'))),
    'utf8'
  );
  const m = /<script id="report-index"[^>]*>([\s\S]*?)<\/script>/.exec(alphaHtml);
  const data = JSON.parse(m[1]);
  assert.equal(data.current_slug, 'alpha');
  assert.equal(data.reports.length, 2);
  assert.deepEqual(data.reports.map(r => r.title).sort(), ['Alpha', 'Bravo']);
});
