import { createWriteStream } from 'fs';
import { readdir, access, mkdir, readFile } from 'fs/promises';
import { createBrotliCompress } from 'zlib';
import { resolve, join, relative } from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

const workspacePath = resolve(import.meta.dirname, '..', '..', 'workspace');
const toCompressPath = join(workspacePath, 'toCompress');
const compressedPath = join(workspacePath, 'compressed');
const archivePath = join(compressedPath, 'archive.br');

const getAllFiles = async (dirPath, baseDir = dirPath) => {
    const entries = await readdir(dirPath, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);

        if (entry.isDirectory()) {
            const subFiles = await getAllFiles(fullPath, baseDir);
            files.push(...subFiles);
        } else if (entry.isFile()) {
            const relativePath = relative(baseDir, fullPath);
            files.push({ path: relativePath, fullPath });
        }
    }

    return files;
};

const compressDir = async () => {
    const dirExists = await access(toCompressPath).then(() => true).catch(() => false);

    if (!dirExists) {
        throw new Error('FS operation failed');
    }

    const files = await getAllFiles(toCompressPath);
    const archiveData = [];

    for (const file of files) {
        const content = await readFile(file.fullPath);

        archiveData.push({
            path: file.path,
            content: content.toString('base64')
        });
    }

    await mkdir(compressedPath, { recursive: true });

    const readableStream = Readable.from([JSON.stringify(archiveData)]);
    const brotliCompress = createBrotliCompress();
    const writeStream = createWriteStream(archivePath);

    await pipeline(readableStream, brotliCompress, writeStream);

};

await compressDir();
