class Logger {
    constructor(loggerInterface) {
        this.logger = loggerInterface;
    }
    log(input) {
        this.logger.log(input);
    }
}

const consoleLoggerInterface = {
    log: function (input) {
        console.log(input);
    }
}

module.exports = {
    Logger,
    consoleLoggerInterface
}