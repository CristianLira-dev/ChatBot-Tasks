const { esquemaCriarTarefa, esquemaAtualizarTarefa, validar } = require('../validadores/esquemas');

function criarControladorTarefas(servicoTarefas) {
  return {
    listar: async (req, res) => res.json({ tarefas: await servicoTarefas.listar(req.usuario.sub, { status: req.query.status, periodo: req.query.periodo }) }),
    obter: async (req, res) => res.json({ tarefa: await servicoTarefas.obter(req.usuario.sub, req.params.id) }),
    criar: async (req, res) => { const dados = validar(esquemaCriarTarefa, req.body); const resultado = await servicoTarefas.criar(req.usuario.sub, dados); return res.status(201).json(resultado); },
    atualizar: async (req, res) => { const dados = validar(esquemaAtualizarTarefa, req.body); const tarefa = await servicoTarefas.atualizar(req.usuario.sub, req.params.id, dados); if (!tarefa) return res.status(404).json({ erro: 'Tarefa não encontrada' }); return res.json({ tarefa }); },
    excluir: async (req, res) => { const removida = await servicoTarefas.excluir(req.usuario.sub, req.params.id); if (!removida) return res.status(404).json({ erro: 'Tarefa não encontrada' }); return res.status(204).send(); },
    concluir: async (req, res) => { const tarefa = await servicoTarefas.concluir(req.usuario.sub, req.params.id); if (!tarefa) return res.status(404).json({ erro: 'Tarefa não encontrada' }); return res.json({ tarefa }); }
  };
}

module.exports = { criarControladorTarefas };
