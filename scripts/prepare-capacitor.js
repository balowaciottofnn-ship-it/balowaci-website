const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'www');
const entries = [
  'index.html',
  'manifest.webmanifest',
  'sw.js',
  'assets'
];

function copyRecursive(source, destination) {
  const stats = fs.statSync(source);
  if (stats.isDirectory()) {
    fs.mkdirSync(destination, { recursive: true });
    for (const entry of fs.readdirSync(source)) {
      copyRecursive(path.join(source, entry), path.join(destination, entry));
    }
    return;
  }
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const entry of entries) {
  copyRecursive(path.join(root, entry), path.join(output, entry));
}

console.log('Prepared Capacitor web bundle in www/');
