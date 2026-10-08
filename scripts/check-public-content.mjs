import {readFile, readdir, access} from 'node:fs/promises';
import {join, dirname, resolve, relative} from 'node:path';
import {fileURLToPath} from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(await readFile(join(root, 'publication-manifest.json'), 'utf8'));
const permitted = new Set(manifest);
const errors = [];
async function walk(dir, prefix = '') {
  for (const entry of await readdir(dir, {withFileTypes: true})) {
    if (entry.name === '.git') continue;
    const path = prefix + entry.name;
    if (entry.isDirectory()) await walk(join(dir, entry.name), path + '/');
    else if (!entry.isFile() || !permitted.has(path)) errors.push(`Unapproved file: ${path}`);
  }
}
await walk(root);
// Construct patterns from parts so the scanner can scan its own source.
const secretPatterns = [
  new RegExp('(?:sk|rk)_' + '(?:live|test)_[A-Za-z0-9]{10,}'),
  new RegExp('eyJ[A-Za-z0-9_-]{12,}\\.' + '[A-Za-z0-9_-]{12,}\\.[A-Za-z0-9_-]{12,}'),
  new RegExp('-----BEGIN ' + '(?:RSA |EC |OPENSSH )?PRIVATE KEY-----'),
  new RegExp('gh' + '(?:p|o|u|s|r)_[A-Za-z0-9]{20,}'),
  new RegExp('github_' + 'pat_[A-Za-z0-9_]{20,}'),
  new RegExp('https://[a-z0-9]{20}\\.' + 'supabase\\.co'),
  new RegExp('C:[\\\\/]' + 'Users[\\\\/]'),
  new RegExp('(?:prj|team|dpl)_' + '[A-Za-z0-9]{12,}')
];
for (const path of manifest) {
  if (path.includes('..') || path.startsWith('/') || path.includes('\\')) {errors.push(`Invalid manifest path: ${path}`); continue;}
  const full = join(root, path);
  try {await access(full);} catch {errors.push(`Missing: ${path}`); continue;}
  const bytes = await readFile(full);
  if (path.endsWith('.jpg')) {
    if (bytes[0] !== 255 || bytes[1] !== 216 || bytes[2] !== 255) errors.push(`Invalid JPEG: ${path}`);
    continue;
  }
  const text = bytes.toString('utf8');
  if (secretPatterns.some(pattern => pattern.test(text))) errors.push(`Sensitive-content pattern: ${path}`);
  if (path.endsWith('.md')) {
    for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
      const target = match[1];
      if (/^(https?:|mailto:|#)/.test(target)) continue;
      const destination = resolve(dirname(full), target.split('#')[0]);
      if (relative(root, destination).startsWith('..')) {errors.push(`Out-of-repo link: ${path}`); continue;}
      try {await access(destination);} catch {errors.push(`Broken link in ${path}: ${target}`);}
    }
  }
}
if (errors.length) {console.error(errors.join('\n')); process.exitCode = 1;}
else console.log(`Public-content check passed: ${manifest.length} approved files, local links resolved, no matched sensitive patterns. Images require separate visual review.`);
