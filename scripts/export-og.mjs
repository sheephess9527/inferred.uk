import fs from 'node:fs';
import sharp from 'sharp';

const svg = fs.readFileSync('public/og-default.svg');
const pipeline = sharp(svg, { density: 144 }).resize(1200, 630);

await pipeline.clone().jpeg({ quality: 86, mozjpeg: true }).toFile('public/og-default.jpg');

console.log('Wrote public/og-default.jpg (1200×630)');