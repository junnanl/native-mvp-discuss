#!/usr/bin/env node

import path from 'path';
import { fileURLToPath } from 'url';

const toolpackRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtimeBin = path.join(toolpackRoot, 'runtime', 'bin');
const runtimeLib = path.join(toolpackRoot, 'runtime', 'lib');

process.env.PATH = [runtimeBin, process.env.PATH].filter(Boolean).join(path.delimiter);
process.env.LD_LIBRARY_PATH = [runtimeLib, process.env.LD_LIBRARY_PATH]
  .filter(Boolean)
  .join(path.delimiter);

await import('./index.js');
