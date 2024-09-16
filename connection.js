const mysql = require('mysql2');
const logger = require('./middlewares/logger');
const config = require('./config.json');

class DatabaseConnection {
    constructor() {
        this.pool = null;
        this.createPool();
    }

    createPool() {
        this.pool = mysql.createPool({
            host: config.DB_HOST,
            user: config.DB_USERNAME,
            password: config.DB_PASSWORD,
            database: config.DB_NAME,
            connectionLimit: config.DB_CONNECTION_LIMIT, // Adjust this value based on your requirements
            multipleStatements: config.DB_MULTIPLE_STATEMENTS // Add this line to enable multiple statements
        });

        this.pool.getConnection((err, connection) => {
            if (err) {
                logger.error(`Error connecting to MySQL for ${process.pid}: ${err}`);
                setTimeout(() => this.handleDisconnect(), 2000); // Retry connection after 2 seconds
            } else {
                logger.info(`DB connected for Server: ${process.pid}`);
                connection.release(); // Release the initial connection back to the pool
            }
        });
    }

    handleDisconnect() {
        this.pool.getConnection((err, connection) => {
            if (err) {
                logger.error('MySQL connection error:', err);
                if (err.code === 'PROTOCOL_PACKETS_OUT_OF_ORDER') {
                    logger.info(`Packets out of order error occurred. Re-establishing connection for ${process.pid}...`);
                    this.createPool(); // Re-establish connection
                } else if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    logger.info(`Connection lost. Re-establishing connection for ${process.pid}...`);
                    this.createPool(); // Re-establish connection if lost
                } else {
                    throw err;
                }
            } else {
                logger.info(`Reconnected to DB for ${process.pid} successfully!`);
                connection.release(); // Release the connection back to the pool
            }
        });
    }

    getPool() {
        return this.pool;
    }
}

const dbConnection = new DatabaseConnection();
module.exports = dbConnection.getPool();
