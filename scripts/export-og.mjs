import fs from 'node:fs';
import sharp from 'sharp';

const svg = fs.readFileSync('public/og-default.svg');
const pipeline = sharp(svg, { density: 144 }).resize(1200, 630);

await pipeline.clone().jpeg({ quality: 86, mozjpeg: true }).toFile('public/og-default.jpg');
await pipeline.clone().png({ compressionLevel: 9 }).toFile('public/og-default.png');

console.log('Wrote public/og-default.jpg + public/og-default.png (1200×630)');