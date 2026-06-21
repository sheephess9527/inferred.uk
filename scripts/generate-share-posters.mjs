import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import QRCode from 'qrcode';

// 生成「分享海报」——竖版 1080×1440，含站点标识、案卷标题、摘要与二维码。
// 用途：朋友圈 / 小红书无法渲染链接卡片，改为长按保存这张图直接发布。
// 产物提交到 public/share/cases/{slug}.jpg（+ .png 备用）。

const ROOT = process.cwd();
const CASES_DIR = path.join(ROOT, 'src/content/cases');
const OUT_DIR = path.join(ROOT, 'public/share/cases');
const SITE = 'https://www.inferred.uk';

const W = 1080;
const H = 1440;

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
    if ([...line].length >= maxChars) {
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

function posterSvg({ eyebrow, title, summary }) {
  const safeEyebrow = escapeXml(eyebrow);
  const titleLines = wrapLines(title, 11, 2).map(escapeXml);
  const summaryLines = wrapLines(summary, 22, 4).map(escapeXml);

  const titleSvg = titleLines
    .map(
      (line, i) =>
        `<text x="88" y="${452 + i * 96}" font-family="Georgia, 'Songti SC', serif" font-size="80" font-weight="700" fill="#E8DFC8">${line}</text>`
    )
    .join('\n  ');

  const summaryStartY = 452 + titleLines.length * 96 + 56;
  const summarySvg = summaryLines
    .map(
      (line, i) =>
        `<text x="88" y="${summaryStartY + i * 52}" font-family="Georgia, 'Songti SC', serif" font-size="34" fill="#A89F8A">${line}</text>`
    )
    .join('\n  ');

  // 底部二维码占位面板（纸色），二维码由 sharp 合成贴上
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="#0E0E0C"/>
  <rect x="40" y="40" width="${W - 80}" height="${H - 80}" fill="none" stroke="#3A352B" stroke-width="2"/>

  <text x="88" y="150" font-family="'IBM Plex Mono', Consolas, monospace" font-size="30" letter-spacing="10" fill="#E8DFC8">INFERRED</text>
  <text x="88" y="196" font-family="Georgia, 'Songti SC', serif" font-size="28" fill="#A67C52">推理案卷 · 真相从不明说，只能被推断</text>
  <line x1="88" y1="232" x2="${W - 88}" y2="232" stroke="#3A352B" stroke-width="1"/>

  <text x="88" y="330" font-family="'IBM Plex Mono', Consolas, monospace" font-size="26" letter-spacing="6" fill="#A67C52">${safeEyebrow}</text>
  ${titleSvg}
  ${summarySvg}

  <rect x="88" y="1090" width="262" height="262" rx="14" fill="#E8DFC8"/>

  <text x="384" y="1168" font-family="Georgia, 'Songti SC', serif" font-size="38" fill="#E8DFC8">扫码阅读完整案卷</text>
  <text x="384" y="1226" font-family="'IBM Plex Mono', Consolas, monospace" font-size="28" letter-spacing="2" fill="#8B2E2E">www.inferred.uk</text>
  <text x="384" y="1286" font-family="Georgia, 'Songti SC', serif" font-size="26" fill="#6E675A">分析证词，找出矛盾，<tspan x="384" dy="38">在答案揭晓前推断真相。</tspan></text>
</svg>`;
}

async function generate() {
  if (!fs.existsSync(CASES_DIR)) {
    console.error('cases dir not found:', CASES_DIR);
    return 0;
  }
  await fs.promises.mkdir(OUT_DIR, { recursive: true });
  const files = fs.readdirSync(CASES_DIR).filter((f) => /\.(md|mdx)$/.test(f));
  let count = 0;

  for (const file of files) {
    const slug = file.replace(/\.(md|mdx)$/, '');
    const meta = parseFrontmatter(path.join(CASES_DIR, file));
    if (!meta?.title) continue;

    const url = `${SITE}/cases/${slug}`;
    const eyebrow = `CASE FILE #${meta.caseId || '???'}`;
    const svg = posterSvg({
      eyebrow,
      title: meta.title,
      summary: meta.summary || meta.title,
    });

    // 二维码：深模块用近黑，浅底用纸色，贴在浅色面板上方居中（面板 262，内边距 16）
    const qr = await QRCode.toBuffer(url, {
      type: 'png',
      errorCorrectionLevel: 'M',
      margin: 0,
      width: 230,
      color: { dark: '#0E0E0CFF', light: '#E8DFC8FF' },
    });

    const base = path.join(OUT_DIR, slug);
    await sharp(Buffer.from(svg), { density: 144 })
      .resize(W, H)
      .composite([{ input: qr, top: 1090 + 16, left: 88 + 16 }])
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(`${base}.jpg`);
    count++;
  }
  return count;
}

const count = await generate();
console.log(`Wrote ${count} case share posters (.jpg) to public/share/cases/`);
