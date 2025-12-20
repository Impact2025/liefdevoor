/**
 * Replace all primary-* colors with rose-* for brand consistency
 *
 * This ensures we use rose-500 (#f43f5e) as our Coral Heart color
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

function replacePrimaryWithRose(content) {
  return content
    // Text colors
    .replace(/text-primary-50/g, 'text-rose-50')
    .replace(/text-primary-100/g, 'text-rose-100')
    .replace(/text-primary-200/g, 'text-rose-200')
    .replace(/text-primary-300/g, 'text-rose-300')
    .replace(/text-primary-400/g, 'text-rose-400')
    .replace(/text-primary-500/g, 'text-rose-500')
    .replace(/text-primary-600/g, 'text-rose-600')
    .replace(/text-primary-700/g, 'text-rose-700')
    .replace(/text-primary-800/g, 'text-rose-800')
    .replace(/text-primary-900/g, 'text-rose-900')
    // Background colors
    .replace(/bg-primary-50/g, 'bg-rose-50')
    .replace(/bg-primary-100/g, 'bg-rose-100')
    .replace(/bg-primary-200/g, 'bg-rose-200')
    .replace(/bg-primary-300/g, 'bg-rose-300')
    .replace(/bg-primary-400/g, 'bg-rose-400')
    .replace(/bg-primary-500/g, 'bg-rose-500')
    .replace(/bg-primary-600/g, 'bg-rose-600')
    .replace(/bg-primary-700/g, 'bg-rose-700')
    .replace(/bg-primary-800/g, 'bg-rose-800')
    .replace(/bg-primary-900/g, 'bg-rose-900')
    // Border colors
    .replace(/border-primary-50/g, 'border-rose-50')
    .replace(/border-primary-100/g, 'border-rose-100')
    .replace(/border-primary-200/g, 'border-rose-200')
    .replace(/border-primary-300/g, 'border-rose-300')
    .replace(/border-primary-400/g, 'border-rose-400')
    .replace(/border-primary-500/g, 'border-rose-500')
    .replace(/border-primary-600/g, 'border-rose-600')
    .replace(/border-primary-700/g, 'border-rose-700')
    .replace(/border-primary-800/g, 'border-rose-800')
    .replace(/border-primary-900/g, 'border-rose-900')
    // Ring colors
    .replace(/ring-primary-50/g, 'ring-rose-50')
    .replace(/ring-primary-100/g, 'ring-rose-100')
    .replace(/ring-primary-200/g, 'ring-rose-200')
    .replace(/ring-primary-300/g, 'ring-rose-300')
    .replace(/ring-primary-400/g, 'ring-rose-400')
    .replace(/ring-primary-500/g, 'ring-rose-500')
    .replace(/ring-primary-600/g, 'ring-rose-600')
    .replace(/ring-primary-700/g, 'ring-rose-700')
    .replace(/ring-primary-800/g, 'ring-rose-800')
    .replace(/ring-primary-900/g, 'ring-rose-900')
    // From/To gradient colors
    .replace(/from-primary-50/g, 'from-rose-50')
    .replace(/from-primary-100/g, 'from-rose-100')
    .replace(/from-primary-200/g, 'from-rose-200')
    .replace(/from-primary-300/g, 'from-rose-300')
    .replace(/from-primary-400/g, 'from-rose-400')
    .replace(/from-primary-500/g, 'from-rose-500')
    .replace(/from-primary-600/g, 'from-rose-600')
    .replace(/from-primary-700/g, 'from-rose-700')
    .replace(/from-primary-800/g, 'from-rose-800')
    .replace(/from-primary-900/g, 'from-rose-900')
    .replace(/to-primary-50/g, 'to-rose-50')
    .replace(/to-primary-100/g, 'to-rose-100')
    .replace(/to-primary-200/g, 'to-rose-200')
    .replace(/to-primary-300/g, 'to-rose-300')
    .replace(/to-primary-400/g, 'to-rose-400')
    .replace(/to-primary-500/g, 'to-rose-500')
    .replace(/to-primary-600/g, 'to-rose-600')
    .replace(/to-primary-700/g, 'to-rose-700')
    .replace(/to-primary-800/g, 'to-rose-800')
    .replace(/to-primary-900/g, 'to-rose-900')
    // Hover states
    .replace(/hover:bg-primary-/g, 'hover:bg-rose-')
    .replace(/hover:text-primary-/g, 'hover:text-rose-')
    .replace(/hover:border-primary-/g, 'hover:border-rose-')
    // Focus states
    .replace(/focus:ring-primary-/g, 'focus:ring-rose-')
    .replace(/focus:border-primary-/g, 'focus:border-rose-')
    // Placeholder
    .replace(/placeholder-primary-/g, 'placeholder-rose-')
    // Divide
    .replace(/divide-primary-/g, 'divide-rose-');
}

let filesChanged = 0;

for (const dir of DIRS) {
  const dirPath = path.join(ROOT_DIR, dir);
  if (!fs.existsSync(dirPath)) continue;

  const files = getAllFiles(dirPath);

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const newContent = replacePrimaryWithRose(content);

    if (content !== newContent) {
      fs.writeFileSync(file, newContent);
      console.log(`Updated: ${path.relative(ROOT_DIR, file)}`);
      filesChanged++;
    }
  }
}

console.log(`\nDone! Updated ${filesChanged} files.`);
console.log('All primary-* colors replaced with rose-* for consistent branding.');
