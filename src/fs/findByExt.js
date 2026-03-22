import { readdir, access } from 'fs/promises';
import { join, resolve, posix, extname } from 'path';

const workspacePath = resolve(import.meta.dirname, '..', '..', 'workspace');

const findByExt = async () => {
    const args = process.argv;
    let extension = '.txt';

    const extIndex = args.indexOf('--ext');

    if (extIndex !== -1 && args[extIndex + 1]) {
        const ext = args[extIndex + 1];

        extension = ext.startsWith('.') ? ext : '.' + ext;
    }

    const workspaceExists = await access(workspacePath).then(() => true).catch(() => false);

    if (!workspaceExists) {
        throw new Error('FS operation failed');
    }

    const matchingFiles = [];

    const scanDirectory = async (currentPath, relativePath = '') => {
        const items = await readdir(currentPath, { withFileTypes: true });

        for (const item of items) {
            const itemRelativePath = posix.join(relativePath, item.name);

            if (item.isDirectory()) {
                await scanDirectory(join(currentPath, item.name), itemRelativePath);

            } else if (item.isFile()) {
                if (extname(item.name) === extension) {
                    matchingFiles.push(itemRelativePath);
                }
            }
        }
    };

    await scanDirectory(workspacePath);

    matchingFiles.sort();

    for (const filePath of matchingFiles) {
        console.log(filePath);
    }
};

await findByExt();
