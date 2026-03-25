const cp = require('child_process');
const fs = require('fs');
try {
  const result = cp.execSync('git status').toString();
  fs.writeFileSync('stellar_status.txt', result);
} catch (e) {
  fs.writeFileSync('stellar_status.txt', e.stdout ? e.stdout.toString() : e.message);
}
