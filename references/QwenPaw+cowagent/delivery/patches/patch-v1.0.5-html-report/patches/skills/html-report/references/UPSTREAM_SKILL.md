---
name: report
description: Render a research, documentation, or analysis report as a designed HTML document using the project template, instead of emitting a raw `.md` file. Use whenever the user asks for a report, analysis, deep-dive, investigation, postmortem, summary, write-up, briefing, or any structured long-form (>500 words, multiple sections) output that would normally be a Markdown file. The user reads these in the browser as a designed document. Triggers: "report on X", "analyze X", "research X", "deep-dive on X", "investigate X", "summarise X for me", "write up X", "document X", "post-mortem", or any similar request where the natural output would be a multi-section Markdown document. Skip for: short conversational answers, single-file code edits, one-paragraph notes.
---

# Report skill

Convert agent research, documentation, code analysis, and technical write-ups into a designed HTML report instead of raw Markdown. The user reads these in the browser; the page handles light/dark theme, table of contents, footnotes, code blocks, callouts, framed figures with click-to-zoom, and one-click export back to Markdown.

## When this triggers

Any time the natural output would be a `.md` file with **headings, multiple sections, and more than ~500 words.** Specifically:

- "Write me a report / deep-dive / summary / analysis on X"
- "Investigate X and document what you find"
- "Research X and give me your findings"
- "Postmortem the Y incident"
- "Document the Z system / architecture / decision"
- "Write up the conclusions from our discussion"
- "Compare X and Y in detail"

**Skip this skill for:** quick conversational answers, single-file code edits, status updates, one-line confirmations, anything under ~300 words. The user wants this for *real* reports, not for every response.

## The workflow

1. **Write the report as Markdown with YAML frontmatter** (see [Frontmatter](#frontmatter) and [Markdown syntax](#markdown-syntax) below). Save it to the project's `reports/` directory.
2. **Run the renderer:**
   ```bash
   node ~/.claude/skills/report/render.mjs reports/your-report.md
   ```
   This produces `reports/<title-slug>-<date>.html` in the same directory.
3. **Tell the user where to open it.** Provide the absolute file path; they open it in their browser.

The cost: the agent writes Markdown only. Token spend is identical to writing a plain `.md` file. The HTML is generated mechanically by the renderer.

## Editing an existing report

When the user asks to update, edit, modify, or expand an existing report — **do not re-write it from scratch.** Edit the source Markdown and re-render. This preserves footnotes, tags, structure, and keeps the diff small.

Two cases:

**Case A — the source `.md` still exists** (it always does, if the report was rendered into `reports/`):

1. Read `reports/<slug>-<date>.md` (or whatever the source file is called).
2. Apply the user's requested edit by editing the Markdown directly.
3. Re-render:
   ```bash
   node ~/.claude/skills/report/render.mjs reports/<slug>-<date>.md
   ```
   The HTML at `reports/<slug>-<date>.html` is overwritten in place.
4. Tell the user the report has been updated and point at the same HTML path. They refresh the browser tab.

**Case B — only the `.html` exists** (rare; the `.md` was deleted or the report came from elsewhere):

1. Recover the source Markdown from the embedded `<script id="source-md">` block:
   ```bash
   node ~/.claude/skills/report/extract.mjs reports/the-report.html
   ```
   This writes `reports/the-report.md` next to the HTML. Pass `--force` to overwrite an existing `.md`.
2. Edit the recovered `.md`.
3. Re-render with `render.mjs` as in Case A.

**Pinning the output filename.** By default `render.mjs` derives the output filename from the title slug and date, which means changing the title or letting the date roll forward will produce a *new* HTML file. To keep the output path stable across edits, pass it explicitly:

```bash
node ~/.claude/skills/report/render.mjs reports/the-report.md reports/the-report.html
```

Use this when the user expects "the report" to live at a fixed URL or path across edits.

**Do not hand-edit the rendered HTML.** Edits made directly to the `.html` will be lost the next time the report is re-rendered, and the embedded source `.md` will go out of sync with the visible content. Always edit the Markdown.

## Reviewing a rendered report with comments

Use the review workflow when the user says they want to comment on a rendered report, rerun with comments, apply report comments, revise the report from review notes, or approve the report as final.

### Start a review session

The rendered HTML remains the working artifact. Start the local review server against the report:

```bash
node ~/.claude/skills/report/review.mjs reports/the-report.html
```

Open the printed localhost URL. In review mode, click a report block to add a comment. The server stores comments as `@report-comment` markers inside the embedded `<script id="source-md" type="text/markdown">` Markdown block in the same HTML file.

Review comments attach to rendered blocks, not exact text ranges. The marker position in Markdown is authoritative; `block:bN` IDs are a UI aid for placing new comments.

Comment mode starts off. Use the **Comment** button or press `C` to turn it on; the banner confirms that block clicks will create new comments. Press `Esc` to leave comment mode, or `Cmd+Enter` / `Ctrl+Enter` to save the open dialog. Existing comments are managed from the review tray without entering comment mode.

The review tray is the primary comment-reading surface. It defaults to **Open**, shows open/resolved/total counts, filters comments, jumps to the target block, and supports edit, resolve, reopen, and delete actions. Press `N` to jump to the next open comment. Use `#comment-cN` links for a stable comment deep link and `#block-bN` links for a target block deep link.

To export a Markdown review report:

```bash
node ~/.claude/skills/report/review-summary.mjs reports/the-report.html
node ~/.claude/skills/report/review-summary.mjs reports/the-report.html reports/the-report-review-summary.md
```

### Rerun with comments

When the user asks to rerun or revise using report comments:

1. Read the reviewed HTML file.
2. Extract the embedded Markdown:
   ```bash
   node ~/.claude/skills/report/extract.mjs reports/the-report.html reports/the-report.md --force
   ```
3. Find all `@report-comment` markers with `status="open"`.
4. Revise only the affected block or section unless the comment explicitly asks for broader changes.
5. Change each handled marker to `status="resolved"`.
6. Add a concise `Resolved:` paragraph under the original comment text.
7. Re-render to the same HTML path:
   ```bash
   node ~/.claude/skills/report/render.mjs reports/the-report.md reports/the-report.html
   ```

Keep resolved comments during active review. They are an audit trail for what changed and why.

### Final approval cleanup

When the user approves the report as final, strip all review comments and re-render the same HTML path:

```bash
node ~/.claude/skills/report/clean-comments.mjs reports/the-report.html
```

Do not keep an audit copy unless the user explicitly asks for one.

## Frontmatter

Every report starts with a YAML frontmatter block. **Required fields are bold.**

```yaml
---
title: On the failure modes of LLM-generated frontend code   # required
summary: A pattern catalogue from two hundred reviewed PRs.  # required (one or two sentences, italicised as the lede)
generated_by: Claude Opus 4.7 (1M context)                   # required (the model authoring the report)
date: 2026-05-05                                             # required (YYYY-MM-DD; today's date)
status: draft                                                # required — one of: draft, in-review, reviewed, final
tags: [llm, frontend, design-systems]                        # optional
sources: 14                                                  # optional (count of sources cited)
version: 1                                                   # optional (defaults omitted)
eyebrow: Research report · Frontend tooling                  # optional (small caps line above the H1)
---
```

The `status:` field is a closed set: `draft`, `in-review`, `reviewed`, `final`. The renderer validates and errors on anything else. Older reports without `status:` default to `draft` with a one-line stderr nudge — add the field next time you edit them.

The renderer auto-computes reading time from the rendered word count.

## Markdown syntax

The renderer supports a focused subset of Markdown plus a handful of extensions specific to this template. Stick to what's listed below — anything else is unsupported.

### Headings

`#` is the document title (taken from frontmatter `title`; do not write `#` in body). Use `##` for top-level sections, `###` for subsections, `####` for small uppercase sub-headings. The renderer auto-generates IDs and anchor links.

```markdown
## The audit

### Method

#### Training-data median
```

### Section ledes

The first paragraph after a `##` heading, **if it is entirely italic**, is rendered as a section lede (a slightly larger italic summary line). This is a convention; use it to give every section a one-line summary that lets the reader skim:

```markdown
## The audit

*Two hundred merged or rejected pull requests across three production codebases were reviewed for design and code defects.*

The actual section body starts here…
```

### Drop cap

The first paragraph of the very first section gets a drop cap automatically. No syntax needed — write the paragraph normally.

### Inline formatting

```markdown
**bold**, *italic*, `inline code`, [link text](https://url),
==highlighted text==, footnote reference[^1]
```

### Lists

Standard Markdown ordered and unordered lists. Use the form `**Anti-reference lists in the prompt.** Body of the item.` to give numbered items a bold lead-in:

```markdown
1. **Anti-reference lists in the prompt.** Five minutes of work, reduces defects.
2. **Reference-driven prompts.** Naming two or three specific products…
```

### Tables

Pipe syntax with header + separator + rows. Use `:` in the separator for alignment (right-align is the most common case):

```markdown
| Failure mode | Surface | Frequency |
|---|---|---:|
| Card-grid reflex | Marketing | 38% |
| Hallucinated APIs | Hooks | 9% |
```

### Code blocks

Fenced with optional language and filename. Filename appears top-right of the block:

````markdown
```ts src/agent/runner.ts
import { Agent } from './agent';

export const run = async () => { ... };
```
````

The renderer applies a calm 3-color syntax tint (keywords in terracotta, strings in muted teal, comments in italic gray). It is intentionally simple — agents should not try to highlight code by hand.

### Callouts

Two systems coexist. Use the **quiet typographic** variants for soft mentions and emphasis; use the **boxed** variants when the content genuinely warrants a visual interruption.

**Quiet (typographic, no box):**

```markdown
> [NOTE] A soft mention or aside.
> [INSIGHT] A non-obvious finding worth foregrounding.
> [CAUTION] A soft warning.
> [ASIDE] A tangent that doesn't belong in the main flow.
```

**Boxed (subtle tinted panel + icon):**

```markdown
> [INFO] An important fact the reader needs to know.
> [WARNING] A must-know caution. The reader could otherwise be misled.
> [TIP] An actionable suggestion or pro-tip.
> [DANGER] Do not do this. High-severity warning.
```

Pick the lightest variant that does the job. Default to the quiet variants. Reach for boxed only when the content really deserves the visual weight.

### Footnotes

```markdown
The defect rate was lower than expected.[^1]

[^1]: Specifically, one defect per ~300 lines of changed code.
```

Footnote references render as superscript and show a hover popover on desktop. All footnote definitions are collected and rendered in a Footnotes section at the end. The numbers can be any string (`[^1]`, `[^method]`); the renderer slugs them for IDs.

### Definition lists

```markdown
Term
: definition body, possibly long enough to wrap.

Another term
: another definition.
```

Useful for compact reference blocks at the end of a section ("Lowest cost / Highest leverage / Doesn't work").

### Images and figures

A bare image on its own line becomes a framed figure with click-to-zoom:

```markdown
![Caption text describing what the image shows.](/path/or/url/to/image.png)
```

The renderer wraps it in `<figure class="framed">` with a centered caption underneath. Clicking the image opens it in a fullscreen lightbox.

For inline SVGs (charts, diagrams the agent constructs by hand), the renderer accepts `![caption](#anchor-id)` as a placeholder; the agent should then post-process the rendered HTML to inject the SVG. Most agents will not need this — prefer real image URLs.

### Horizontal rule

Three dashes on their own line: `---`. Use sparingly.

## Output convention

- **Path:** `reports/<title-slug>-<YYYY-MM-DD>.html` (the renderer derives this from frontmatter; do not pass the output path explicitly unless the user asks for a specific filename).
- **Self-contained:** the HTML file references Google Fonts via CDN but otherwise has no external dependencies. The user can open it directly with `open <path>` (macOS) or by double-clicking.
- **The original Markdown is embedded** in a `<script id="source-md" type="text/markdown" data-source-path="<basename>.md">` tag inside the HTML. Clicking "Save as MD" in the rendered page exports the exact source the agent wrote. Lossless round-trip. The `data-source-path` attribute lets the review server mirror comment writes back to the original `.md` file so the source stays canonical.
- **Review comments survive re-renders.** When the review server writes a new (or edited / resolved / deleted) `@report-comment` marker, it updates both the HTML's embedded source-md AND the sibling `.md` file. So `node render.mjs <report.md>` later picks up the same comments rather than discarding them. An agent reading the `.md` sees every comment with its target block and status.
- **Every interactive render auto-starts (or reuses) one review server per `reports/` directory** and opens the rendered report in the default browser. The server roots at the directory, so sibling reports, `index.html`, and `index.json` all resolve through the same port — Cmd-O navigation just works. A `/tmp` sidecar pid file keyed by the directory tracks the running server so subsequent renders to the same dir reuse the same port instead of stacking new processes. Pass `--no-open` to skip (batch re-renders); auto-open self-disables under non-TTY stdio (tests, CI).

## Reports index

Every render also regenerates `reports/index.json` (machine-readable) and `reports/index.html` (the editorial landing page — a sortable table with date, title, tags, reading time, and status). Open `reports/index.html` directly to browse the vault.

Inside any rendered report, press `⌘O` (mac) or `⌃O` (other) to open the Cmd-O switcher: a centered command palette that fuzzy-filters across title, tags, summary, and eyebrow. `↑/↓` to navigate, `↵` to open the active result, `⌘↵` to open in a new tab, `1`–`8` to jump directly to that row, `Esc` to close. The same action is available from the `Reports` button in the topbar.

The Cmd-O list is kept fresh by a sweep at the end of every render: each report's embedded `<script id="report-index" type="application/json">` block is rewritten to mirror the current `index.json`. No runtime fetch is required, so the switcher works under `file://`.

## Recommended structure

A good report has these top-level sections, in this order:

1. **An optional eyebrow** (small caps line above the title) — set via `eyebrow:` in frontmatter.
2. **Title** (`title:` in frontmatter).
3. **Summary / lede** (`summary:` in frontmatter) — one or two italic sentences setting up the report.
4. **Metadata block** — auto-generated.
5. **Body sections (`##`)** — each with a section lede in italic.
6. **A "What works" or "Recommendations" section** when the report is investigative.
7. **An "Open questions" section** when the report leaves things unresolved.
8. **Footnotes** — auto-collected from `[^1]` references.

Most reports do not need a Sources or Glossary section. Use them only when the report genuinely cites external material or defines jargon worth a glossary.

## Anti-patterns

Things that are out of scope for this skill — do not try to make the renderer support them:

- Inline HTML inside Markdown body (the renderer escapes it).
- Custom CSS or `<style>` overrides per report.
- Embedded JavaScript or interactive widgets.
- Multi-document reports (each report is a single HTML file).
- Reports without a frontmatter block (the renderer will fail with an error).

If you find yourself wanting any of these, the report should probably be a different kind of artifact (a real web page, a notebook, a slide deck) — not this template.

## Worked example

A complete minimal report:

```markdown
---
title: Cache invalidation strategies in the ingest pipeline
summary: Three strategies tried, one that worked, and a recommendation.
generated_by: Claude Opus 4.7 (1M context)
date: 2026-05-05
tags: [caching, ingest, performance]
sources: 6
version: 1
---

## The problem

*The pipeline was returning stale data after upstream schema changes. We tried three approaches before finding one that held under load.*

The cache layer in front of the ingest pipeline was returning rows from the previous schema version even after a successful migration. Investigating revealed three plausible failure modes and one actual one.[^1]

## What worked

*A versioned cache key plus a two-minute soft-expiry window absorbed the migration without a stampede.*

1. **Versioned keys.** Every cache entry includes the schema version in its key. Old keys are simply orphaned at migration time and evicted on TTL.
2. **Soft expiry.** Entries return cached values for up to two minutes after their TTL while a background refresh runs.

> [TIP] If your cache layer supports `stale-while-revalidate`, lean on it instead of building soft expiry by hand.

## What didn't

> [WARNING] Do not try to invalidate by pattern across a large keyspace. We attempted this with `KEYS schema:v1:*` and stalled the Redis instance for 40 seconds.

## Open questions

- Should the version be in the key or in a header? The current design uses the key; a header would let us version-roll without orphaning.
- Is two minutes the right soft-expiry window? It was picked from a hat.

[^1]: The actual cause was a race between the schema migration and the cache warmer, not a logical bug in the invalidation code.
```

Render it:

```bash
node ~/.claude/skills/report/render.mjs reports/cache-invalidation.md
```

The output lands at `reports/cache-invalidation-strategies-in-the-ingest-pipeline-2026-05-05.html`. Tell the user the path; they open it.

## Files in this skill

- `SKILL.md` — this file.
- `render.mjs` — Markdown → HTML renderer. Pure Node, zero dependencies. Usage: `node render.mjs <input.md> [output.html]`.
- `extract.mjs` — pull the embedded source Markdown out of a rendered HTML report (used when the `.md` has been lost). Usage: `node extract.mjs <input.html> [output.md] [--force]`.
- `template.html` — the document shell (head, scripts, layout). The renderer fills its placeholders.
- `example.html` — a fully-rendered demo report ("On the failure modes of LLM-generated frontend code") for visual reference. Open it in a browser to see every supported component in action.
