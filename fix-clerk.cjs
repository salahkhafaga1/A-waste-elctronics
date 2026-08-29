const fs = require('fs');
const path = require('path');

const files = [
  'node_modules/@clerk/backend/dist/index.js',
  'node_modules/@clerk/backend/dist/internal.js',
];

files.forEach((file) => {
  const fullPath = path.resolve(file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(/require\(["']#crypto["']\)/g, 'require("./runtime/node/crypto.js")');
    fs.writeFileSync(fullPath, content);
  }
});

const browserDir = path.resolve('node_modules/@clerk/backend/dist/runtime/browser');
fs.mkdirSync(browserDir, { recursive: true });

fs.writeFileSync(
  path.join(browserDir, 'crypto.js'),
  'module.exports.webcrypto = globalThis.crypto;\n'
);

fs.writeFileSync(
  path.resolve('node_modules/@clerk/backend/dist/runtime/node/crypto.js'),
  'module.exports.webcrypto = (typeof globalThis !== "undefined" && globalThis.crypto) || (typeof require !== "undefined" ? require("crypto").webcrypto : undefined);\n'
);

console.log('Clerk crypto successfully patched');
