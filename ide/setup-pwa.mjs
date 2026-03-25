import fs from 'fs';
import { execSync } from 'child_process';
import { resolve } from 'path';

console.log('Copying icons...');
try {
  fs.copyFileSync(resolve('./public/icon.png'), resolve('./public/pwa-192x192.png'));
  fs.copyFileSync(resolve('./public/icon.png'), resolve('./public/pwa-512x512.png'));
  console.log('Icons copied successfully.');
} catch(e) {
  console.error('Error copying icons:', e);
}

console.log('Running npm install...');
try {
  execSync('npm install -D vite-plugin-pwa', { stdio: 'inherit', shell: true });
  console.log('Installed vite-plugin-pwa successfully.');
} catch(e) {
  console.error('Failed to install:', e);
}
