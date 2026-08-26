process.env.USAR_FILAS_MEMORIA = 'true';

const test = require('node:test');
const assert = require('node:assert/strict');
const { criarControladorWebhook } = require('../src/controladores/webhook-controlador');

function criarResposta() {
  return {
    statusCode: null,
    corpo: null,
    status(codigo) {
      this.statusCode = codigo;
      return this;
    },
    json(corpo) {
      this.corpo = corpo;
      return this;
    }
  };
}

test('processa texto diretamente quando as filas de memória estão ativas', async () => {
  const entradas = [];
  const repositorio = {
    async registrarEventoWebhook() {
      return { duplicado: false, evento: { id: 'evento-1' } };
    }
  };
  const servicoAssistente = {
    async processarEntrada(entrada) {
      entradas.push(entrada);
    }
  };
  const filaMensagens = {
    async add() {
      throw new Error('A fila Redis não deveria ser usada neste modo');
    }
  };
  const controlador = criarControladorWebhook({ repositorio, filaMensagens, servicoAssistente });
  const resposta = criarResposta();

  await controlador.evolution({
    body: {
      event: 'messages.upsert',
      instance: 'assistente-academico',
      data: {
        key: { id: 'mensagem-1', remoteJid: '5511999999999@s.whatsapp.net', fromMe: false },
        pushName: 'Cristian',
        message: { conversation: 'Tenho prova amanhã às 19h' }
      }
    }
  }, resposta);

  assert.equal(resposta.statusCode, 202);
  assert.deepEqual(resposta.corpo, { recebido: true, id: 'evento-1' });
  assert.equal(entradas.length, 1);
  assert.equal(entradas[0].telefone, '5511999999999');
  assert.equal(entradas[0].texto, 'Tenho prova amanhã às 19h');
});
