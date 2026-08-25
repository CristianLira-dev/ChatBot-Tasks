const { filas } = require('../filas/filas');

const mapaTipo = { exam: 'prova', assignment: 'trabalho', task: 'tarefa', class: 'aula', appointment: 'compromisso', prova: 'prova', trabalho: 'trabalho', tarefa: 'tarefa' };
const mapaPrioridade = { low: 'baixa', medium: 'media', high: 'alta', baixa: 'baixa', media: 'media', alta: 'alta' };
const mapaUnidade = { minute: 'minuto', minutes: 'minuto', hour: 'hora', hours: 'hora', day: 'dia', days: 'dia' };

function paraDataEntrega(tarefa) {
  if (tarefa.dueDateTime) return new Date(tarefa.dueDateTime);
  const data = tarefa.dueDate || tarefa.dataEntrega;
  if (!data) return null;
  const horario = tarefa.dueTime || tarefa.horarioEntrega || '23:59';
  const dataTexto = String(data).length === 10 ? `${data}T${horario}:00` : data;
  return new Date(dataTexto);
}

function calcularAgendamento(dataEntrega, lembrete = { amount: 1, unit: 'day' }) {
  const quantidade = Number(lembrete.amount || lembrete.quantidade || 1);
  const unidade = mapaUnidade[lembrete.unit || lembrete.unidade] || 'dia';
  const milissegundos = unidade === 'minuto' ? quantidade * 60 * 1000 : unidade === 'hora' ? quantidade * 60 * 60 * 1000 : quantidade * 24 * 60 * 60 * 1000;
  return new Date(new Date(dataEntrega).getTime() - milissegundos);
}

class ServicoTarefas {
  constructor(repositorio, servicoCalendarios) {
    this.repositorio = repositorio;
    this.servicoCalendarios = servicoCalendarios;
  }

  async listar(usuarioId, filtros) { return this.repositorio.listarTarefas(usuarioId, filtros); }
  async obter(usuarioId, id) { const tarefa = await this.repositorio.buscarTarefa(usuarioId, id); if (!tarefa) { const erro = new Error('Tarefa não encontrada'); erro.statusCode = 404; throw erro; } return tarefa; }

  async criar(usuarioId, dados, opcoes = {}) {
    const tarefa = await this.repositorio.criarTarefa({ usuarioId, titulo: dados.titulo || dados.title || 'Tarefa acadêmica', descricao: dados.descricao || dados.notes || null, materia: dados.materia || dados.subject || null, tipo: mapaTipo[dados.tipo] || mapaTipo[dados.type] || dados.tipo || 'tarefa', dataEntrega: paraDataEntrega(dados), horarioEntrega: dados.dueTime || dados.horarioEntrega || null, duracao: dados.duracao || dados.duration || null, prioridade: mapaPrioridade[dados.prioridade || dados.priority] || 'media' });
    const lembretes = dados.reminders || dados.lembretes || [{ amount: 1, unit: 'day' }];
    await Promise.all(lembretes.map(async (lembrete) => {
      const agendadoPara = calcularAgendamento(tarefa.dataEntrega, lembrete);
      if (agendadoPara <= new Date() && !opcoes.agendarAtrasado) return null;
      const registro = await this.repositorio.criarLembrete({ tarefaId: tarefa.id, usuarioId, agendadoPara, tipo: `${lembrete.amount || lembrete.quantidade || 1}_${lembrete.unit || lembrete.unidade || 'day'}` });
      return filas.lembretes.add('enviar-lembrete', { lembreteId: registro.id }, { delay: Math.max(0, agendadoPara.getTime() - Date.now()) });
    }));
    let calendario = { sincronizado: false, motivo: 'não solicitado' };
    if (opcoes.sincronizarCalendario !== false) {
      try { calendario = await this.servicoCalendarios.criarEventoParaTarefa(usuarioId, tarefa); } catch (erro) { calendario = { sincronizado: false, motivo: erro.message }; }
    }
    return { tarefa, calendario };
  }

  async atualizar(usuarioId, id, dados) { return this.repositorio.atualizarTarefa(usuarioId, id, dados); }
  async excluir(usuarioId, id) { return this.repositorio.excluirTarefa(usuarioId, id); }
  async concluir(usuarioId, id) { return this.repositorio.atualizarTarefa(usuarioId, id, { status: 'concluida' }); }
  async estatisticas(usuarioId) { return this.repositorio.estatisticas(usuarioId); }
}

module.exports = { ServicoTarefas, paraDataEntrega, calcularAgendamento };
