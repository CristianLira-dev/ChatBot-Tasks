const pino = require('pino');

const logger = pino({
  level: process.env.NIVEL_LOG || 'info',
  base: undefined,
  timestamp: pino.stdTimeFunctions.isoTime
});

module.exports = logger;
