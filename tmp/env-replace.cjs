const fs = require('fs');
const path = require('path');
const files = fs.readFileSync('/tmp/_env_files.txt','utf8').trim().split('\n').filter(Boolean);
for (const f of files) {
  const filePath = path.resolve(f);
  let s = fs.readFileSync(filePath, 'utf8');
  const ns = s.replace(/process\.env\.([A-Z0-9_]+)/g, (m, p1) => `getEnvOptional('${p1}')`);
  if (ns !== s) {
    fs.writeFileSync(filePath, ns, 'utf8');
    console.log('Patched', f);
  } else {
    console.log('No change', f);
  }
}
