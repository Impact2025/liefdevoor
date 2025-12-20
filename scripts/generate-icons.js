/**
 * Generate PWA icons from SVG source
 * Run: node scripts/generate-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.join(__dirname, '../public/icons');
const SVG_PATH = path.join(ICONS_DIR, 'icon.svg');

// Icon sizes needed for PWA
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Heart icon SVG with pink background
const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="102" fill="#ec4899"/>
  <path d="M256 392c-5.3 0-10.4-2.1-14.1-5.9l-95.1-95.1C119.9 264.1 104 230.3 104 194c0-66.3 53.7-120 120-120 29.4 0 57.7 11.7 78.5 32.5l-46.5 46.5-46.5-46.5C230.3 85.7 258.6 74 288 74c66.3 0 120 53.7 120 120 0 36.3-15.9 70.1-42.8 96.9l-95.1 95.1c-3.7 3.8-8.8 5.9-14.1 6z" fill="white"/>
</svg>`;

async function generateIcons() {
  // Ensure icons directory exists
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  // Save the SVG
  fs.writeFileSync(SVG_PATH, ICON_SVG);
  console.log('Created icon.svg');

  // Generate PNG icons for each size
  for (const size of SIZES) {
    const outputPath = path.join(ICONS_DIR, `icon-${size}x${size}.png`);

    await sharp(Buffer.from(ICON_SVG))
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`Created icon-${size}x${size}.png`);
  }

  // Generate Apple touch icon (180x180)
  await sharp(Buffer.from(ICON_SVG))
    .resize(180, 180)
    .png()
    .toFile(path.join(ICONS_DIR, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  // Generate favicon (32x32)
  await sharp(Buffer.from(ICON_SVG))
    .resize(32, 32)
    .png()
    .toFile(path.join(__dirname, '../public/favicon.png'));
  console.log('Created favicon.png');

  // Generate shortcut icons
  const SHORTCUT_ICONS = [
    { name: 'discover', color: '#ec4899', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
    { name: 'chat', color: '#8b5cf6', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' }
  ];

  for (const shortcut of SHORTCUT_ICONS) {
    const shortcutSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
      <rect width="96" height="96" rx="19" fill="${shortcut.color}"/>
      <g transform="translate(24, 24)" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <path d="${shortcut.icon}"/>
      </g>
    </svg>`;

    await sharp(Buffer.from(shortcutSvg))
      .resize(96, 96)
      .png()
      .toFile(path.join(ICONS_DIR, `${shortcut.name}-96x96.png`));
    console.log(`Created ${shortcut.name}-96x96.png`);
  }

  console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
