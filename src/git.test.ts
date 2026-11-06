import { it, expect } from 'vitest'; import { parseHistory, ancestors, layout, type Commit } from './git';
const c = (hash: string, parents: string[]): Commit => ({ hash: hash.repeat(7), parents: parents.map(x => x.repeat(7)), author: 'Test', date: '2026-01-01T00:00:00Z', message: 'Fixture pengujian' });
const fixture = () => ({ version: 1, commits: [c('a',['b','c']),c('b',['d']),c('c',['d']),c('d',[])], branches: [{ name: 'main', hash: 'aaaaaaa' }] });
it('menampilkan kedua parent merge dan urutan topologi', () => { const h = parseHistory(JSON.stringify(fixture())); const p = layout(h.commits); expect(p.get('aaaaaaa')!.y).toBeLessThan(p.get('bbbbbbb')!.y); expect(p.get('bbbbbbb')!.x).not.toBe(p.get('ccccccc')!.x); });
it('filter branch mengikuti seluruh ancestry merge', () => { expect(ancestors(fixture().commits, 'aaaaaaa').size).toBe(4); expect(ancestors(fixture().commits, 'bbbbbbb').size).toBe(2); });
it('menolak siklus, hash duplikat, dan data rusak', () => { const h = fixture(); h.commits[3].parents = ['aaaaaaa']; expect(() => parseHistory(JSON.stringify(h))).toThrow('siklus'); expect(() => parseHistory('{}')).toThrow(); });
it('menerima batas riwayat tanpa mengarang parent', () => { const h = fixture(); h.commits.pop(); expect(parseHistory(JSON.stringify(h)).commits).toHaveLength(3); });
