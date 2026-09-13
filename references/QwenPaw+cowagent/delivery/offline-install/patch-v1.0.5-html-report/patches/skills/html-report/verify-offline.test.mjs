import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const skillDir = path.dirname(new URL(import.meta.url).pathname);
const verifier = path.join(skillDir, 'verify-offline.mjs');

function verify(html) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'html-report-verify-'));
  const report = path.join(dir, 'report.html');
  fs.writeFileSync(report, html, 'utf8');
  return spawnSync('node', [verifier, report], { encoding: 'utf8' });
}

test('accepts a self-contained report and SVG namespace', () => {
  const result = verify('<svg xmlns="http://www.w3.org/2000/svg"></svg><script id="source-md"></script>');
  assert.equal(result.status, 0, result.stderr);
});

test('rejects remote URLs', () => {
  const result = verify('<img src="https://cdn.example.com/chart.png"><script id="source-md"></script>');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /remote URLs/);
});

test('rejects output without embedded Markdown source', () => {
  const result = verify('<!doctype html><p>report</p>');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Markdown source/);
});
