import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const skillDir = path.dirname(new URL(import.meta.url).pathname);
const TEMPLATE = fs.readFileSync(path.join(skillDir, 'template.html'), 'utf8');

/* -------------------------------------------------------------------------
   Task 1 — CSS atom root + variants
   ------------------------------------------------------------------------- */

test('css: defines .report-comment-pop root rule', () => {
  assert.match(TEMPLATE, /\.report-comment-pop\s*\{/);
});

test('css: defines .report-comment-pop--rail variant', () => {
  assert.match(TEMPLATE, /\.report-comment-pop--rail\s*\{/);
});

test('css: defines .report-comment-pop--float variant', () => {
  assert.match(TEMPLATE, /\.report-comment-pop--float\s*\{/);
});

test('css: float variant defines tail via ::before', () => {
  assert.match(TEMPLATE, /\.report-comment-pop--float[^{]*::before\s*\{/);
});

test('css: rail variant draws tether (::before line + ::after dot) toward the article', () => {
  assert.match(TEMPLATE, /\.report-comment-pop--rail::before\s*\{/);
  assert.match(TEMPLATE, /\.report-comment-pop--rail::after\s*\{/);
});

test('css: introduces no new --report-comment-pop-* custom properties', () => {
  assert.doesNotMatch(TEMPLATE, /--report-comment-pop-/);
});

test('css: has a reduced-motion guard inside the popup block', () => {
  const idx = TEMPLATE.search(/\.report-comment-pop\s*\{/);
  assert.ok(idx >= 0, '.report-comment-pop rule must exist before reduced-motion check');
  const window = TEMPLATE.slice(idx, idx + 2000);
  assert.match(window, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
});

/* -------------------------------------------------------------------------
   Task 2 — Atom internal rules
   ------------------------------------------------------------------------- */

test('css: defines .report-comment-pop__head', () => {
  assert.match(TEMPLATE, /\.report-comment-pop__head\s*\{/);
});

test('css: defines .report-comment-pop__id with monospace font', () => {
  const m = TEMPLATE.match(/\.report-comment-pop__id\s*\{([^}]*)\}/);
  assert.ok(m, '.report-comment-pop__id rule missing');
  assert.match(m[1], /font-family:\s*var\(--font-mono\)/);
});

test('css: defines .report-comment-pop__status', () => {
  assert.match(TEMPLATE, /\.report-comment-pop__status\s*\{/);
});

test('css: defines .report-comment-pop__field with vertical resize', () => {
  const m = TEMPLATE.match(/\.report-comment-pop__field\s*\{([^}]*)\}/);
  assert.ok(m, '.report-comment-pop__field rule missing');
  assert.match(m[1], /resize:\s*vertical/);
});

test('css: defines .report-comment-pop__hint', () => {
  assert.match(TEMPLATE, /\.report-comment-pop__hint\s*\{/);
});

test('css: defines .report-comment-pop__actions as a flex row', () => {
  const m = TEMPLATE.match(/\.report-comment-pop__actions\s*\{([^}]*)\}/);
  assert.ok(m, '.report-comment-pop__actions rule missing');
  assert.match(m[1], /display:\s*flex/);
});

test('css: Save action is a text-link, not a filled button (no accent background)', () => {
  const popBlock = TEMPLATE.match(/\/\* ---------- Comment popup[\s\S]*?\/\* ----------/);
  assert.ok(popBlock, 'popup CSS block must be wrapped between sentinel comments');
  assert.doesNotMatch(popBlock[0], /\.report-comment-pop[^{]*button[^{]*\{[^}]*background:\s*var\(--accent\)/);
});

/* -------------------------------------------------------------------------
   Task 3 — JS module skeleton
   ------------------------------------------------------------------------- */

test('js: defines a popup IIFE assigned to `popup`', () => {
  assert.match(TEMPLATE, /const\s+popup\s*=\s*\(\s*(?:\(\)|function)/);
});

test('js: popup IIFE exposes open / close / isDirty', () => {
  const m = TEMPLATE.match(/const\s+popup\s*=\s*\(\s*(?:\(\)|function)[\s\S]*?return\s*\{([^}]+)\}\s*;?\s*\}\s*\)\s*\(\s*\)\s*;/);
  assert.ok(m, 'popup IIFE must end with a return { ... } block');
  const exported = m[1];
  assert.match(exported, /\bopen\b/);
  assert.match(exported, /\bclose\b/);
  assert.match(exported, /\bisDirty\b/);
});

test('js: popup body declares stubs for pickMode / mountRail / mountFloat / placeFloat / buildAtom / bindKeys', () => {
  const body = TEMPLATE.match(/const\s+popup\s*=\s*\(\s*\(\)\s*=>\s*\{([\s\S]*?)return\s*\{[^}]+\}\s*;?\s*\}\s*\)\s*\(\s*\)\s*;/);
  assert.ok(body, 'popup IIFE body not found');
  const src = body[1];
  for (const fn of ['pickMode', 'mountRail', 'mountFloat', 'placeFloat', 'buildAtom', 'bindKeys']) {
    assert.match(src, new RegExp(`function\\s+${fn}\\s*\\(`), `expected function ${fn}(`);
  }
});

/* -------------------------------------------------------------------------
   Task 4 — buildAtom
   ------------------------------------------------------------------------- */

test('js: buildAtom creates a form rooted with class report-comment-pop', () => {
  const m = TEMPLATE.match(/function\s+buildAtom\s*\(([^)]*)\)\s*\{([\s\S]*?)^\s{4,}\}/m);
  assert.ok(m, 'buildAtom function body not found');
  const body = m[2];
  assert.match(body, /report-comment-pop/);
  assert.match(body, /report-comment-pop__head/);
  assert.match(body, /report-comment-pop__id/);
  assert.match(body, /report-comment-pop__status/);
  assert.match(body, /report-comment-pop__field/);
  assert.match(body, /report-comment-pop__hint/);
  assert.match(body, /report-comment-pop__actions/);
});

test('js: buildAtom emits role="dialog" and aria-labelledby', () => {
  const m = TEMPLATE.match(/function\s+buildAtom\s*\([^)]*\)\s*\{([\s\S]*?)^\s{4,}\}/m);
  assert.ok(m);
  assert.match(m[1], /role=["']dialog["']/);
  assert.match(m[1], /aria-labelledby/);
});

test('js: buildAtom renders <kbd>⌘</kbd>, <kbd>↵</kbd>, <kbd>Esc</kbd> in the hint row', () => {
  const m = TEMPLATE.match(/function\s+buildAtom\s*\([^)]*\)\s*\{([\s\S]*?)^\s{4,}\}/m);
  assert.ok(m);
  assert.match(m[1], /<kbd>⌘<\/kbd>/);
  assert.match(m[1], /<kbd>↵<\/kbd>/);
  assert.match(m[1], /<kbd>Esc<\/kbd>/);
});

test('js: buildAtom shows Cancel and Save in new mode', () => {
  const m = TEMPLATE.match(/function\s+buildAtom\s*\([^)]*\)\s*\{([\s\S]*?)^\s{4,}\}/m);
  assert.ok(m);
  assert.match(m[1], /data-action=["']cancel["']/);
  assert.match(m[1], /data-action=["']save["']/);
});

test('js: buildAtom shows Delete only in edit mode', () => {
  const m = TEMPLATE.match(/function\s+buildAtom\s*\([^)]*\)\s*\{([\s\S]*?)^\s{4,}\}/m);
  assert.ok(m);
  assert.match(m[1], /mode\s*===?\s*['"]edit['"][\s\S]*?data-action=["']delete["']|data-action=["']delete["'][\s\S]*?mode\s*===?\s*['"]edit['"]/);
});

/* -------------------------------------------------------------------------
   Task 5 — pickMode + mountRail
   ------------------------------------------------------------------------- */

test('js: pickMode reads matchMedia (min-width: 1280px) and returns rail|float', () => {
  const m = TEMPLATE.match(/function\s+pickMode\s*\(\s*\)\s*\{([\s\S]*?)^\s{4,}\}/m);
  assert.ok(m, 'pickMode body missing');
  assert.match(m[1], /matchMedia\(\s*['"]\(min-width:\s*1280px\)['"]\s*\)/);
  assert.match(m[1], /['"]rail['"]/);
  assert.match(m[1], /['"]float['"]/);
});

test('js: mountRail inserts wrapper into the report-comment-margin column', () => {
  const m = TEMPLATE.match(/function\s+mountRail\s*\([^)]*\)\s*\{([\s\S]*?)^\s{4,}\}/m);
  assert.ok(m, 'mountRail body missing');
  assert.match(m[1], /report-comment-margin/);
  assert.match(m[1], /data-report-comment-target/);
  assert.match(m[1], /report-comment-pop--rail/);
});

/* -------------------------------------------------------------------------
   Task 6 — mountFloat + placeFloat
   ------------------------------------------------------------------------- */

test('js: mountFloat wraps the atom with --float modifier and uses absolute positioning', () => {
  const m = TEMPLATE.match(/function\s+mountFloat\s*\([^)]*\)\s*\{([\s\S]*?)^\s{4,}\}/m);
  assert.ok(m, 'mountFloat body missing');
  assert.match(m[1], /report-comment-pop--float/);
  assert.match(m[1], /document\.body\.appendChild|\.appendChild\(/);
});

test('js: placeFloat reads viewport bounds and applies inline top/left', () => {
  const m = TEMPLATE.match(/function\s+placeFloat\s*\([^)]*\)\s*\{([\s\S]*?)^\s{4,}\}/m);
  assert.ok(m, 'placeFloat body missing');
  assert.match(m[1], /innerWidth/);
  assert.match(m[1], /innerHeight/);
  assert.match(m[1], /\.style\.left\s*=/);
  assert.match(m[1], /\.style\.top\s*=/);
});

test('js: placeFloat flips above the anchor when bottom would clip', () => {
  const m = TEMPLATE.match(/function\s+placeFloat\s*\([^)]*\)\s*\{([\s\S]*?)^\s{4,}\}/m);
  assert.ok(m);
  assert.match(m[1], /data-tail-side["'`,\s]*above|setAttribute\(\s*['"]data-tail-side['"]\s*,\s*['"]above['"]/);
});

test('js: placeFloat shifts the popup left when its right edge would clip', () => {
  const m = TEMPLATE.match(/function\s+placeFloat\s*\([^)]*\)\s*\{([\s\S]*?)^\s{4,}\}/m);
  assert.ok(m);
  assert.match(m[1], /right|innerWidth\s*-/);
});

test('js: placeFloat scrolls the anchor into view when below the fold', () => {
  const m = TEMPLATE.match(/function\s+placeFloat\s*\([^)]*\)\s*\{([\s\S]*?)^\s{4,}\}/m);
  assert.ok(m);
  assert.match(m[1], /scrollIntoView|window\.scrollBy|scrollTo/);
});

/* -------------------------------------------------------------------------
   Task 7 — open / close / bindKeys
   ------------------------------------------------------------------------- */

test('js: open() calls pickMode, builds atom, mounts via chosen wrapper, focuses textarea', () => {
  const m = TEMPLATE.match(/function\s+open\s*\(\s*\{[^}]*\}\s*\)\s*\{([\s\S]*?)^\s{6,}\}/m);
  assert.ok(m, 'open body missing');
  assert.match(m[1], /pickMode\(/);
  assert.match(m[1], /buildAtom\(/);
  assert.match(m[1], /mountRail\(|mountFloat\(/);
  assert.match(m[1], /\.focus\(\)/);
});

test('js: open() saves initialBody from comment.body in edit mode', () => {
  const m = TEMPLATE.match(/function\s+open\s*\(\s*\{[^}]*\}\s*\)\s*\{([\s\S]*?)^\s{6,}\}/m);
  assert.ok(m);
  assert.match(m[1], /initialBody/);
});

test('js: close() restores focus to originEl', () => {
  const m = TEMPLATE.match(/function\s+close\s*\([^)]*\)\s*\{([\s\S]*?)^\s{6,}\}/m);
  assert.ok(m, 'close body missing');
  assert.match(m[1], /originEl[\s\S]*?\.focus\(\)|focus\(\)[\s\S]*?originEl/);
});

test('js: bindKeys listens for Cmd/Ctrl+Enter to save and Escape to close', () => {
  const m = TEMPLATE.match(/function\s+bindKeys\s*\([^)]*\)\s*\{([\s\S]*?)^\s{6,}\}/m);
  assert.ok(m, 'bindKeys body missing');
  assert.match(m[1], /metaKey|ctrlKey/);
  assert.match(m[1], /['"]Enter['"]/);
  assert.match(m[1], /['"]Escape['"]/);
});

/* -------------------------------------------------------------------------
   Task 8 — save / delete API
   ------------------------------------------------------------------------- */

test('js: save() in new mode POSTs to /api/comments with { target, body }', () => {
  const m = TEMPLATE.match(/function\s+save\s*\(\s*\)\s*\{([\s\S]*?)^\s{6,}\}/m);
  assert.ok(m, 'save body missing');
  assert.match(m[1], /request\(\s*['"`]\/api\/comments['"`]\s*,\s*\{[^}]*method:\s*['"]POST['"]/);
  assert.match(m[1], /JSON\.stringify\(\s*\{\s*target/);
});

test('js: save() in edit mode PUTs to /api/comments/:id with { body }', () => {
  const m = TEMPLATE.match(/function\s+save\s*\(\s*\)\s*\{([\s\S]*?)^\s{6,}\}/m);
  assert.ok(m);
  assert.match(m[1], /\/api\/comments\/\$\{/);
  assert.match(m[1], /method:\s*['"]PUT['"]/);
});

test('js: deleteCurrent() DELETEs /api/comments/:id', () => {
  const m = TEMPLATE.match(/function\s+deleteCurrent\s*\(\s*\)\s*\{([\s\S]*?)^\s{6,}\}/m);
  assert.ok(m, 'deleteCurrent body missing');
  assert.match(m[1], /method:\s*['"]DELETE['"]/);
});

test('js: save() success path calls upsertComment then setActiveComment', () => {
  const m = TEMPLATE.match(/function\s+save\s*\(\s*\)\s*\{([\s\S]*?)^\s{6,}\}/m);
  assert.ok(m);
  const upsertIdx = m[1].indexOf('upsertComment');
  const setActiveIdx = m[1].indexOf('setActiveComment');
  assert.ok(upsertIdx >= 0 && setActiveIdx >= 0, 'both upsertComment and setActiveComment must be referenced');
  assert.ok(upsertIdx < setActiveIdx, 'upsertComment must be called before setActiveComment');
});

/* -------------------------------------------------------------------------
   Task 9 — confirm strips + status pill
   ------------------------------------------------------------------------- */

test('js: close() honors checkDirty by calling isDirty before discarding', () => {
  const m = TEMPLATE.match(/function\s+close\s*\([^)]*\)\s*\{([\s\S]*?)^\s{6,}\}/m);
  assert.ok(m);
  assert.match(m[1], /isDirty\(\)/);
});

test('js: requestDiscardConfirm swaps the actions row to Keep / Discard', () => {
  const m = TEMPLATE.match(/function\s+requestDiscardConfirm\s*\(\s*\)\s*\{([\s\S]*?)^\s{6,}\}/m);
  assert.ok(m, 'requestDiscardConfirm body missing');
  assert.match(m[1], /Keep/);
  assert.match(m[1], /Discard/);
});

test('js: deleteCurrent goes through a confirm strip (Cancel / Delete) before issuing DELETE', () => {
  const m = TEMPLATE.match(/function\s+deleteCurrent\s*\(\s*\)\s*\{([\s\S]*?)^\s{6,}\}/m);
  assert.ok(m);
  assert.match(m[1], /requestDeleteConfirm|confirmDelete|confirmed/);
});

test('js: toggle-status pill triggers a resolve/reopen PUT with { status }', () => {
  const m = TEMPLATE.match(/function\s+bindKeys\s*\([^)]*\)\s*\{([\s\S]*?)^\s{6,}\}/m);
  assert.ok(m);
  assert.match(m[1], /data-action=["']toggle-status["']/);
  assert.match(TEMPLATE, /method:\s*['"]PUT['"][\s\S]{0,160}status:/);
});

/* -------------------------------------------------------------------------
   Task 10 — Resize / breakpoint listener
   ------------------------------------------------------------------------- */

test('js: popup listens for the 1280px breakpoint crossover and closes', () => {
  assert.match(TEMPLATE, /matchMedia\(\s*['"]\(min-width:\s*1280px\)['"]\s*\)[\s\S]{0,200}addEventListener\(\s*['"]change['"]/);
});

/* -------------------------------------------------------------------------
   Task 11 — Call sites switched to popup.open
   ------------------------------------------------------------------------- */

test('js: block click in comment mode invokes popup.open', () => {
  const m = TEMPLATE.match(/querySelectorAll\(['"]\[data-report-block-id\]['"]\)[\s\S]*?addEventListener\(['"]click['"][\s\S]*?\}\s*\)/);
  assert.ok(m, 'block-click handler not found');
  assert.match(m[0], /popup\.open\(/);
});

test('js: openCommentEditor (pin / tray / margin paths) routes through popup.open', () => {
  const m = TEMPLATE.match(/function\s+openCommentEditor\s*\([^)]*\)\s*\{([\s\S]*?)^\s{4,}\}/m);
  assert.ok(m, 'openCommentEditor not found');
  assert.match(m[1], /popup\.open\(/);
  assert.match(m[1], /mode:\s*['"]edit['"]/);
});

test('js: openCommentEditor no longer calls openReviewDialog', () => {
  const m = TEMPLATE.match(/function\s+openCommentEditor\s*\([^)]*\)\s*\{([\s\S]*?)^\s{4,}\}/m);
  assert.ok(m);
  assert.doesNotMatch(m[1], /openReviewDialog\s*\(/);
});

test('js: openResolveDialog uses popup.open in edit mode (status toggle happens via pill)', () => {
  const m = TEMPLATE.match(/function\s+openResolveDialog\s*\([^)]*\)\s*\{([\s\S]*?)^\s{4,}\}/m);
  assert.ok(m, 'openResolveDialog not found');
  assert.match(m[1], /popup\.open\(/);
  assert.doesNotMatch(m[1], /openReviewDialog\s*\(/);
});

/* -------------------------------------------------------------------------
   Task 12 — Old code removed
   ------------------------------------------------------------------------- */

test('css: .review-inline-composer rule has been removed', () => {
  assert.doesNotMatch(TEMPLATE, /\.review-inline-composer\b/);
});

test('css: .review-dialog rule has been removed', () => {
  assert.doesNotMatch(TEMPLATE, /\.review-dialog\b/);
});

test('js: openInlineCommentComposer is gone', () => {
  assert.doesNotMatch(TEMPLATE, /openInlineCommentComposer\s*\(/);
});

test('js: closeInlineCommentComposer is gone', () => {
  assert.doesNotMatch(TEMPLATE, /closeInlineCommentComposer\s*\(/);
});

test('js: openReviewDialog / closeReviewDialog / ensureReviewDialog are gone', () => {
  assert.doesNotMatch(TEMPLATE, /openReviewDialog\s*\(/);
  assert.doesNotMatch(TEMPLATE, /closeReviewDialog\s*\(/);
  assert.doesNotMatch(TEMPLATE, /ensureReviewDialog\s*\(/);
});

test('js: reviewInsertOutsideContainer is gone', () => {
  assert.doesNotMatch(TEMPLATE, /reviewInsertOutsideContainer\s*\(/);
});

test('js: keydown handler no longer references inlineCommentComposer or reviewDialog locals', () => {
  const keydown = TEMPLATE.match(/document\.addEventListener\(\s*['"]keydown['"][\s\S]*?\}\s*\)\s*;/);
  assert.ok(keydown);
  assert.doesNotMatch(keydown[0], /\binlineCommentComposer\b/);
  assert.doesNotMatch(keydown[0], /\breviewDialog\b/);
});
