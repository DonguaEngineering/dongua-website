import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const source = resolve('public/_redirects');
const destination = resolve(
    'dist/dongua-website/browser/_redirects',
);

await mkdir(dirname(destination), { recursive: true });
await copyFile(source, destination);

console.log('Copied Cloudflare _redirects file.');