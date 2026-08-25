process.env.USAR_BANCO_MEMORIA = process.env.USAR_BANCO_MEMORIA || 'true';
process.env.USAR_FILAS_MEMORIA = process.env.USAR_FILAS_MEMORIA || 'true';
process.env.MODO_WHATSAPP = process.env.MODO_WHATSAPP || 'simulado';

const { app } = require('../src/servidor');
const ambiente = require('../src/configuracao/ambiente');
const logger = require('../src/configuracao/logger');

app.listen(ambiente.porta, () => logger.info({ porta: ambiente.porta, modo: 'memoria' }, 'backend iniciado em modo memória'));
