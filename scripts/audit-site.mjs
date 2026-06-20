import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const casesDir = path.join(root, 'src/content/cases');

const issues = [];

// 1. caseId mismatches in EvidenceList / DetectiveNotes
for (const f of fs.readdirSync(casesDir).filter((x) => x.endsWith('.mdx'))) {
  const t = fs.readFileSync(path.join(casesDir, f), 'utf8');
  const fmId = t.match(/^caseId: "(\d+)"/m)?.[1];
  if (!fmId) issues.push({ type: 'missing-caseId', file: f });

  for (const comp of ['EvidenceList', 'DetectiveNotes']) {
    const m = t.match(new RegExp(`<${comp} caseId="(\\d+)"`));
    if (m && m[1] !== fmId) {
      issues.push({ type: 'caseId-mismatch', file: f, component: comp, fmId, found: m[1] });
    }
  }

  const ast = (t.match(/\*\*/g) || []).length;
  if (ast > 0) issues.push({ type: 'asterisks', file: f, count: ast });
}

// 2. duplicate caseIds
const ids = new Map();
for (const f of fs.readdirSync(casesDir).filter((x) => x.endsWith('.mdx'))) {
  const t = fs.readFileSync(path.join(casesDir, f), 'utf8');
  const id = t.match(/^caseId: "(\d+)"/m)?.[1];
  if (!id) continue;
  if (!ids.has(id)) ids.set(id, []);
  ids.get(id).push(f);
}
for (const [id, files] of ids) {
  if (files.length > 1) issues.push({ type: 'duplicate-caseId', id, files });
}

// 3. caseId sequence gaps
const sorted = [...ids.keys()].map(Number).sort((a, b) => a - b);
for (let i = 1; i < sorted.length; i++) {
  if (sorted[i] !== sorted[i - 1] + 1) {
    issues.push({ type: 'caseId-gap', from: sorted[i - 1], to: sorted[i] });
  }
}

// 4. OG / share images
const ogDir = path.join(root, 'public/og/cases');
const shareDir = path.join(root, 'public/share/cases');
for (const f of fs.readdirSync(casesDir).filter((x) => x.endsWith('.mdx'))) {
  const slug = f.replace('.mdx', '');
  if (!fs.existsSync(path.join(ogDir, `${slug}.jpg`))) {
    issues.push({ type: 'missing-og', slug });
  }
  if (!fs.existsSync(path.join(shareDir, `${slug}.jpg`))) {
    issues.push({ type: 'missing-share', slug });
  }
}

console.log(JSON.stringify({ issueCount: issues.length, issues }, null, 2));