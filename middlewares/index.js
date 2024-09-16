const fs = require('fs');
const config = require('../config.json');

class Middlewares {
    constructor() { }

    static logMiddleware(filename) {
        return (req, res, next) => {
            fs.appendFile(
                filename,
                `\n${Date.now()} : ${req.ip} => ${req.method} : ${req.path}\n`,
                (err, data) => {
                    next();
                }
            );
        };
    }

    static corsOptions = {
        origin: config.ALLOWED_ORIGINS,
    };

    static corsMiddleware(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', config.ALLOWED_ORIGINS);
        next();
    }

}

module.exports = Middlewares;
