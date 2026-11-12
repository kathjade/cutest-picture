// Write the original, locally rendered illustration to the grader's required path.
import { copyFileSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const source = fileURLToPath(new URL('./entry.png', import.meta.url));
const image = readFileSync(source);
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

if (image.length < 24 || !image.subarray(0, 8).equals(pngSignature)) {
  throw new Error('entry.png must be a valid PNG image');
}
if (statSync(source).size > 1024 * 1024) {
  throw new Error('entry.png must be no larger than 1 MiB');
}
if (image.toString('ascii', 12, 16) !== 'IHDR') {
  throw new Error('entry.png must begin with a PNG IHDR header');
}
if (image[24] !== 8 || image[25] !== 6) {
  throw new Error('entry.png must use 8-bit RGBA color for clean transparency');
}
const width = image.readUInt32BE(16);
const height = image.readUInt32BE(20);
if (width > 1024 || height > 1024 || width < 1 || height < 1) {
  throw new Error('entry.png must be between 1 and 1024 pixels in each dimension');
}

const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(out, { recursive: true });
copyFileSync(source, join(out, 'entry.png'));
