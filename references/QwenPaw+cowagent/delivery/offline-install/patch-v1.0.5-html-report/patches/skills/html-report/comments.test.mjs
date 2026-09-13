import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawn } from 'node:child_process';
import {
  cleanReportComments,
  deleteReportComment,
  extractEmbeddedMarkdown,
  filterReportComments,
  formatReviewSummary,
  insertReportComment,
  parseReportComments,
  replaceBodyKeepingComments,
  replaceEmbeddedMarkdown,
  updateReportComment,
} from './comments.mjs';

const skillDir = path.dirname(new URL(import.meta.url).pathname);

test('parses open and resolved report comments', () => {
  const md = `<!-- @report-comment id="c1" status="open" target="block:b2"
Rewrite this.
-->

Paragraph.

<!-- @report-comment id="c2" status="resolved" target="block:b3"
Already handled.

Resolved: Updated the evidence.
-->`;

  const comments = parseReportComments(md);

  assert.equal(comments.length, 2);
  assert.deepEqual(comments.map(c => [c.id, c.status, c.target]), [
    ['c1', 'open', 'block:b2'],
    ['c2', 'resolved', 'block:b3'],
  ]);
  assert.equal(comments[0].body, 'Rewrite this.');
  assert.equal(comments[1].body, 'Already handled.');
  assert.equal(comments[1].resolvedNote, 'Updated the evidence.');
});

test('filters report comments by status', () => {
  const comments = [
    { id: 'c1', status: 'open' },
    { id: 'c2', status: 'resolved' },
  ];

  assert.deepEqual(filterReportComments(comments, 'open').map(c => c.id), ['c1']);
  assert.deepEqual(filterReportComments(comments, 'resolved').map(c => c.id), ['c2']);
  assert.deepEqual(filterReportComments(comments, 'all').map(c => c.id), ['c1', 'c2']);
  assert.deepEqual(filterReportComments(comments).map(c => c.id), ['c1', 'c2']);
});

test('formats review comments as a markdown summary', () => {
  const markdown = formatReviewSummary([
    { id: 'c1', status: 'open', target: 'block:b2', body: 'Add source.' },
    { id: 'c2', status: 'resolved', target: 'block:b3', body: 'Clarify.', resolvedNote: 'Clarified wording.' },
  ], 'Review Fixture');

  assert.match(markdown, /# Review Comments: Review Fixture/);
  assert.match(markdown, /Open comments: 1/);
  assert.match(markdown, /Resolved comments: 1/);
  assert.match(markdown, /## c1 — open — block:b2/);
  assert.match(markdown, /Add source\./);
  assert.match(markdown, /Resolved: Clarified wording\./);
});

test('inserts, updates, deletes, and cleans markers', () => {
  let md = 'First paragraph.\n\nSecond paragraph.\n';

  md = insertReportComment(md, {
    id: 'c1',
    status: 'open',
    target: 'block:b2',
    body: 'Make this specific.',
  }, 1);

  assert.match(md, /@report-comment id="c1"/);
  assert.match(md, /Second paragraph\./);

  md = updateReportComment(md, 'c1', {
    status: 'resolved',
    body: 'Make this specific.',
    resolvedNote: 'Added source evidence.',
  });

  assert.match(md, /status="resolved"/);
  assert.match(md, /Resolved: Added source evidence\./);

  md = deleteReportComment(md, 'c1');
  assert.doesNotMatch(md, /@report-comment/);

  md = insertReportComment(md, {
    id: 'c2',
    status: 'open',
    target: 'block:b1',
    body: 'Remove later.',
  }, 0);

  assert.equal(cleanReportComments(md).trim(), 'First paragraph.\n\nSecond paragraph.');
});

test('replaceBodyKeepingComments re-anchors existing comments to incoming body', () => {
  const current = `Old first.

<!-- @report-comment id="c1" status="open" target="block:b2"
Original concern.
-->

Old second.

<!-- @report-comment id="c2" status="resolved" target="block:b3"
Already handled.

Resolved: noted.
-->

Old third.
`;

  const newBody = 'New first.\n\nNew second.\n\nNew third.\n';
  const merged = replaceBodyKeepingComments(current, newBody);

  // Both comments survive with original metadata.
  const comments = parseReportComments(merged);
  assert.equal(comments.length, 2);
  assert.deepEqual(comments.map(c => [c.id, c.status, c.target]), [
    ['c1', 'open', 'block:b2'],
    ['c2', 'resolved', 'block:b3'],
  ]);
  assert.equal(comments[0].body, 'Original concern.');
  assert.equal(comments[1].resolvedNote, 'noted.');

  // Stripping the comments yields the new body, not a mix of old + new.
  const stripped = cleanReportComments(merged).trim();
  assert.equal(stripped, 'New first.\n\nNew second.\n\nNew third.');

  // When the incoming body already includes a stale marker, it is discarded
  // before re-injecting (so we never double-write the same comment).
  const newBodyWithStaleMarker = `New first.

<!-- @report-comment id="c1" status="open" target="block:b1"
Stale copy.
-->

New second.
`;
  const merged2 = replaceBodyKeepingComments(current, newBodyWithStaleMarker);
  const ids = parseReportComments(merged2).map(c => c.id).sort();
  assert.deepEqual(ids, ['c1', 'c2']);
});

test('replaces only the embedded markdown script block', () => {
  const html = '<main>Visible article</main><script id="source-md" type="text/markdown">\nOld\n</script><footer>Keep me</footer>';

  assert.equal(extractEmbeddedMarkdown(html), 'Old\n');

  const next = replaceEmbeddedMarkdown(html, 'New\n');

  assert.match(next, /<main>Visible article<\/main>/);
  assert.match(next, /<footer>Keep me<\/footer>/);
  assert.match(next, /<script id="source-md" type="text\/markdown">\nNew\n<\/script>/);
});

test('rendered reports show open and resolved review annotations', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'report-comments-'));
  const input = path.join(dir, 'fixture.md');
  const output = path.join(dir, 'fixture.html');
  fs.writeFileSync(input, `---
title: Review Annotation Fixture
summary: A fixture for review comments.
generated_by: node:test
date: 2026-05-11
---

## Findings

<!-- @report-comment id="c1" status="open" target="block:b2"
Please add the section reference.
-->

This paragraph needs a review note.

<!-- @report-comment id="c2" status="resolved" target="block:b3"
Make the next paragraph more precise.

Resolved: Added the precise wording.
-->

This paragraph has been handled.
`, 'utf8');

  execFileSync('node', [path.join(skillDir, 'render.mjs'), input, output], { encoding: 'utf8' });
  const html = fs.readFileSync(output, 'utf8');
  const visibleHtml = html.replace(/<script id="source-md"[\s\S]*?<\/script>/, '');

  assert.match(html, /data-report-block-id="block:b2"/);
  assert.match(visibleHtml, /class="report-comment-margin"/);
  assert.match(visibleHtml, /class="report-comment-note"/);
  assert.match(visibleHtml, /report-comment-note__meta/);
  assert.match(visibleHtml, /report-comment-note__body/);
  assert.match(visibleHtml, /report-comment-note__resolved/);
  assert.match(visibleHtml, /data-report-comment-marker="c1"/);
  assert.match(visibleHtml, /data-report-comment-status="open"/);
  assert.match(visibleHtml, /id="comment-c1"/);
  assert.match(visibleHtml, /data-report-comment-marker="c2"/);
  assert.match(visibleHtml, /data-report-comment-status="resolved"/);
  assert.match(visibleHtml, /Please add the section reference\./);
  assert.match(visibleHtml, /Resolved: Added the precise wording\./);
  assert.doesNotMatch(visibleHtml, /report-comment-card/);
  assert.doesNotMatch(visibleHtml, /report-comment-stack/);
});

test('tables that anchor a review comment opt out of the right-rail breakout', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'report-table-comment-overlap-'));
  const inputCommented = path.join(dir, 'commented.md');
  const inputPlain = path.join(dir, 'plain.md');
  const outputCommented = path.join(dir, 'commented.html');
  const outputPlain = path.join(dir, 'plain.html');

  fs.writeFileSync(inputCommented, `---
title: Table comment anchor fixture
summary: A table whose first row carries an open review comment.
generated_by: node:test
date: 2026-05-12
---

## Findings

<!-- @report-comment id="c1" status="open" target="block:b2"
Pin sits in the right rail next to this row.
-->

| Field | Notes |
|-------|-------|
| One   | a     |
| Two   | b     |
`, 'utf8');

  fs.writeFileSync(inputPlain, `---
title: Table without comment anchor
summary: Same table shape, no review comment.
generated_by: node:test
date: 2026-05-12
---

## Findings

| Field | Notes |
|-------|-------|
| One   | a     |
| Two   | b     |
`, 'utf8');

  execFileSync('node', [path.join(skillDir, 'render.mjs'), inputCommented, outputCommented], { encoding: 'utf8' });
  execFileSync('node', [path.join(skillDir, 'render.mjs'), inputPlain, outputPlain], { encoding: 'utf8' });

  const commentedHtml = fs.readFileSync(outputCommented, 'utf8');
  const plainHtml = fs.readFileSync(outputPlain, 'utf8');

  assert.match(commentedHtml, /<div class="table-wrap" data-report-has-comment="true">/);
  assert.match(commentedHtml, /class="report-comment-margin"/);
  // Plain tables (no anchored comment) keep the right-rail breakout — the
  // attribute is only added to <div class="table-wrap"> elements in the body,
  // never as a default.
  assert.doesNotMatch(plainHtml, /<div class="table-wrap"[^>]*data-report-has-comment/);
  assert.match(plainHtml, /<div class="table-wrap"><table>/);

  const template = fs.readFileSync(path.join(skillDir, 'template.html'), 'utf8');
  assert.match(template, /\.table-wrap\[data-report-has-comment="true"\][^{]*\{\s*margin-right:\s*0;/);
  assert.match(template, /enclosingTable\s*=\s*block\.closest\('\.table-wrap'\)/);
  assert.match(template, /enclosingTable\.dataset\.reportHasComment = 'true'/);
  assert.match(template, /\.table-wrap\[data-report-has-comment="true"\]'\)\.forEach\(tableWrap/);
});

test('clean-comments removes markers and visible annotations from a rendered report', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'report-clean-comments-'));
  const input = path.join(dir, 'fixture.md');
  const output = path.join(dir, 'fixture.html');
  fs.writeFileSync(input, `---
title: Cleanup Fixture
summary: A fixture for cleaning review comments.
generated_by: node:test
date: 2026-05-11
---

## Findings

<!-- @report-comment id="c1" status="open" target="block:b2"
Remove this during cleanup.
-->

This paragraph should remain.
`, 'utf8');

  execFileSync('node', [path.join(skillDir, 'render.mjs'), input, output], { encoding: 'utf8' });
  execFileSync('node', [path.join(skillDir, 'clean-comments.mjs'), output], { encoding: 'utf8' });
  const html = fs.readFileSync(output, 'utf8');

  assert.doesNotMatch(html, /@report-comment/);
  assert.doesNotMatch(html, /data-report-comment-id="c1"/);
  assert.doesNotMatch(html, /Remove this during cleanup\./);
  assert.match(html, /This paragraph should remain\./);
});

test('review server writes comments into embedded markdown only', async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'report-review-server-'));
  const input = path.join(dir, 'fixture.md');
  const output = path.join(dir, 'fixture.html');
  fs.writeFileSync(input, `---
title: Review Server Fixture
summary: A fixture for the review server.
generated_by: node:test
date: 2026-05-11
---

## Findings

This paragraph can receive a server comment.
`, 'utf8');

  execFileSync('node', [path.join(skillDir, 'render.mjs'), input, output], { encoding: 'utf8' });
  const before = fs.readFileSync(output, 'utf8');
  const server = spawn('node', [path.join(skillDir, 'review.mjs'), output, '--port', '0'], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  try {
    const url = await new Promise((resolve, reject) => {
      let stdout = '';
      let stderr = '';
      const timer = setTimeout(() => reject(new Error(`Timed out waiting for review server. ${stderr}`)), 3000);
      server.stdout.on('data', chunk => {
        stdout += chunk.toString();
        const match = stdout.match(/Review server: (http:\/\/127\.0\.0\.1:\d+\/)/);
        if (match) {
          clearTimeout(timer);
          resolve(match[1]);
        }
      });
      server.stderr.on('data', chunk => { stderr += chunk.toString(); });
      server.on('exit', code => {
        if (/listen EPERM/.test(stderr)) {
          clearTimeout(timer);
          resolve(null);
          return;
        }
        reject(new Error(`Review server exited early with ${code}. ${stderr}`));
      });
    });

    if (!url) {
      t.skip('sandbox blocked local review server listen');
      return;
    }

    const created = await fetch(`${url}api/comments`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ target: 'block:b2', body: 'Server-added comment.' }),
    });
    assert.equal(created.status, 201);

    const comments = await (await fetch(`${url}api/comments`)).json();
    assert.equal(comments.length, 1);
    assert.equal(comments[0].body, 'Server-added comment.');

    const resolved = await fetch(`${url}api/comments/${encodeURIComponent(comments[0].id)}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status: 'resolved', resolvedNote: 'Handled in review.' }),
    });
    assert.equal(resolved.status, 200);
    const resolvedComment = await resolved.json();
    assert.equal(resolvedComment.status, 'resolved');
    assert.equal(resolvedComment.resolvedNote, 'Handled in review.');

    const openAfterResolve = await (await fetch(`${url}api/comments?status=open`)).json();
    const resolvedAfterResolve = await (await fetch(`${url}api/comments?status=resolved`)).json();
    assert.deepEqual(openAfterResolve.map(comment => comment.id), []);
    assert.deepEqual(resolvedAfterResolve.map(comment => comment.id), [comments[0].id]);

    const reopened = await fetch(`${url}api/comments/${encodeURIComponent(comments[0].id)}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status: 'open', resolvedNote: '' }),
    });
    assert.equal(reopened.status, 200);
    const reopenedComment = await reopened.json();
    assert.equal(reopenedComment.status, 'open');
    assert.equal(reopenedComment.resolvedNote, '');

    const after = fs.readFileSync(output, 'utf8');
    assert.match(after, /@report-comment id="c1" status="open" target="block:b2"/);
    assert.match(after, /Server-added comment\./);
    assert.equal(before.replace(/<script id="source-md"[\s\S]*?<\/script>/, ''), after.replace(/<script id="source-md"[\s\S]*?<\/script>/, ''));
    assert.doesNotMatch(after, /data-report-comment-id="c1"/);
  } finally {
    server.kill('SIGTERM');
  }
});

test('review server serves sibling reports and the index page', async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'report-review-server-dir-'));
  function writeMd(name, title) {
    fs.writeFileSync(path.join(dir, name), `---
title: ${title}
summary: Test.
generated_by: t
date: 2026-05-12
status: draft
---

## A

Paragraph.
`, 'utf8');
  }
  writeMd('alpha.md', 'Alpha Report');
  writeMd('bravo.md', 'Bravo Report');
  execFileSync('node', [path.join(skillDir, 'render.mjs'), path.join(dir, 'alpha.md'), '--no-open'], { encoding: 'utf8' });
  execFileSync('node', [path.join(skillDir, 'render.mjs'), path.join(dir, 'bravo.md'), '--no-open'], { encoding: 'utf8' });
  const alphaFile = fs.readdirSync(dir).find(f => f.startsWith('alpha-') && f.endsWith('.html'));
  const bravoFile = fs.readdirSync(dir).find(f => f.startsWith('bravo-') && f.endsWith('.html'));

  // Start server on directory (not single file).
  const server = spawn('node', [path.join(skillDir, 'review.mjs'), dir, '--port', '0'], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  try {
    const url = await new Promise((resolve, reject) => {
      let stdout = '';
      let stderr = '';
      const timer = setTimeout(() => reject(new Error(`Timed out. ${stderr}`)), 3000);
      server.stdout.on('data', chunk => {
        stdout += chunk.toString();
        const m = stdout.match(/Review server: (http:\/\/127\.0\.0\.1:\d+\/)/);
        if (m) { clearTimeout(timer); resolve(m[1]); }
      });
      server.stderr.on('data', chunk => { stderr += chunk.toString(); });
      server.on('exit', code => {
        if (/listen EPERM/.test(stderr)) { clearTimeout(timer); resolve(null); return; }
        reject(new Error(`exited ${code}: ${stderr}`));
      });
    });
    if (!url) { t.skip('sandbox'); return; }

    const indexRes = await fetch(`${url}index.html`);
    assert.equal(indexRes.status, 200, 'index.html should be served');
    assert.match(await indexRes.text(), /<table class="reports-table"/);

    const alphaRes = await fetch(`${url}${alphaFile}`);
    assert.equal(alphaRes.status, 200, 'alpha should be served');
    const alphaHtml = await alphaRes.text();
    assert.match(alphaHtml, /data-review-mode="true"/);
    assert.match(alphaHtml, /Alpha Report/);

    const bravoRes = await fetch(`${url}${bravoFile}`);
    assert.equal(bravoRes.status, 200, 'bravo should be served');
    assert.match(await bravoRes.text(), /Bravo Report/);

    // Path traversal blocked
    const evil = await fetch(`${url}../etc/passwd`);
    assert.notEqual(evil.status, 200);

    // Comments API derives file from Referer
    const created = await fetch(`${url}api/comments`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'referer': `${url}${bravoFile}` },
      body: JSON.stringify({ target: 'block:b2', body: 'Bravo note.' }),
    });
    assert.equal(created.status, 201);
    const bravoHtmlAfter = fs.readFileSync(path.join(dir, bravoFile), 'utf8');
    assert.match(bravoHtmlAfter, /Bravo note\./);
    const alphaHtmlAfter = fs.readFileSync(path.join(dir, alphaFile), 'utf8');
    assert.doesNotMatch(alphaHtmlAfter, /Bravo note\./);

    // .md sibling must also be updated so the source survives a re-render
    // and so any agent reading bravo.md sees the new comment.
    const bravoMdAfter = fs.readFileSync(path.join(dir, 'bravo.md'), 'utf8');
    assert.match(bravoMdAfter, /Bravo note\./);
    const alphaMdAfter = fs.readFileSync(path.join(dir, 'alpha.md'), 'utf8');
    assert.doesNotMatch(alphaMdAfter, /Bravo note\./);
  } finally {
    server.kill('SIGTERM');
  }
});

test('review server PUT /api/source writes back .md and preserves comments', async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'report-review-source-'));
  const input = path.join(dir, 'editable.md');
  fs.writeFileSync(input, `---
title: Editable Fixture
summary: Fixture for full-body edits via the review server.
generated_by: node:test
date: 2026-05-12
---

## Findings

This paragraph will be edited.
`, 'utf8');

  execFileSync('node', [path.join(skillDir, 'render.mjs'), input, '--no-open'], { encoding: 'utf8' });
  const htmlFile = fs.readdirSync(dir).find(f => f.startsWith('editable-') && f.endsWith('.html'));
  const htmlPath = path.join(dir, htmlFile);

  const server = spawn('node', [path.join(skillDir, 'review.mjs'), htmlPath, '--port', '0'], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  try {
    const url = await new Promise((resolve, reject) => {
      let stdout = '';
      let stderr = '';
      const timer = setTimeout(() => reject(new Error(`Timed out. ${stderr}`)), 3000);
      server.stdout.on('data', chunk => {
        stdout += chunk.toString();
        const m = stdout.match(/Review server: (http:\/\/127\.0\.0\.1:\d+\/)/);
        if (m) { clearTimeout(timer); resolve(m[1]); }
      });
      server.stderr.on('data', chunk => { stderr += chunk.toString(); });
      server.on('exit', code => {
        if (/listen EPERM/.test(stderr)) { clearTimeout(timer); resolve(null); return; }
        reject(new Error(`exited ${code}: ${stderr}`));
      });
    });
    if (!url) { t.skip('sandbox'); return; }

    // First land a comment on block:b2 via the existing comments endpoint.
    const created = await fetch(`${url}api/comments`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ target: 'block:b2', body: 'Keep me through edits.' }),
    });
    assert.equal(created.status, 201);

    // Now overwrite the source with an edited body that does NOT include the
    // comment marker — this mimics what the browser editor sends after the
    // user edits prose and hits Save.
    const editedBody = `---
title: Editable Fixture
summary: Fixture for full-body edits via the review server.
generated_by: node:test
date: 2026-05-12
---

## Findings

This paragraph has been edited in the browser.
`;
    const saved = await fetch(`${url}api/source`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ markdown: editedBody }),
    });
    assert.equal(saved.status, 200);
    const savedBody = await saved.json();
    assert.equal(savedBody.ok, true);

    // Sibling .md is updated and contains the edited prose.
    const mdAfter = fs.readFileSync(input, 'utf8');
    assert.match(mdAfter, /has been edited in the browser\./);
    assert.doesNotMatch(mdAfter, /This paragraph will be edited\./);

    // Comment survives — both in sibling .md and in embedded HTML source.
    assert.match(mdAfter, /@report-comment .* target="block:b2"/);
    assert.match(mdAfter, /Keep me through edits\./);
    const htmlAfter = fs.readFileSync(htmlPath, 'utf8');
    assert.match(htmlAfter, /Keep me through edits\./);

    // GET /api/comments still lists the comment with original metadata.
    const after = await (await fetch(`${url}api/comments`)).json();
    assert.equal(after.length, 1);
    assert.equal(after[0].body, 'Keep me through edits.');
    assert.equal(after[0].target, 'block:b2');

    // Empty body is rejected.
    const empty = await fetch(`${url}api/source`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ markdown: '   ' }),
    });
    assert.equal(empty.status, 400);
  } finally {
    server.kill('SIGTERM');
  }
});

test('review-summary writes a markdown review report', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'report-review-summary-'));
  const html = path.join(dir, 'fixture.html');
  const out = path.join(dir, 'summary.md');

  fs.writeFileSync(html, '<title>Fixture Title</title><script id="source-md" type="text/markdown">\n<!-- @report-comment id="c1" status="open" target="block:b2"\nAdd source.\n-->\n</script>', 'utf8');

  execFileSync('node', [path.join(skillDir, 'review-summary.mjs'), html, out], { encoding: 'utf8' });
  const summary = fs.readFileSync(out, 'utf8');

  assert.match(summary, /# Review Comments: Fixture Title/);
  assert.match(summary, /## c1 — open — block:b2/);
  assert.match(summary, /Add source\./);
});

test('review UI does not depend on unsupported browser prompt dialogs', () => {
  const template = fs.readFileSync(path.join(skillDir, 'template.html'), 'utf8');

  assert.doesNotMatch(template, /window\.prompt|window\.alert/);
  assert.doesNotMatch(template, /window\.location\.reload/);
  assert.match(template, /report-comment-pop/);
  assert.match(template, /popup\.open\(/);
});

test('review UI requires explicit comment mode before creating new comments', () => {
  const template = fs.readFileSync(path.join(skillDir, 'template.html'), 'utf8');

  assert.match(template, /id="review-comment-toggle"/);
  assert.match(template, /data-comment-mode="true"/);
  assert.match(template, /aria-label="Start comment mode"/);
  assert.match(template, /if \(document\.body\.dataset\.commentMode !== 'true'\) return;/);
  assert.match(template, /\[data-review-mode="true"\] \[data-comment-mode="true"\] \[data-report-block-id\]/);
});

test('review UI provides a tray and readable margin notes', () => {
  const template = fs.readFileSync(path.join(skillDir, 'template.html'), 'utf8');

  assert.match(template, /review-tray/);
  assert.match(template, /review-tray__filter/);
  assert.match(template, /renderReviewTray/);
  assert.match(template, /setActiveComment/);
  assert.match(template, /data-report-comment-marker/);
  assert.match(template, /report-comment-margin/);
  assert.match(template, /report-comment-note/);
  assert.match(template, /report-comment-note__body/);
  assert.match(template, /clear: right/);
  assert.match(template, /layoutReportCommentMargins/);
  assert.match(template, /scheduleReportCommentLayout/);
  assert.match(template, /useDesktopMargin/);
  assert.match(template, /article\.appendChild\(wrap\)/);
  assert.doesNotMatch(template, /report-comment-card/);
  assert.doesNotMatch(template, /report-comment-stack/);
  assert.doesNotMatch(template, /translateY\(calc\(-100% - var\(--s-3\)\)\)/);
  assert.doesNotMatch(template, />!<\/a>|>R<\/a>/);
  assert.doesNotMatch(template, /report-comment-markers/);
});

test('review UI starts with a collapsed rail and expandable tray', () => {
  const template = fs.readFileSync(path.join(skillDir, 'template.html'), 'utf8');

  assert.match(template, /class="topbar__btn review-rail" id="review-rail"/);
  assert.match(template, /review-tray--open/);
  assert.match(template, /toggleReviewTray/);
  assert.match(template, /closeReviewTray/);
  assert.match(template, /<span data-review-rail-open-count>0<\/span><span>\/<\/span><span data-review-rail-total-count>0<\/span>/);
  assert.doesNotMatch(template, /\.review-rail\s*\{\s*position:\s*fixed;/);
  assert.doesNotMatch(template, /\[data-review-mode="true"\] \.review-tray\s*\{\s*display:\s*block;/);
});

test('review UI opens new comments in a unified popup surface', () => {
  const template = fs.readFileSync(path.join(skillDir, 'template.html'), 'utf8');

  assert.match(template, /report-comment-pop/);
  assert.match(template, /popup\.open\(\s*\{\s*mode:\s*['"]new['"]/);
  assert.match(template, /popup\.open\(\s*\{\s*mode:\s*['"]edit['"]/);
  assert.doesNotMatch(template, /review-inline-composer/);
  assert.doesNotMatch(template, /openInlineCommentComposer/);
});

test('review UI supports resolve and reopen actions', () => {
  const template = fs.readFileSync(path.join(skillDir, 'template.html'), 'utf8');

  assert.match(template, /openResolveDialog/);
  assert.match(template, /data-action="resolve"/);
  assert.match(template, /data-action="reopen"/);
});

test('review UI supports comment mode and keyboard flow', () => {
  const template = fs.readFileSync(path.join(skillDir, 'template.html'), 'utf8');

  assert.match(template, /review-mode-banner/);
  assert.match(template, /toggleCommentMode/);
  assert.match(template, /jumpToNextOpenComment/);
  assert.match(template, /event\.metaKey \|\| event\.ctrlKey/);
  assert.match(template, /event\.altKey && event\.code === 'KeyC'/);
  assert.match(template, /event\.key === 'n'/);
});

test('review UI supports block and comment deep links', () => {
  const template = fs.readFileSync(path.join(skillDir, 'template.html'), 'utf8');

  assert.match(template, /handleReviewHash/);
  assert.match(template, /flashReviewTarget/);
  assert.match(template, /#comment-/);
  assert.match(template, /#block-/);
});
