const crypto = require('node:crypto');
const { gerarHashSenha } = require('../utilitarios/seguranca');
const { ServicoChatbot } = require('./servico-chatbot');

function telefoneLimpo(telefone = '') { return String(telefone).replace(/@s\.whatsapp\.net|@g\.us|\D/g, ''); }

function textoFallback(texto) {
  const baixo = texto.toLowerCase();
  if (/^(sim|s|confirmo|pode|ok|yes)$/.test(baixo.trim())) return { intent: 'confirm', confidence: 0.7, requiresConfirmation: false, missingFields: [], response: '' };
  if (/^(não|nao|n|cancelar|cancela)$/.test(baixo.trim())) return { intent: 'cancel', confidence: 0.7, requiresConfirmation: false, missingFields: [], response: 'Tudo bem, não fiz nenhuma alteração.' };
  return { intent: 'unknown', confidence: 0.1, requiresConfirmation: false, missingFields: [], response: 'Posso organizar tarefas, provas e trabalhos. Experimente: “Tenho prova de matemática sexta às 19h”.' };
}

class ServicoAssistente {
  constructor({ repositorio, servicoTarefas, servicoWhatsapp, servicoChatbot = new ServicoChatbot() }) {
    this.repositorio = repositorio;
    this.servicoTarefas = servicoTarefas;
    this.servicoWhatsapp = servicoWhatsapp;
    this.servicoChatbot = servicoChatbot;
  }

  async obterUsuarioPorTelefone(telefone, nome) {
    const limpo = telefoneLimpo(telefone);
    let usuario = await this.repositorio.buscarUsuarioPorTelefone(limpo);
    if (!usuario) {
      usuario = await this.repositorio.criarUsuario({ nome: nome || 'Estudante', telefone: limpo, email: `${limpo || crypto.randomUUID()}@whatsapp.local`, senhaCriptografada: await gerarHashSenha(crypto.randomBytes(24).toString('hex')), fusoHorario: 'America/Sao_Paulo' });
    }
    return usuario;
  }

  async processarEntrada({ telefone, nome, texto, identificadorExterno, recebidoEm = new Date() }) {
    const usuario = await this.obterUsuarioPorTelefone(telefone, nome);
    const conversa = await this.repositorio.buscarOuCriarConversa(usuario.id, telefoneLimpo(telefone));
    const mensagem = await this.repositorio.salvarMensagem({ conversaId: conversa.id, identificadorMensagemExterna: identificadorExterno || null, direcao: 'entrada', conteudo: texto, tipoMensagem: 'texto', statusProcessamento: 'processando', criadoEm: new Date(recebidoEm) });
    const tarefasRecentes = await this.repositorio.listarTarefas(usuario.id, { status: 'pendente' });
    let interpretacao;
    try {
      interpretacao = await this.servicoChatbot.processar({ user: { id: usuario.id, name: usuario.nome, timezone: usuario.fusoHorario }, conversation: { id: conversa.id }, message: { id: mensagem.id, content: texto, receivedAt: new Date(recebidoEm).toISOString() }, context: { pendingAction: conversa.intencaoPendente ? { intent: conversa.intencaoPendente, task: conversa.dadosPendentes } : null, recentTasks: tarefasRecentes.slice(0, 10) } });
    } catch (erro) {
      interpretacao = textoFallback(texto);
    }

    let resposta = interpretacao.response || '';
    if (interpretacao.intent === 'confirm' && conversa.intencaoPendente === 'create_task' && conversa.dadosPendentes) {
      const resultado = await this.servicoTarefas.criar(usuario.id, conversa.dadosPendentes, { sincronizarCalendario: true });
      await this.repositorio.atualizarConversa(conversa.id, { intencaoPendente: null, dadosPendentes: null });
      resposta = `✅ Pronto!\n\nA tarefa “${resultado.tarefa.titulo}” foi adicionada à sua agenda.\n\n🔔 O primeiro lembrete foi agendado.`;
    } else if (interpretacao.intent === 'cancel' && conversa.intencaoPendente) {
      await this.repositorio.atualizarConversa(conversa.id, { intencaoPendente: null, dadosPendentes: null });
      resposta = resposta || 'Tudo bem, cancelei a operação pendente.';
    } else if (interpretacao.intent === 'create_task') {
      if (interpretacao.missingFields?.length) {
        await this.repositorio.atualizarConversa(conversa.id, { intencaoPendente: 'create_task', dadosPendentes: interpretacao.task || {} });
      } else if (interpretacao.requiresConfirmation !== false) {
        await this.repositorio.atualizarConversa(conversa.id, { intencaoPendente: 'create_task', dadosPendentes: interpretacao.task || {} });
      } else {
        const resultado = await this.servicoTarefas.criar(usuario.id, interpretacao.task, { sincronizarCalendario: true });
        resposta = resposta || `✅ Tarefa “${resultado.tarefa.titulo}” criada.`;
      }
    } else if (['complete_task', 'delete_task'].includes(interpretacao.intent)) {
      const lista = await this.servicoTarefas.listar(usuario.id, { status: 'pendente' });
      const referencia = interpretacao.task?.title?.toLowerCase()?.replace(/^(o|a)\s+/, '') || '';
      const alvo = referencia ? lista.find((item) => item.titulo.toLowerCase().includes(referencia) || referencia.includes(item.titulo.toLowerCase())) : null;
      if (!alvo) {
        resposta = 'Qual tarefa você quer alterar? Envie o título ou diga, por exemplo, “Terminei o trabalho de programação”.';
      } else if (interpretacao.intent === 'complete_task') {
        await this.servicoTarefas.concluir(usuario.id, alvo.id);
        resposta = `✅ Marquei “${alvo.titulo}” como concluída.`;
      } else {
        await this.servicoTarefas.excluir(usuario.id, alvo.id);
        resposta = `✅ Cancelei “${alvo.titulo}”.`;
      }
    } else if (['list_today', 'list_week', 'next_exam', 'list_overdue'].includes(interpretacao.intent)) {
      const filtros = interpretacao.intent === 'list_overdue' ? { status: 'pendente' } : {};
      const lista = await this.servicoTarefas.listar(usuario.id, filtros);
      const relevantes = interpretacao.intent === 'list_today' ? lista.filter((item) => new Date(item.dataEntrega).toDateString() === new Date().toDateString()) : interpretacao.intent === 'next_exam' ? lista.filter((item) => item.tipo === 'prova').slice(0, 3) : lista.slice(0, 8);
      resposta = relevantes.length ? relevantes.map((item) => `• ${item.titulo} — ${new Date(item.dataEntrega).toLocaleString('pt-BR')}`).join('\n') : 'Você não possui tarefas para esse período.';
    }

    await this.repositorio.salvarMensagem({ conversaId: conversa.id, identificadorMensagemExterna: null, direcao: 'saida', conteudo: resposta, tipoMensagem: 'texto', statusProcessamento: 'processado' });
    await this.repositorio.atualizarConversa(conversa.id, { atualizadoEm: new Date() });
    await this.servicoWhatsapp.enviarResposta(telefone, resposta);
    return { usuario, conversa, interpretacao, resposta };
  }
}

module.exports = { ServicoAssistente, telefoneLimpo, textoFallback };
