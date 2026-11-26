// Builds the single deploy folder `dist/` for the one Vercel project:
//   dist/        <- apps/mun/dist (TuronMUN + Turon Debate + admin + chair)
//   dist/hub/    <- apps/hub      (turon.one homepage; served via middleware.js)
import { cpSync, rmSync, existsSync } from 'node:fs';

rmSync('dist', { recursive: true, force: true });
if (!existsSync('apps/mun/dist/index.html')) throw new Error('assemble: apps/mun/dist missing — run the MUN build first');
cpSync('apps/mun/dist', 'dist', { recursive: true });
cpSync('apps/hub', 'dist/hub', {
  recursive: true,
  filter: (src) => !/[\/]vercel\.json$/.test(src),
});
console.log('assemble: dist/ (MUN app) + dist/hub/ (hub) ready');
