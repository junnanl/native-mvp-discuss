#!/usr/bin/env node
/** Verify that a rendered report is non-empty and has no remote URL dependencies. */

import fs from 'node:fs';
import path from 'node:path';

const input = process.argv[2];
if (!input) {
  console.error('Usage: node verify-offline.mjs <report.html>');
  process.exit(1);
}

const reportPath = path.resolve(input);
if (!fs.existsSync(reportPath) || fs.statSync(reportPath).size === 0) {
  console.error(`error: report is missing or empty: ${reportPath}`);
  process.exit(1);
}

const html = fs.readFileSync(reportPath, 'utf8');
const urls = html.match(/https?:\/\/[^"'<>\s]+/gi) || [];
const blocked = [...new Set(
  urls.filter(url => url.replace(/\/$/, '') !== 'http://www.w3.org/2000/svg')
)];

if (blocked.length > 0) {
  console.error('error: remote URLs found in offline report:');
  for (const url of blocked) console.error(`- ${url}`);
  process.exit(1);
}

if (!/<script[^>]*\bid=["']source-md["']/i.test(html)) {
  console.error('error: embedded Markdown source is missing');
  process.exit(1);
}

console.log(`✓ offline report verified: ${reportPath}`);
