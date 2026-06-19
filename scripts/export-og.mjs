import fs from 'node:fs';
import sharp from 'sharp';

const svg = fs.readFileSync('public/og-default.svg');

await sharp(svg, { density: 144 })
  .resize(1200, 630)
  .png()
  .toFile('public/og-default.png');

console.log('Wrote public/og-default.png (1200×630)');