const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

if (pkg.version !== manifest.version) {
  pkg.version = manifest.version;
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');
  console.log(`Synced package.json version to ${manifest.version}`);
} else {
  console.log(`Version already in sync: ${manifest.version}`);
}
