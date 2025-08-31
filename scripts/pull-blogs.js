/* Copies Markdown blogs from your local Obsidian vault into dist/blogs,
   excluding any files with "WIP" in the filename, and generates dist/blogs/index.json.
*/
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const SOURCE_DIR = "C:\\Users\\alanm\\Documents\\box\\blogs"; // Set this to your Obsidian vault's blogs folder
const DEST_DIR = path.join(process.cwd(), 'dist', 'blogs');

function isMarkdown(file) {
  return path.extname(file).toLowerCase() === '.md';
}

function hasWipInName(name) {
  return /wip/i.test(name);
}

function toPosix(p) {
  return p.split(path.sep).join('/');
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
      await copyFile(abs, destAbs);

      const base = path.parse(entry.name).name; // filename without extension
      const urlPath = toPosix(path.join('blogs', rel)); // e.g., blogs/subdir/file.md
      index.push({
        title: base,
        path: urlPath
      });
    }
  }
}

async function main() {
  try {
    if (!fs.existsSync(SOURCE_DIR)) {
      console.warn(`[pull-blogs] SOURCE_DIR not found: ${SOURCE_DIR}. Skipping blog copy.`);
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
