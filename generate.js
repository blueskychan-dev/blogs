#!/usr/bin/env node
// Regenerates blogs.json by scanning posts/*.md and parsing YAML frontmatter.
// Zero dependencies — runs on plain Node (>=14).

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const POSTS_DIR = path.join(ROOT, "posts");
const OUT_FILE = path.join(ROOT, "blogs.json");

// Minimal YAML frontmatter parser. Supports scalar key: value pairs and
// simple block lists (`tags:` followed by `  - item` lines). Quotes are
// stripped. This is intentionally small — not a full YAML implementation.
function parseFrontmatter(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw);
  if (!match) return { data: {}, body: raw };

  const data = {};
  const lines = match[1].split(/\r?\n/);
  let currentListKey = null;

  for (const line of lines) {
    if (line.trim() === "") continue;

    const listItem = /^\s*-\s+(.*)$/.exec(line);
    if (listItem && currentListKey) {
      data[currentListKey].push(stripQuotes(listItem[1].trim()));
      continue;
    }

    const kv = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (kv) {
      const key = kv[1];
      const value = kv[2].trim();
      if (value === "") {
        // Likely a block list follows.
        data[key] = [];
        currentListKey = key;
      } else {
        data[key] = stripQuotes(value);
        currentListKey = null;
      }
    }
  }

  const body = raw.slice(match[0].length);
  return { data, body };
}

function stripQuotes(s) {
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    return s.slice(1, -1);
  }
  return s;
}

function main() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.error(`posts/ directory not found at ${POSTS_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.toLowerCase().endsWith(".md"))
    .sort();

  const blogs = files.map((file) => {
    const fullPath = path.join(POSTS_DIR, file);
    const raw = fs.readFileSync(fullPath, "utf8");
    const { data } = parseFrontmatter(raw);
    return {
      slug: file.replace(/\.md$/i, ""),
      path: path.posix.join("posts", file),
      ...data,
    };
  });

  // Sort newest-first when a parseable MM-DD-YYYY date exists.
  blogs.sort((a, b) => parseDate(b.date) - parseDate(a.date));

  const output = {
    generatedAt: new Date().toISOString(),
    count: blogs.length,
    blogs,
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2) + "\n");
  console.log(`Wrote ${blogs.length} entries to ${path.relative(ROOT, OUT_FILE)}`);
}

function parseDate(d) {
  if (!d) return 0;
  // Expected format MM-DD-YYYY (matches existing posts).
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(d);
  if (m) return new Date(`${m[3]}-${m[1]}-${m[2]}`).getTime() || 0;
  const t = new Date(d).getTime();
  return isNaN(t) ? 0 : t;
}

main();
