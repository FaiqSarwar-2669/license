const { createLogger, format, transports } = require('winston');
const config = require('../config.json');

// Define log formats
const logFormat = format.combine(
    format.timestamp(),
    format.printf(({ level, message, timestamp }) => {
        return `${timestamp} ${level}: ${message}`;
    })
);

// Create a logger instance
const logger = createLogger({
    level: config.LOG_LEVEL,
    format: logFormat,
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'logs/app.log' }) // Save logs to a file
    ]
});

module.exports = logger;
