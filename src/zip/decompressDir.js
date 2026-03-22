import { createReadStream } from 'fs';
import { access, mkdir, writeFile } from 'fs/promises';
import { createBrotliDecompress } from 'zlib';
import { resolve, join, dirname } from 'path';

const workspacePath = resolve(import.meta.dirname, '..', '..', 'workspace');
const compressedPath = join(workspacePath, 'compressed');
const archivePath = join(compressedPath, 'archive.br');
const decompressedPath = join(workspacePath, 'decompressed');

const decompressDir = async () => {
    const dirExists = await access(compressedPath).then(() => true).catch(() => false);

    if (!dirExists) {
        throw new Error('FS operation failed');
    }

    const archiveExists = await access(archivePath).then(() => true).catch(() => false);

    if (!archiveExists) {
        throw new Error('FS operation failed');
    }

    const chunks = [];
    const readStream = createReadStream(archivePath);
    const brotliDecompress = createBrotliDecompress();

    await new Promise((resolve, reject) => {
        readStream
            .pipe(brotliDecompress)
            .on('data', (chunk) => chunks.push(chunk))
            .on('end', resolve)
            .on('error', reject);
    });

    const archiveData = JSON.parse(Buffer.concat(chunks).toString('utf-8'));

    await mkdir(decompressedPath, { recursive: true });

    for (const file of archiveData) {
        const filePath = join(decompressedPath, file?.path);

        const fileDir = dirname(filePath);
        await mkdir(fileDir, { recursive: true });

        const content = Buffer.from(file?.content, 'base64');
        await writeFile(filePath, content);
    }
};

await decompressDir();
