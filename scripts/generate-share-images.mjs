import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const CASES_DIR = path.join(ROOT, 'src/content/cases');
const CLUES_DIR = path.join(ROOT, 'src/content/clues');
const OG_CASES = path.join(ROOT, 'public/og/cases');
const OG_CLUES = path.join(ROOT, 'public/og/clues');

function parseFrontmatter(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;

  const yaml = match[1];
  const pick = (key) => {
    const m = yaml.match(new RegExp(`^${key}:\\s*["']([^"']*)["']`, 'm'));
    return m?.[1] ?? '';
  };

  return {
    title: pick('title'),
    summary: pick('summary'),
    caseId: pick('caseId'),
  };
}

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function truncate(value, max) {
  const chars = [...value];
  if (chars.length <= max) return value;
  return chars.slice(0, max - 1).join('') + '…';
}

function wrapLines(value, maxChars, maxLines) {
  const chars = [...value];
  const lines = [];
  let line = '';

  for (const ch of chars) {
    if (line.length >= maxChars) {
      lines.push(line);
      line = '';
      if (lines.length >= maxLines) break;
    }
    line += ch;
  }

  if (line && lines.length < maxLines) lines.push(line);
  if (chars.length > maxChars * maxLines) {
    const last = lines[maxLines - 1];
    lines[maxLines - 1] = truncate(last, maxChars);
  }
  return lines;
}

function shareCardSvg({ eyebrow, title, summary, accent = '#8B2E2E' }) {
  const safeEyebrow = escapeXml(eyebrow);
  const safeTitle = escapeXml(truncate(title, 32));
  const summaryLines = wrapLines(summary, 34, 3).map(escapeXml);

  const summarySvg = summaryLines
    .map(
      (line, i) =>
        `<text x="80" y="${360 + i * 52}" font-family="Georgia, 'Songti SC', serif" font-size="34" fill="#A89F8A">${line}</text>`
    )
    .join('\n  ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <rect width="1200" height="630" fill="#0E0E0C"/>
  <rect x="40" y="40" width="1120" height="550" fill="none" stroke="#3A352B" stroke-width="2"/>
  <text x="80" y="110" font-family="'IBM Plex Mono', Consolas, monospace" font-size="24" letter-spacing="6" fill="#A67C52">${safeEyebrow}</text>
  <text x="80" y="250" font-family="Georgia, 'Songti SC', serif" font-size="64" font-weight="700" fill="#E8DFC8">${safeTitle}</text>
  ${summarySvg}
  <text x="80" y="560" font-family="'IBM Plex Mono', Consolas, monospace" font-size="22" letter-spacing="2" fill="${accent}">inferred.uk · 真相从不明说，只能被推断</text>
</svg>`;
}

/** 微信链接预览对 JPEG 兼容性更好；同时保留 PNG 备用 */
async function writeShareImages(svg, basePath) {
  await fs.promises.mkdir(path.dirname(basePath), { recursive: true });
  const pipeline = sharp(Buffer.from(svg), { density: 144 }).resize(1200, 630);
  await pipeline
    .clone()
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(`${basePath}.jpg`);
  await pipeline
    .clone()
    .png({ compressionLevel: 9 })
    .toFile(`${basePath}.png`);
}

async function generateFromDir(dir, outDir, kind) {
  if (!fs.existsSync(dir)) return 0;
  const files = fs.readdirSync(dir).filter((f) => /\.(md|mdx)$/.test(f));
  let count = 0;

  for (const file of files) {
    const slug = file.replace(/\.(md|mdx)$/, '');
    const meta = parseFrontmatter(path.join(dir, file));
    if (!meta?.title) continue;

    const eyebrow =
      kind === 'case'
        ? `CASE FILE #${meta.caseId || '???'} · INFERRED`
        : 'CLUES · 推理技巧';

    const svg = shareCardSvg({
      eyebrow,
      title: meta.title,
      summary: meta.summary || meta.title,
      accent: kind === 'case' ? '#8B2E2E' : '#3F5F73',
    });

    await writeShareImages(svg, path.join(outDir, slug));
    count++;
  }

  return count;
}

const caseCount = await generateFromDir(CASES_DIR, OG_CASES, 'case');
const clueCount = await generateFromDir(CLUES_DIR, OG_CLUES, 'clue');
console.log(`Wrote ${caseCount} case + ${clueCount} clue share images (.jpg + .png) to public/og/`);