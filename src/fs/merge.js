import {readdir, access, writeFile, readFile} from 'fs/promises';
import { join, resolve, extname } from 'path';

const workspacePath = resolve(import.meta.dirname, '..', '..', 'workspace');
const partsPath = join(workspacePath, 'parts');
const mergedPath = join(workspacePath, 'merged.txt');

const merge = async () => {
    const partsExists = await access(partsPath).then(() => true).catch(() => false);

    if (!partsExists) {
        throw new Error('FS operation failed');
    }

    const args = process.argv;
    const filesIndex = args.indexOf('--files');
    let filesToMerge = [];

    if (filesIndex !== -1 && args[filesIndex + 1]) {
        const filesList = args[filesIndex + 1];

        filesToMerge = filesList.split(',');

        for (const fileName of filesToMerge) {
            const fileExists = await access(join(partsPath, fileName)).then(() => true).catch(() => false);

            if (!fileExists) {
                throw new Error('FS operation failed');
            }
        }
    } else {
        const items = await readdir(partsPath, { withFileTypes: true });

        for (const item of items) {
            if (item.isFile() && extname(item.name) === '.txt') {
                filesToMerge.push(item.name);
            }
        }

        filesToMerge.sort();

        if (!filesToMerge.length) {
            throw new Error('FS operation failed');
        }
    }

    const contents = [];

    for (const fileName of filesToMerge) {
        const filePath = join(partsPath, fileName);
        const content = await readFile(filePath, 'utf-8');

        contents.push(content);
    }

    await writeFile(mergedPath, contents.join(''));
};

await merge();
