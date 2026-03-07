import { Worker } from 'worker_threads';
import { readFile } from 'fs/promises';
import { cpus } from 'os';
import { resolve, join } from 'path';

const workspacePath = resolve(import.meta.dirname, '..', '..', 'workspace');
const dataPath = join(workspacePath, 'data.json');
const workerPath = join(import.meta.dirname, 'worker.js');

const splitIntoChunks = (array, n) => {
    const chunks = [];
    const chunkSize = Math.ceil(array.length / n);

    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }

    return chunks;
};
const kWayMerge = (arrays) => {
    const pointers = new Array(arrays.length).fill(0);
    const result = [];
    const totalElements = arrays.reduce((sum, arr) => sum + arr.length, 0);

    for (let i = 0; i < totalElements; i++) {
        let minValue = Infinity;
        let minIndex = -1;

        for (let j = 0; j < arrays.length; j++) {
            if (pointers[j] < arrays[j].length && arrays[j][pointers[j]] < minValue) {
                minValue = arrays[j][pointers[j]];
                minIndex = j;
            }
        }

        result.push(minValue);
        pointers[minIndex]++;
    }

    return result;
};

const runWorker = (chunk) => {
    return new Promise((resolve, reject) => {
        const worker = new Worker(workerPath);

        worker.on('message', (sortedChunk) => {
            resolve(sortedChunk);
        });

        worker.on('error', reject);

        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker exited with code ${code}`));
            }
        });

        worker.postMessage(chunk);
    });
};
const main = async () => {
    const jsonContent = await readFile(dataPath, 'utf-8');
    const numbers = JSON.parse(jsonContent);

    const numCores = cpus().length;
    const chunks = splitIntoChunks(numbers, numCores);

    const workerPromises = chunks.map((chunk) => runWorker(chunk));
    const sortedChunks = await Promise.all(workerPromises);

    const sortedArray = kWayMerge(sortedChunks);

    console.log(sortedArray);
};

await main();
