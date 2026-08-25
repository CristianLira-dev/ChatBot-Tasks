const logger = require('./configuracao/logger');
const { criarWorker, nomesFilas } = require('./filas/filas');
const { servicos } = require('./servidor');

function iniciarWorkers() {
  const workers = [
    criarWorker(nomesFilas.mensagens, async (job) => servicos.servicoAssistente.processarEntrada(job.data)),
    criarWorker(nomesFilas.lembretes, async (job) => servicos.servicoLembretes.processar(job.data.lembreteId)),
    criarWorker(nomesFilas.calendarios, async (job) => servicos.servicoCalendarios.sincronizar(job.data.usuarioId, job.data.provedor)),
    criarWorker(nomesFilas.whatsapp, async (job) => servicos.servicoWhatsapp.enviarResposta(job.data.telefone, job.data.texto)),
    criarWorker(nomesFilas.resumos, async (job) => ({ gerado: true, usuarioId: job.data.usuarioId }))
  ];
  logger.info({ quantidade: workers.length }, 'workers iniciados');
  return workers;
}

if (require.main === module) iniciarWorkers();

module.exports = { iniciarWorkers };
