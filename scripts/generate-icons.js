/**
 * Generate PWA icons from Logo
 * Run: node scripts/generate-icons.js
 *
 * Uses the actual "Liefde Voor Iedereen" logo for all PWA icons
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.join(__dirname, '../public/icons');
const LOGO_PATH = path.join(__dirname, '../public/images/LiefdevoorIedereen_logo.png');

// Icon sizes needed for PWA
const SIZES = [32, 72, 96, 128, 144, 152, 192, 384, 512];

// Logo color from brand palette
const BRAND_COLOR = '#C34C60';

async function generateIcons() {
  console.log('Generating PWA icons from Liefde Voor Iedereen logo...\n');

  // Ensure icons directory exists
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  // Check if logo exists
  if (!fs.existsSync(LOGO_PATH)) {
    console.error('Logo not found at:', LOGO_PATH);
    process.exit(1);
  }

  // Get logo metadata
  const metadata = await sharp(LOGO_PATH).metadata();
  console.log(`Source logo: ${metadata.width}x${metadata.height}`);

  // Generate PNG icons for each size
  // The logo is horizontal, so we'll create a square icon with the logo centered
  for (const size of SIZES) {
    const outputPath = path.join(ICONS_DIR, `icon-${size}x${size}.png`);

    // Create a square canvas with brand color background
    // Resize logo to fit within the square with padding
    const logoSize = Math.floor(size * 0.75); // Logo takes 75% of the icon

    await sharp(LOGO_PATH)
      .resize(logoSize, logoSize, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .extend({
        top: Math.floor((size - logoSize) / 2),
        bottom: Math.ceil((size - logoSize) / 2),
        left: Math.floor((size - logoSize) / 2),
        right: Math.ceil((size - logoSize) / 2),
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .png()
      .toFile(outputPath);

    console.log(`  Created icon-${size}x${size}.png`);
  }

  // Generate Apple touch icon (180x180)
  const appleSize = 180;
  const appleLogoSize = Math.floor(appleSize * 0.75);
  await sharp(LOGO_PATH)
    .resize(appleLogoSize, appleLogoSize, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .extend({
      top: Math.floor((appleSize - appleLogoSize) / 2),
      bottom: Math.ceil((appleSize - appleLogoSize) / 2),
      left: Math.floor((appleSize - appleLogoSize) / 2),
      right: Math.ceil((appleSize - appleLogoSize) / 2),
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png()
    .toFile(path.join(ICONS_DIR, 'apple-touch-icon.png'));
  console.log('  Created apple-touch-icon.png (180x180)');

  // Generate favicon (32x32)
  await sharp(LOGO_PATH)
    .resize(24, 24, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .extend({
      top: 4,
      bottom: 4,
      left: 4,
      right: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png()
    .toFile(path.join(__dirname, '../public/favicon.png'));
  console.log('  Created favicon.png (32x32)');

  // Generate shortcut icons with rose/brand colors
  const SHORTCUT_ICONS = [
    { name: 'discover', color: BRAND_COLOR, icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
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
    console.log(`  Created ${shortcut.name}-96x96.png`);
  }

  console.log('\nAll icons generated successfully!');
  console.log('Icons use the Liefde Voor Iedereen logo with white background.');
}

generateIcons().catch(console.error);
