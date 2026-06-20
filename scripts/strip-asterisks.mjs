import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const casesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/content/cases');
let n = 0;

for (const f of fs.readdirSync(casesDir).filter((x) => x.endsWith('.mdx'))) {
  const fp = path.join(casesDir, f);
  const before = fs.readFileSync(fp, 'utf8');
  const after = before.replace(/\*\*/g, '');
  if (after !== before) {
    fs.writeFileSync(fp, after);
    n++;
    console.log(f);
  }
}
console.log(`Stripped ** from ${n} files.`);