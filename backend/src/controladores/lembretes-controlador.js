const { esquemaCriarLembrete, esquemaAtualizarLembrete, validar } = require('../validadores/esquemas');

function criarControladorLembretes(servicoLembretes) {
  return {
    listar: async (req, res) => res.json({ lembretes: await servicoLembretes.listar(req.usuario.sub) }),
    criar: async (req, res) => { const dados = validar(esquemaCriarLembrete, req.body); return res.status(201).json({ lembrete: await servicoLembretes.criar(req.usuario.sub, dados) }); },
    atualizar: async (req, res) => { const dados = validar(esquemaAtualizarLembrete, req.body); const lembrete = await servicoLembretes.atualizar(req.usuario.sub, req.params.id, dados); if (!lembrete) return res.status(404).json({ erro: 'Lembrete não encontrado' }); return res.json({ lembrete }); },
    excluir: async (req, res) => { const removido = await servicoLembretes.excluir(req.usuario.sub, req.params.id); if (!removido) return res.status(404).json({ erro: 'Lembrete não encontrado' }); return res.status(204).send(); }
  };
}

module.exports = { criarControladorLembretes };
