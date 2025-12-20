/**
 * Fix stone-500 to rose-500 for brand consistency
 *
 * The earlier script accidentally replaced some rose-500 with stone-500
 * This fixes that to use #f43f5e (rose-500) as our Coral Heart color
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];
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

function fixStoneToRose(content) {
  return content
    // Fix bg-stone-500 to bg-rose-500
    .replace(/bg-stone-500/g, 'bg-rose-500')
    // Fix text-stone-500 to text-rose-500
    .replace(/text-stone-500/g, 'text-rose-500')
    // Fix border-stone-500 to border-rose-500
    .replace(/border-stone-500/g, 'border-rose-500')
    // Fix ring-stone-500 to ring-rose-500
    .replace(/ring-stone-500/g, 'ring-rose-500')
    // Fix from-stone-500 to from-rose-500
    .replace(/from-stone-500/g, 'from-rose-500')
    // Fix to-stone-500 to to-rose-500
    .replace(/to-stone-500/g, 'to-rose-500')
    // Keep hover states correct
    .replace(/hover:bg-stone-500/g, 'hover:bg-rose-500')
    // Fix disabled states
    .replace(/disabled:hover:bg-stone-500/g, 'disabled:hover:bg-rose-500');
}

let filesChanged = 0;

for (const dir of DIRS) {
  const dirPath = path.join(ROOT_DIR, dir);
  if (!fs.existsSync(dirPath)) continue;

  const files = getAllFiles(dirPath);

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const newContent = fixStoneToRose(content);

    if (content !== newContent) {
      fs.writeFileSync(file, newContent);
      console.log(`Fixed: ${path.relative(ROOT_DIR, file)}`);
      filesChanged++;
    }
  }
}

console.log(`\nDone! Fixed ${filesChanged} files.`);
console.log('All stone-500 replaced with rose-500 (#f43f5e) for Coral Heart branding.');
