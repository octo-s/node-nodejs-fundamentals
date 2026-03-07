import { Transform } from 'stream';

const lineNumberer = () => {
    let lineNumber = 1;
    let buffer = '';

    const transform = new Transform({
        transform(chunk, encoding, callback) {
            buffer += chunk.toString();

            const lines = buffer.split('\n');

            buffer = lines.pop();

            for (const line of lines) {
                this.push(`${lineNumber} | ${line}\n`);
                lineNumber++;
            }

            callback();
        },

        flush(callback) {
            if (buffer.length > 0) {
                this.push(`${lineNumber} | ${buffer}`);
            }
            callback();
        }
    });

    process.stdin.pipe(transform).pipe(process.stdout);
};

lineNumberer();
