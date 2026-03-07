import { createReadStream, createWriteStream } from 'fs';
import { resolve, join } from 'path';
import { Transform } from 'stream';

const workspacePath = resolve(import.meta.dirname, '..', '..', 'workspace');
const sourcePath = join(workspacePath, 'source.txt');

const split = async () => {
    const args = process.argv;
    const linesIndex = args.indexOf('--lines');
    const maxLines = linesIndex !== -1 && args[linesIndex + 1]
        ? parseInt(args[linesIndex + 1], 10)
        : 10;

    let buffer = '';
    let currentChunk = 1;
    let linesInCurrentChunk = 0;
    let currentWriteStream = null;

    const createNewChunk = () => {
        if (currentWriteStream) {
            currentWriteStream.end();
        }

        currentWriteStream = createWriteStream(join(workspacePath, `chunk_${currentChunk}.txt`));
        currentChunk++;
        linesInCurrentChunk = 0;
    };

    const transform = new Transform({
        transform(chunk, encoding, callback) {
            buffer += chunk.toString();

            const lines = buffer.split('\n');

            buffer = lines.pop();

            for (const line of lines) {
                if (!currentWriteStream || linesInCurrentChunk >= maxLines) {
                    createNewChunk();
                }

                currentWriteStream.write(line + '\n');
                linesInCurrentChunk++;
            }

            callback();
        },

        flush(callback) {
            if (buffer.length > 0) {
                if (!currentWriteStream || linesInCurrentChunk >= maxLines) {
                    createNewChunk();
                }
                currentWriteStream.write(buffer);
            }

            if (currentWriteStream) {
                currentWriteStream.end();
            }

            callback();
        }
    });

    const readStream = createReadStream(sourcePath, { encoding: 'utf-8' });

    await new Promise((resolve, reject) => {
        readStream
            .pipe(transform)
            .on('finish', resolve)
            .on('error', reject);
    });
};

await split();
