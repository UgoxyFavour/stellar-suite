const cp = require('child_process');
const fs = require('fs');
try {
  console.log('Staging all...');
  cp.execSync('git add -A');
  console.log('Committing...');
  try {
    cp.execSync('git commit -m "resolve conflicts"');
  } catch (e) {
    console.log('Commit failed, maybe already committed. ' + e.message);
  }
  console.log('Rebasing continue...');
  const out = cp.execSync('git rebase --continue').toString();
  fs.writeFileSync('c:/Users/user/OneDrive/Documents/stellar-suite/rebase_success.txt', out);
} catch (e) {
  const errText = e.stdout ? e.stdout.toString() : e.message;
  fs.writeFileSync('c:/Users/user/OneDrive/Documents/stellar-suite/rebase_error.txt', errText + '\n' + (e.stderr ? e.stderr.toString() : ''));
}
