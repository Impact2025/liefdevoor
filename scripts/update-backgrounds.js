/**
 * Update background gradients to stone-50
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

function replaceBackgrounds(content) {
  // Replace various gradient backgrounds with stone-50
  return content
    // Main gradient patterns
    .replace(/bg-gradient-to-br from-primary-50 via-white to-rose-50/g, 'bg-stone-50')
    .replace(/bg-gradient-to-br from-rose-50 via-white to-rose-50/g, 'bg-stone-50')
    .replace(/bg-gradient-to-br from-rose-50 via-white to-pink-50/g, 'bg-stone-50')
    .replace(/bg-gradient-to-br from-primary-50 via-white to-pink-50/g, 'bg-stone-50')
    // Simpler gradients
    .replace(/bg-gradient-to-b from-rose-50 to-white/g, 'bg-stone-50')
    .replace(/bg-gradient-to-b from-primary-50 to-white/g, 'bg-stone-50')
    // Single color backgrounds that should be stone-50
    .replace(/bg-rose-50(?!\/)/g, 'bg-stone-50')
    .replace(/bg-primary-50(?!\/)/g, 'bg-stone-50');
}

let filesChanged = 0;

for (const dir of DIRS) {
  const dirPath = path.join(ROOT_DIR, dir);
  if (!fs.existsSync(dirPath)) continue;

  const files = getAllFiles(dirPath);

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const newContent = replaceBackgrounds(content);

    if (content !== newContent) {
      fs.writeFileSync(file, newContent);
      console.log(`Updated: ${path.relative(ROOT_DIR, file)}`);
      filesChanged++;
    }
  }
}

console.log(`\nDone! Updated ${filesChanged} files.`);
