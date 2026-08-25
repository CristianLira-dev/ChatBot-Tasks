const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');
const ambiente = require('../configuracao/ambiente');
const logger = require('../configuracao/logger');

const nomesFilas = {
  mensagens: 'processamento-mensagens',
  lembretes: 'processamento-lembretes',
  calendarios: 'sincronizacao-calendarios',
  whatsapp: 'envio-whatsapp',
  resumos: 'resumo-diario'
};

function criarConexao() {
  return new IORedis(ambiente.redis, { maxRetriesPerRequest: null, enableReadyCheck: false });
}

function criarFila(nome) {
  if (process.env.USAR_FILAS_MEMORIA === 'true') {
    return { nome, adicionados: [], async add(tipo, dados, opcoes) { const job = { id: `${nome}-${this.adicionados.length + 1}`, tipo, dados, opcoes }; this.adicionados.push(job); return job; }, async close() {} };
  }
  return new Queue(nome, { connection: criarConexao(), defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 1000 }, removeOnComplete: 50, removeOnFail: 100 } });
}

const filas = Object.fromEntries(Object.entries(nomesFilas).map(([chave, nome]) => [chave, criarFila(nome)]));

async function fecharFilas() {
  await Promise.all(Object.values(filas).map((fila) => fila.close()));
}

function criarWorker(nome, processador) {
  const worker = new Worker(nome, processador, { connection: criarConexao(), concurrency: 2 });
  worker.on('completed', (job) => logger.info({ fila: nome, jobId: job.id }, 'job concluído'));
  worker.on('failed', (job, erro) => logger.error({ fila: nome, jobId: job?.id, erro: erro.message }, 'job falhou'));
  return worker;
}

module.exports = { filas, nomesFilas, criarConexao, criarWorker, fecharFilas };
