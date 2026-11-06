export interface Commit { hash: string; parents: string[]; author: string; date: string; message: string }
export interface Branch { name: string; hash: string }
export interface History { version: 1; commits: Commit[]; branches: Branch[] }
export function parseHistory(text: string): History {
  const data = JSON.parse(text) as History;
  if (!data || data.version !== 1 || !Array.isArray(data.commits) || data.commits.length > 5000 || !Array.isArray(data.branches)) throw new Error('Gunakan format JSON versi 1, maksimal 5.000 commit.');
  const hashes = new Set<string>();
  for (const c of data.commits) {
    if (!c || typeof c.hash !== 'string' || !/^[a-f0-9]{7,64}$/i.test(c.hash) || hashes.has(c.hash) || !Array.isArray(c.parents) || c.parents.some(p => typeof p !== 'string' || !/^[a-f0-9]{7,64}$/i.test(p)) || new Set(c.parents).size !== c.parents.length || typeof c.author !== 'string' || typeof c.message !== 'string' || typeof c.date !== 'string' || !Number.isFinite(Date.parse(c.date))) throw new Error('Commit tidak valid atau hash duplikat.');
    hashes.add(c.hash);
  }
  if (data.branches.some(b => !b || typeof b.name !== 'string' || typeof b.hash !== 'string' || !hashes.has(b.hash))) throw new Error('Branch harus menunjuk commit dalam data impor.');
  topological(data.commits);
  return data;
}
export function topological(commits: Commit[]) {
  const map = new Map(commits.map(c => [c.hash, c])); const children = new Map(commits.map(c => [c.hash, 0]));
  for (const c of commits) for (const p of c.parents) if (map.has(p)) children.set(p, children.get(p)! + 1);
  const queue = commits.filter(c => children.get(c.hash) === 0).sort((a, b) => Date.parse(b.date) - Date.parse(a.date)); const ordered: Commit[] = [];
  while (queue.length) { const c = queue.shift()!; ordered.push(c); for (const p of c.parents) if (map.has(p)) { children.set(p, children.get(p)! - 1); if (!children.get(p)) { queue.push(map.get(p)!); queue.sort((a, b) => Date.parse(b.date) - Date.parse(a.date)); } } }
  if (ordered.length !== commits.length) throw new Error('Relasi commit mengandung siklus.');
  return ordered;
}
export function ancestors(commits: Commit[], tip: string) {
  const map = new Map(commits.map(c => [c.hash, c])); const seen = new Set<string>(); const pending = [tip];
  while (pending.length) { const hash = pending.pop()!; if (seen.has(hash) || !map.has(hash)) continue; seen.add(hash); pending.push(...map.get(hash)!.parents); }
  return seen;
}
export function layout(commits: Commit[]) {
  const lanes: (string | null)[] = []; const nodes = new Map<string, { x: number; y: number; lane: number }>();
  topological(commits).forEach((c, row) => { let lane = lanes.indexOf(c.hash); if (lane < 0) { lane = lanes.indexOf(null); if (lane < 0) lane = lanes.length; } lanes[lane] = null; nodes.set(c.hash, { x: 28 + lane * 30, y: 34 + row * 58, lane });
    c.parents.forEach((p, i) => { if (!lanes.includes(p)) { let slot = i === 0 && lanes[lane] === null ? lane : lanes.indexOf(null); if (slot < 0) slot = lanes.length; lanes[slot] = p; } });
  });
  return nodes;
}
