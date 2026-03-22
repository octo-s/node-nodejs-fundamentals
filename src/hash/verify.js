import { access, readFile } from 'fs/promises';
import { createReadStream } from 'fs';
import { createHash } from 'crypto';
import { join, resolve } from 'path';

const workspacePath = resolve(import.meta.dirname, '..', '..', 'workspace');
const checksumsPath = join(workspacePath, 'checksums.json');


const verify = async () => {
  const fileExists = await access(checksumsPath).then(() => true).catch(() => false);

  if (!fileExists) {
    throw new Error('FS operation failed');
  }

  const checksumsContent = await readFile(checksumsPath, 'utf-8');
  const checksums = JSON.parse(checksumsContent);

  for (const [filename, expectedHash] of Object.entries(checksums)) {
    const filePath = join(workspacePath, filename);

    const actualHash = await new Promise((resolve, reject) => {
      const hash = createHash('sha256');
      const stream = createReadStream(filePath);

      stream.on('error', (err) => reject(err));
      stream.pipe(hash);

      hash.on('finish', () => {
        resolve(hash.digest('hex'));
      });
    });

    console.log(`${filename} — ${actualHash === expectedHash ? 'OK' : 'FAIL'}`);
  }

};

await verify();
