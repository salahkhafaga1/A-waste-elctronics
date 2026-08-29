const fs = require('fs');
const path = require('path');

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== '.next') walk(full);
    } else if (entry.name.endsWith('.js') || entry.name.endsWith('.cjs')) {
      const mjs = full.replace(/\.(c)?js$/, '.mjs');
      if (!fs.existsSync(mjs)) {
        try {
          fs.copyFileSync(full, mjs);
        } catch (e) {}
      }
    }
  }
}

console.log('Syncing mjs files across node_modules/@supabase and node_modules/@clerk...');
walk(path.resolve('node_modules/@supabase'));
walk(path.resolve('node_modules/@clerk'));
console.log('Done syncing mjs files.');
