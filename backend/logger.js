// logger.js
const pino = require('pino');
const path = require('path');

module.exports = pino(
    pino.destination({
        dest:  (path.join(__dirname, 'logs', 'app.log')),
        sync: false,
        timestamp: pino.stdTimeFunctions.isoTime
    })
);
