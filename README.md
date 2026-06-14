# blogs

Standalone repository for blog posts written in Markdown.

## Layout

- `posts/*.md` — blog posts with YAML frontmatter (`title`, `desc`, `date`, `tags`).
- `blogs.json` — generated index pointing at each `.md` file plus its frontmatter.
- `generate.js` — zero-dependency Node script that builds `blogs.json`.

## Frontmatter format

```md
---
title: "My post"
desc: A short description.
date: "06-14-2026"
tags:
  - example
---
```

`date` is `MM-DD-YYYY`. Posts are sorted newest-first in the index.

## Regenerating the index

```bash
node generate.js
```

A GitHub Action (`.github/workflows/generate-json.yml`) reruns this on every
push that touches `posts/`, `generate.js`, or the workflow, and commits the
updated `blogs.json` back to the repo.
