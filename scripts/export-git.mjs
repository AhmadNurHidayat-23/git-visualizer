import { execFileSync } from 'node:child_process';
const cwd = process.argv[2] || process.cwd();
const git = args => execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 30 * 1024 * 1024, windowsHide: true });
try {
  const tokens = git(['log', '--all', '--topo-order', '--max-count=5000', '-z', '--format=%H%x00%P%x00%an%x00%aI%x00%s']).split('\0');
  if (tokens.at(-1) === '') tokens.pop();
  const commits = [];
  for (let i = 0; i < tokens.length; i += 5) commits.push({ hash: tokens[i], parents: tokens[i + 1].split(' ').filter(Boolean), author: tokens[i + 2], date: tokens[i + 3], message: tokens[i + 4] });
  const hashes = new Set(commits.map(c => c.hash));
  const branches = git(['for-each-ref', '--format=%(refname:short)%00%(objectname)', 'refs/heads', 'refs/remotes']).trim().split(/\r?\n/).filter(Boolean).map(line => { const [name, hash] = line.split('\0'); return { name, hash }; }).filter(b => hashes.has(b.hash));
  process.stdout.write(JSON.stringify({ version: 1, commits, branches }, null, 2));
} catch { console.error('Tidak dapat membaca repository Git. Pastikan path valid dan Git tersedia.'); process.exitCode = 1; }
