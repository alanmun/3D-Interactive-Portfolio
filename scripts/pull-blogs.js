/* Copies Markdown blogs from your local Obsidian vault into static/assets/blogs,
   excluding any files with "WIP" in the filename, and generates static/assets/blogs/index.json.
*/
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
require('dotenv').config();

function toWSLPathMaybe(p) {
  // Convert a Windows path like "C:\..." to "/mnt/c/..." when running under Linux/WSL
  if (!p) return p;
  const isLinux = process.platform === 'linux';
  const winDrive = /^[A-Za-z]:\\/;
  if (isLinux && winDrive.test(p)) {
    const drive = p[0].toLowerCase();
    const rest = p.slice(2).replace(/\\/g, '/');
    return `/mnt/${drive}${rest.startsWith('/') ? '' : '/'}${rest}`;
  }
  return p;
}

const RAW_SOURCE_DIR = process.env.PATH_TO_OBSIDIAN_BLOGS_FOLDER || '';
const SOURCE_DIR = toWSLPathMaybe(RAW_SOURCE_DIR);
const DEST_DIR = path.join(process.cwd(), 'static', 'assets', 'blogs');

function isMarkdown(file) {
  return path.extname(file).toLowerCase() === '.md';
}

function hasWipInName(name) {
  return /wip/i.test(name);
}

function toPosix(p) {
  return p.split(path.sep).join('/');
}

// Remove a leading Obsidian/YAML front matter block if present
function stripFrontMatter(content) {
  if (!content) return content;
  const re = /^---\s*\r?\n[\s\S]*?\r?\n---\s*\r?\n?/;
  return content.replace(re, '');
}

// Extract created date from front matter or fall back to file mtime
async function getDateForFile(absPath) {
  try {
    const content = await fsp.readFile(absPath, 'utf8');
    const fmMatch = content.match(/^---\s*[\s\S]*?---/);
    if (fmMatch) {
      const createdMatch = fmMatch[0].match(/^\s*created\s*:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/m);
      if (createdMatch) return createdMatch[1];
    }
  } catch (e) { /* ignore */ }
  try {
    const st = await fsp.stat(absPath);
    const dt = new Date(st.mtime);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  } catch (e) {
    return '1970-01-01';
  }
}

async function ensureDir(dir) {
  await fsp.mkdir(dir, { recursive: true });
}

async function copyFile(src, dest) {
  await ensureDir(path.dirname(dest));
  await fsp.copyFile(src, dest);
}

async function walkAndCopy(srcDir, relBase, index) {
  const entries = await fsp.readdir(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const abs = path.join(srcDir, entry.name);
    const rel = relBase ? path.join(relBase, entry.name) : entry.name;

    if (entry.isDirectory()) {
      await walkAndCopy(abs, rel, index);
    } else if (entry.isFile()) {
      if (!isMarkdown(entry.name)) continue;
      if (hasWipInName(entry.name)) continue;

      const destAbs = path.join(DEST_DIR, rel);
      await ensureDir(path.dirname(destAbs));
      const raw = await fsp.readFile(abs, 'utf8');
      const stripped = stripFrontMatter(raw);
      await fsp.writeFile(destAbs, stripped, 'utf8');

      const base = path.parse(entry.name).name; // filename without extension
      const urlPath = toPosix(path.join('static', 'assets', 'blogs', rel)); // e.g., static/assets/blogs/subdir/file.md
      const date = await getDateForFile(abs);
      index.push({
        title: base,
        path: urlPath,
        date
      });
    }
  }
}

async function main() {
  try {
    if (!SOURCE_DIR) {
      console.warn('[pull-blogs] PATH_TO_OBSIDIAN_BLOGS_FOLDER is not set. Skipping blog copy.');
      return;
    }
    if (!fs.existsSync(SOURCE_DIR)) {
      console.warn(
        `[pull-blogs] SOURCE_DIR not found: ${SOURCE_DIR}` +
        (RAW_SOURCE_DIR && RAW_SOURCE_DIR !== SOURCE_DIR ? ` (from ${RAW_SOURCE_DIR})` : '') +
        `. Skipping blog copy.`
      );
      return;
    }

    await ensureDir(DEST_DIR);
    const index = [];
    await walkAndCopy(SOURCE_DIR, '', index);

    // Sort by title ascending for deterministic order
    index.sort((a, b) => a.title.localeCompare(b.title));

    const idxPath = path.join(DEST_DIR, 'index.json');
    await fsp.writeFile(idxPath, JSON.stringify(index, null, 2), 'utf8');

    console.log(`[pull-blogs] Copied ${index.length} blog(s) into ${DEST_DIR} and wrote index.json`);
  } catch (err) {
    console.error('[pull-blogs] Failed:', err);
    process.exitCode = 1;
  }
}

main();
