import { parentPort } from 'worker_threads';

parentPort.on('message', (data) => {
    const sortedNumbers = [...data].sort((a, b) => a - b);

    parentPort.postMessage(sortedNumbers);
});
