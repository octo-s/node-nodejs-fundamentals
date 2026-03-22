import { createInterface } from 'readline';

const interactive = () => {
    const readlineInterface = createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const prompt = () => {
        readlineInterface.question('> ', (input) => {
            const command = input.trim();

            switch (command) {
                case 'uptime':
                    console.log(`Uptime: ${process.uptime().toFixed(2)}s`);
                    break;

                case 'cwd':
                    console.log(process.cwd());
                    break;

                case 'date':
                    console.log(new Date().toISOString());
                    break;

                case 'exit':
                    readlineInterface.close();
                    return;

                default:
                    console.log('Unknown command');
            }

            prompt();
        });
    };

    readlineInterface.on('close', () => {
        console.log('Goodbye!');
        process.exit(0);
    });

    prompt();
};

interactive();
