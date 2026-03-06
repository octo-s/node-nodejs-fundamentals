const getArg = (name, defaultValue) => {
     const args = process.argv;
    const index = args.indexOf(name);

    if (index !== -1 && args[index + 1]) {
        return args[index + 1];
    }
    return defaultValue;
};
const progress = () => {
    const duration = parseInt(getArg('--duration', '5000'), 10);
    const interval = parseInt(getArg('--interval', '100'), 10);
    const length = parseInt(getArg('--length', '30'), 10);
    /**
     * Please use quotes for --color argument in bash: --color "#FF0000"
     * otherwise colorArg will be null
     */
    const colorArg = getArg('--color', null);
    const totalSteps = Math.ceil(duration / interval);

    let colorCode = null;
    let currentStep = 0;

    if (colorArg && /^#[0-9A-Fa-f]{6}$/.test(colorArg)) {
        const r = parseInt(colorArg.slice(1, 3), 16);
        const g = parseInt(colorArg.slice(3, 5), 16);
        const b = parseInt(colorArg.slice(5, 7), 16);
        colorCode = `\x1b[38;2;${r};${g};${b}m`;
    }

    const render = () => {
        const percent = Math.min(Math.round((currentStep / totalSteps) * 100), 100);
        const filledLength = Math.round((percent / 100) * length);
        const emptyLength = length - filledLength;

        const filledPart = '█'.repeat(filledLength);
        const emptyPart = ' '.repeat(emptyLength);

        const coloredFilled = colorCode
            ? `${colorCode}${filledPart}\x1b[0m`
            : filledPart;

        process.stdout.write(`\r[${coloredFilled}${emptyPart}] ${percent}%`);
    };

    const timer = setInterval(() => {
        currentStep++;
        render();

        if (currentStep >= totalSteps) {
            clearInterval(timer);
            console.log('\nDone!');
        }
    }, interval);

    render();
};

progress();
