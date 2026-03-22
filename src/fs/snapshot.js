import { readdir, stat, readFile, writeFile, access } from 'fs/promises';
import { join, resolve, posix} from 'path';

const workspacePath = resolve(import.meta.dirname, '..', '..', 'workspace');
const snapshotPath = resolve(import.meta.dirname, '..', '..', 'snapshot.json');
const snapshot = async () => {
    try {
        await access(workspacePath);
    } catch {
        throw new Error('FS operation failed');
    }

    const entries = [];

    const scanDirectory = async (currentPath, relativePath = '') => {
        const items = await readdir(currentPath, { withFileTypes: true });

        for (const item of items) {
            const fullPath = join(currentPath, item.name);
            const itemRelativePath = posix.join(relativePath, item.name)


            if (item.isDirectory()) {
                entries.push({
                    path: itemRelativePath,
                    type: 'directory'
                });
                await scanDirectory(fullPath, itemRelativePath);
            } else if (item.isFile()) {
                const stats = await stat(fullPath);
                const content = await readFile(fullPath);

                entries.push({
                    path: itemRelativePath,
                    type: 'file',
                    size: stats.size,
                    content: content.toString('base64')
                });
            }
        }
    };

    await scanDirectory(workspacePath);

    const snapshotData = {
        rootPath: workspacePath,
        entries: entries
    };

    await writeFile(snapshotPath, JSON.stringify(snapshotData, null, 2));
};

await snapshot();
