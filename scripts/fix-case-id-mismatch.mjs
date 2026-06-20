import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const casesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/content/cases');
let fixed = 0;

for (const f of fs.readdirSync(casesDir).filter((x) => x.endsWith('.mdx'))) {
  const fp = path.join(casesDir, f);
  let t = fs.readFileSync(fp, 'utf8');
  const fmId = t.match(/^caseId: "(\d+)"/m)?.[1];
  if (!fmId) continue;

  const before = t;
  t = t.replace(/<EvidenceList caseId="\d+"/g, `<EvidenceList caseId="${fmId}"`);
  t = t.replace(/<DetectiveNotes caseId="\d+"/g, `<DetectiveNotes caseId="${fmId}"`);

  if (t !== before) {
    fs.writeFileSync(fp, t);
    fixed++;
    console.log(`fixed ${f} -> ${fmId}`);
  }
}

console.log(`Done. ${fixed} files updated.`);