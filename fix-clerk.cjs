const fs = require('fs');
const path = require('path');

const clerkBackendDir = path.resolve('node_modules/@clerk/backend');

if (fs.existsSync(clerkBackendDir)) {
  const browserDir = path.join(clerkBackendDir, 'dist/runtime/browser');
  const nodeDir = path.join(clerkBackendDir, 'dist/runtime/node');
  fs.mkdirSync(browserDir, { recursive: true });
  fs.mkdirSync(nodeDir, { recursive: true });

  fs.writeFileSync(
    path.join(browserDir, 'crypto.js'),
    'module.exports.webcrypto = (typeof globalThis !== "undefined" && globalThis.crypto) || undefined;\n'
  );
  fs.writeFileSync(
    path.join(browserDir, 'crypto.mjs'),
    'export const webcrypto = (typeof globalThis !== "undefined" && globalThis.crypto) || undefined;\nexport default { webcrypto };\n'
  );

  fs.writeFileSync(
    path.join(nodeDir, 'crypto.js'),
    'module.exports.webcrypto = (typeof globalThis !== "undefined" && globalThis.crypto) || (typeof require !== "undefined" ? require("crypto").webcrypto : undefined);\n'
  );
  fs.writeFileSync(
    path.join(nodeDir, 'crypto.mjs'),
    'import nodeCrypto from "crypto";\nexport const webcrypto = (typeof globalThis !== "undefined" && globalThis.crypto) || nodeCrypto.webcrypto;\nexport default { webcrypto };\n'
  );

  function patchDir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        patchDir(full);
      } else if (entry.name.endsWith('.js') || entry.name.endsWith('.mjs') || entry.name.endsWith('.cjs')) {
        let content = fs.readFileSync(full, 'utf8');
        if (content.includes('#crypto')) {
          const relToNodeCrypto = path.relative(path.dirname(full), path.join(nodeDir, 'crypto.js')).replace(/\\/g, '/');
          const relPath = relToNodeCrypto.startsWith('.') ? relToNodeCrypto : './' + relToNodeCrypto;
          content = content
            .replace(/require\(["']#crypto["']\)/g, `require("${relPath}")`)
            .replace(/from\s+["']#crypto["']/g, `from "${relPath}"`)
            .replace(/import\(["']#crypto["']\)/g, `import("${relPath}")`);
          fs.writeFileSync(full, content);
        }
      }
    }
  }

  patchDir(path.join(clerkBackendDir, 'dist'));
  console.log('Clerk crypto successfully patched across all dist files');
}
