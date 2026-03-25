const cp = require('child_process');
const fs = require('fs');
try {
  const result = cp.execSync('git status').toString();
  fs.writeFileSync('c:/Users/user/OneDrive/Documents/stellar-suite/final_status.txt', result);
} catch (e) {
  fs.writeFileSync('c:/Users/user/OneDrive/Documents/stellar-suite/final_status.txt', e.stdout ? e.stdout.toString() : e.message);
}
