/**
 * Replace pink-* with rose-* across all source files
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.css'];
const DIRS = ['app', 'components'];

function getAllFiles(dir, files = []) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      getAllFiles(fullPath, files);
    } else if (stat.isFile() && EXTENSIONS.some(ext => item.endsWith(ext))) {
      files.push(fullPath);
    }
  }

  return files;
}

function replaceColors(content) {
  return content
    .replace(/pink-50/g, 'rose-50')
    .replace(/pink-100/g, 'rose-100')
    .replace(/pink-200/g, 'rose-200')
    .replace(/pink-300/g, 'rose-300')
    .replace(/pink-400/g, 'rose-400')
    .replace(/pink-500/g, 'rose-500')
    .replace(/pink-600/g, 'rose-600')
    .replace(/pink-700/g, 'rose-700')
    .replace(/pink-800/g, 'rose-800')
    .replace(/pink-900/g, 'rose-900');
}

let filesChanged = 0;

for (const dir of DIRS) {
  const dirPath = path.join(ROOT_DIR, dir);
  if (!fs.existsSync(dirPath)) continue;

  const files = getAllFiles(dirPath);

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const newContent = replaceColors(content);

    if (content !== newContent) {
      fs.writeFileSync(file, newContent);
      console.log(`Updated: ${path.relative(ROOT_DIR, file)}`);
      filesChanged++;
    }
  }
}

console.log(`\nDone! Updated ${filesChanged} files.`);
