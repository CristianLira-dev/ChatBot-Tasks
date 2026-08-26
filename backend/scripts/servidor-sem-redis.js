process.env.USAR_BANCO_MEMORIA = process.env.USAR_BANCO_MEMORIA || 'false';
process.env.USAR_FILAS_MEMORIA = 'true';

const ambiente = require('../src/configuracao/ambiente');
const logger = require('../src/configuracao/logger');
const { app, servicos } = require('../src/servidor');
const { iniciarAgendadorLocal } = require('../src/agendador-local');

const servidor = app.listen(ambiente.porta, () => {
  logger.info({ porta: ambiente.porta, banco: 'postgresql', filas: 'local', whatsapp: ambiente.modoWhatsapp }, 'backend iniciado sem Redis');
});

const agendador = iniciarAgendadorLocal({ servicoLembretes: servicos.servicoLembretes });

function encerrar() {
  agendador.parar();
  servidor.close(async () => {
    await servicos.repositorio?.desconectar?.();
    process.exit(0);
  });
}

process.on('SIGINT', encerrar);
process.on('SIGTERM', encerrar);
