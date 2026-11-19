// Leonida Trophy Guide — the program that hands this entry in.
//
// The guide itself is app/: plain static files (index.html, ES modules, CSS and
// app/data/trophies.json) that open in desktop Chrome and work with the network
// off. This program copies app/ and screenshots/ from beside this file into
// /output and writes /output/dossier.json with the vendored make.fun library,
// exactly as the scorer rebuilds it. vendor/makefun-frontend.ts is the kit's
// copy, unchanged — the scorer requires the dossier to be byte for byte what
// its own copy of that library writes.
//
// Node 22, standard library only, no build step. Outside the grader's
// container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Start from a clean output directory so a stale file from an earlier run can
// never ride along into the entry (the scorer caps /output at 1,000 entries).
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the others refuse an entry the scorer would refuse (more than 4
// screenshots or one over 256 KiB; more than 993 files and directories in app/
// or 48 MiB of app files: app/ counts beside /output's own 1,000-entry cap,
// its screenshots/ and dossier.json).
const dossier = buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 });
writeFileSync(join(out, 'dossier.json'), dossier);
console.log(`Leonida Trophy Guide handed in: dossier.json is ${dossier.length} bytes.`);
