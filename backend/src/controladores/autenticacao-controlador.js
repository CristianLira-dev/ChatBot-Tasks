const { esquemaCadastro, esquemaEntrada, validar } = require('../validadores/esquemas');
const { gerarHashSenha, compararSenha, emitirToken, removerSegredos } = require('../utilitarios/seguranca');

function criarControladorAutenticacao(repositorio) {
  return {
    cadastrar: async (req, res) => {
      const dados = validar(esquemaCadastro, req.body);
      const existente = await repositorio.buscarUsuarioPorEmail(dados.email);
      if (existente) return res.status(409).json({ erro: 'E-mail já cadastrado' });
      const existentePorTelefone = await repositorio.buscarUsuarioPorTelefone(dados.telefone);
      if (existentePorTelefone) return res.status(409).json({ erro: 'WhatsApp já cadastrado' });
      const usuario = await repositorio.criarUsuario({ ...dados, senhaCriptografada: await gerarHashSenha(dados.senha) });
      return res.status(201).json({ usuario: removerSegredos(usuario), token: emitirToken(usuario) });
    },
    entrar: async (req, res) => {
      const dados = validar(esquemaEntrada, req.body);
      const usuario = await repositorio.buscarUsuarioPorEmail(dados.email);
      const telefoneConfere = usuario && usuario.telefone === dados.telefone;
      if (!usuario || !telefoneConfere || !(await compararSenha(dados.senha, usuario.senhaCriptografada))) return res.status(401).json({ erro: 'E-mail, WhatsApp ou senha inválidos' });
      return res.json({ usuario: removerSegredos(usuario), token: emitirToken(usuario) });
    },
    eu: async (req, res) => {
      const usuario = await repositorio.buscarUsuarioPorId(req.usuario.sub);
      if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });
      return res.json({ usuario: removerSegredos(usuario) });
    }
  };
}

module.exports = { criarControladorAutenticacao };
