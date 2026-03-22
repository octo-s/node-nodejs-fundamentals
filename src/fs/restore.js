import { readFile, writeFile, mkdir, access } from 'fs/promises';
import { join, resolve, dirname } from 'path';

const snapshotPath = resolve(import.meta.dirname, '..', '..', 'snapshot.json');
const restorePath = resolve(import.meta.dirname, '..', '..', 'workspace_restored');

const restore = async () => {
    try {
        await access(snapshotPath);
    } catch {
        throw new Error('FS operation failed');
    }

    const restoreExists = await access(restorePath).then(() => true).catch(() => false);

    if (restoreExists) {
        throw new Error('FS operation failed');
    }

    await mkdir(restorePath);

    const snapshotContent = await readFile(snapshotPath, 'utf-8');

    for (const entry of JSON.parse(snapshotContent).entries) {
        const fullPath = join(restorePath, entry.path);

        if (entry.type === 'directory') {
            await mkdir(fullPath, { recursive: true });
        } else if (entry.type === 'file') {
            await mkdir(dirname(fullPath), { recursive: true });

            const content = Buffer.from(entry.content, 'base64');
            await writeFile(fullPath, content);
        }
    }

};

await restore();
