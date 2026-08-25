function criarControladorPainel({ repositorio, servicoCalendarios }) {
  return {
    resumo: async (req, res) => res.json({ estatisticas: await repositorio.estatisticas(req.usuario.sub), tarefasHoje: await repositorio.listarTarefas(req.usuario.sub, { periodo: 'hoje' }), proximasTarefas: await repositorio.listarTarefas(req.usuario.sub, { status: 'pendente' }) }),
    conversas: async (req, res) => res.json({ conversas: await repositorio.listarConversas(req.usuario.sub) }),
    mensagens: async (req, res) => { const mensagens = await repositorio.listarMensagens(req.usuario.sub, req.params.id); if (!mensagens) return res.status(404).json({ erro: 'Conversa não encontrada' }); return res.json({ mensagens }); },
    conexoesCalendario: async (req, res) => res.json({ conexoes: await servicoCalendarios.listarConexoes(req.usuario.sub) }),
    conectarCalendario: async (req, res) => { const resultado = servicoCalendarios.iniciarOAuth(req.usuario.sub, req.params.provedor); if (!resultado.url) return res.json({ disponivel: false, mensagem: 'Configure as credenciais OAuth deste provedor no backend.' }); return res.json(resultado); },
    retornoCalendario: async (req, res) => { await servicoCalendarios.concluirOAuth(req.query.code, req.query.state); return res.redirect(`${process.env.URL_FRONTEND || 'http://localhost:5173'}/integracoes?conectado=${req.params.provedor}`); },
    desconectarCalendario: async (req, res) => { const ok = await servicoCalendarios.desconectar(req.usuario.sub, req.params.provedor); if (!ok) return res.status(404).json({ erro: 'Conexão não encontrada' }); return res.status(204).send(); },
    sincronizarCalendario: async (req, res) => res.json({ resultado: await servicoCalendarios.sincronizar(req.usuario.sub, req.params.provedor) })
  };
}

module.exports = { criarControladorPainel };
