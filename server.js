const cluster = require('cluster');
const os = require('os');
const totalCPU = os.cpus().length;

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./config.json');
const { logMiddleware, corsMiddleware, corsOptions } = require('./middlewares');
const { setupRouters } = require('./routes');
const logger = require('./middlewares/logger.js');
const partnerRouter = require('./routes/PartnerRoutes.js'); // Ensure this path is correct

class Server {
    constructor() {
        this.app = express();
        this.configureServer();
        this.setupCluster();
    }

    startServer() {
        const { app } = this;
        setupRouters(app); // Existing function for setting up routers

        // Add the partner routes
        app.use('/api/partner', partnerRouter);

        app.use(Server.errorHandler);
        app.listen(config.PORT, '0.0.0.0', () => {
            logger.info(`Available CPUs: ${totalCPU}`);
            logger.info(`Server Port: ${config.PORT}`);
            logger.info(`Fork Worker Server active on: ${process.pid}`);
        });
    }

    configureServer() {
        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));
        this.app.use(bodyParser.urlencoded({ extended: true }));

        this.app.use(logMiddleware('logs/log.txt'));
        this.app.use(corsMiddleware);
        this.app.use(cors(corsOptions));
        this.app.options('*', cors());
    }

    setupCluster() {
        if (cluster.isPrimary) {
            console.log(`Primary Server active on: ${process.pid}`);
            for (let i = 0; i < totalCPU; i++) {
                cluster.fork();
            }
            this.setupClusterEventHandlers();
        } else {
            this.startServer();
        }
    }

    setupClusterEventHandlers() {
        cluster.on('fork', (worker) => {
            logger.info(`Worker ${worker.process.pid} forked`);
        });

        cluster.on('online', (worker) => {
            logger.info(`Worker ${worker.process.pid} is online`);
        });

        cluster.on('listening', (worker, address) => {
            const hostname = address.address || '0.0.0.0';
            const port = address.port;
            logger.info(`Worker ${worker.process.pid} is now listening on ${hostname}:${port}`);
        });

        cluster.on('exit', (worker, code, signal) => {
            logger.error(`Worker ${worker.process.pid} died`);
            // Optionally restart the worker
            cluster.fork();
        });
    }

    static errorHandler(err, req, res, next) {
        err.statusCode = err.statusCode || 500;
        err.message = err.message || "Internal Server Error";
        res.status(err.statusCode).json({
            message: err.message,
        });
    }
}

// Create an instance of the server
new Server();
