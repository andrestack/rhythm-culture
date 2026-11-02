// Copies .agents/skills (the source; the path Codex reads) to .claude/skills (the path Claude Code reads).
// A real copy, not a symlink: Git on Windows can't create symlinks without Developer Mode, and the client uses Windows.
//   node scripts/sync-skills.mjs          -> make .claude/skills an exact copy (runs before every build)
//   node scripts/sync-skills.mjs --check  -> exit 1 if the copy is out of date, change nothing
// Edit skills in .agents/skills only; .claude/skills is overwritten.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, '.agents/skills');
const DEST = path.join(ROOT, '.claude/skills');

const list = (dir) => {
  const out = new Map();
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else out.set(path.relative(dir, p).split(path.sep).join('/'), fs.readFileSync(p));
    }
  })(dir);
  return out;
};

const src = list(SRC);
const destStat = fs.lstatSync(DEST, { throwIfNoEntry: false });
const dest = destStat?.isDirectory() ? list(DEST) : new Map();
const stale = [...new Set([...src.keys(), ...dest.keys()])]
  .filter((f) => !src.has(f) || !dest.has(f) || !src.get(f).equals(dest.get(f)));

if (process.argv.includes('--check')) {
  if (stale.length) {
    console.error(`.claude/skills is out of date with .agents/skills (${stale.length} file(s)): run npm run sync-skills\n  ` + stale.join('\n  '));
    process.exit(1);
  }
  console.log('.claude/skills is in sync');
  process.exit(0);
}

if (!stale.length && destStat?.isDirectory()) process.exit(0);

// Remove the old copy. A symlink or stub file (older checkouts) is unlinked, never followed into .agents.
if (destStat) {
  if (destStat.isDirectory() && !destStat.isSymbolicLink()) fs.rmSync(DEST, { recursive: true });
  else fs.unlinkSync(DEST);
}
for (const [rel, buf] of src) {
  const to = path.join(DEST, rel);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.writeFileSync(to, buf);
}
console.log(`.claude/skills synced from .agents/skills (${src.size} files)`);
