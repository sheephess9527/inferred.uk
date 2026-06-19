import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CASES_DIR = path.join(ROOT, 'src/content/cases');
const CLUES_DIR = path.join(ROOT, 'src/content/clues');
const OG_CASES = path.join(ROOT, 'public/og/cases');
const OG_CLUES = path.join(ROOT, 'public/og/clues');

function slugs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
    .map((f) => f.replace(/\.(mdx|md)$/, ''));
}

function check(group, slugsList, ogDir) {
  const missing = [];
  for (const slug of slugsList) {
    const jpg = path.join(ogDir, `${slug}.jpg`);
    if (!fs.existsSync(jpg)) missing.push(`${group}/${slug}.jpg`);
  }
  return missing;
}

const caseSlugs = slugs(CASES_DIR);
const clueSlugs = slugs(CLUES_DIR);
const missing = [
  ...check('cases', caseSlugs, OG_CASES),
  ...check('clues', clueSlugs, OG_CLUES),
];

if (missing.length) {
  console.error('Missing OG share images:\n  ' + missing.join('\n  '));
  console.error('\nRun: pnpm og:export');
  process.exit(1);
}

console.log(
  `OG images OK (${caseSlugs.length} cases, ${clueSlugs.length} clues)`
);