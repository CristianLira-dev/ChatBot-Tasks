process.env.USAR_BANCO_MEMORIA = 'true';
process.env.USAR_FILAS_MEMORIA = 'true';

const test = require('node:test');
const assert = require('node:assert/strict');
const { RepositorioMemoria } = require('../src/repositorios/repositorio-dados');
const { ServicoCalendarios } = require('../src/servicos/servico-calendarios');
const { ServicoTarefas, calcularAgendamento } = require('../src/servicos/servico-tarefas');
const { ServicoAssistente } = require('../src/servicos/servico-assistente');

function criarCenario() {
  const repositorio = new RepositorioMemoria();
  const calendarios = new ServicoCalendarios(repositorio);
  const tarefas = new ServicoTarefas(repositorio, calendarios);
  const mensagens = [];
  const whatsapp = { async enviarResposta(telefone, texto) { mensagens.push({ telefone, texto }); } };
  let chamadasChatbot = 0;
  const chatbot = { async processar() { chamadasChatbot += 1; if (chamadasChatbot > 1) return { intent: 'confirm', confidence: 0.99, requiresConfirmation: false, missingFields: [], response: 'Confirmando' }; return { intent: 'create_task', confidence: 0.96, requiresConfirmation: true, missingFields: [], task: { title: 'Prova de Matemática', subject: 'Matemática', type: 'exam', dueDate: '2026-08-28', dueTime: '19:00', reminders: [{ amount: 1, unit: 'day' }] }, response: 'Entendi! Quer cadastrar?' }; } };
  const assistente = new ServicoAssistente({ repositorio, servicoTarefas: tarefas, servicoWhatsapp: whatsapp, servicoChatbot: chatbot });
  return { repositorio, calendarios, tarefas, assistente, mensagens };
}

test('calcula lembrete um dia antes', () => {
  const agendamento = calcularAgendamento('2026-08-28T19:00:00-03:00', { amount: 1, unit: 'day' });
  assert.equal(agendamento.toISOString(), '2026-08-27T22:00:00.000Z');
});

test('cria tarefa e agenda lembrete em modo memória', async () => {
  const cenario = criarCenario();
  const usuario = await cenario.repositorio.criarUsuario({ nome: 'Cristian', email: 'cristian@example.com', senhaCriptografada: 'hash', telefone: '5511999999999' });
  const resultado = await cenario.tarefas.criar(usuario.id, { titulo: 'Trabalho', tipo: 'trabalho', dataEntrega: '2026-08-28T19:00:00-03:00', reminders: [{ amount: 1, unit: 'day' }] }, { sincronizarCalendario: false });
  assert.equal(resultado.tarefa.titulo, 'Trabalho');
  const lembretes = await cenario.repositorio.listarLembretes(usuario.id);
  assert.equal(lembretes.length, 1);
});

test('mantém confirmação persistida e executa após sim', async () => {
  const cenario = criarCenario();
  await cenario.assistente.processarEntrada({ telefone: '5511999999999', nome: 'Cristian', texto: 'Tenho uma prova sexta', identificadorExterno: 'm-1' });
  const usuario = await cenario.repositorio.buscarUsuarioPorTelefone('5511999999999');
  const conversa = await cenario.repositorio.buscarOuCriarConversa(usuario.id, '5511999999999');
  assert.equal(conversa.intencaoPendente, 'create_task');
  assert.ok(conversa.dadosPendentes);
  await cenario.assistente.processarEntrada({ telefone: '5511999999999', nome: 'Cristian', texto: 'Sim', identificadorExterno: 'm-2' });
  const tarefas = await cenario.tarefas.listar(usuario.id);
  assert.equal(tarefas.length, 1);
  assert.equal(tarefas[0].titulo, 'Prova de Matemática');
});
