const { verificarToken } = require('../utilitarios/seguranca');
const ambiente = require('../configuracao/ambiente');

function autenticar(req, res, proximo) {
  const cabecalho = req.headers.authorization || '';
  const token = cabecalho.startsWith('Bearer ') ? cabecalho.slice(7) : null;
  if (!token) return res.status(401).json({ erro: 'Autenticação necessária' });
  try {
    req.usuario = verificarToken(token);
    return proximo();
  } catch (erro) {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
}

function validarSegredoWebhook(req, res, proximo) {
  const token = req.headers['x-webhook-secret'] || req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (ambiente.ambiente === 'desenvolvimento' && !process.env.EVOLUTION_WEBHOOK_SEGREDO) return proximo();
  if (!token || token !== ambiente.evolutionWebhookSegredo) return res.status(401).json({ erro: 'Webhook não autorizado' });
  return proximo();
}

function tratarErros(erro, req, res, proximo) {
  req.log?.error({ erro: erro.message, pilha: erro.stack }, 'erro na API');
  const status = erro.statusCode || 500;
  return res.status(status).json({ erro: status >= 500 ? 'Erro interno do servidor' : erro.message, ...(erro.detalhes ? { detalhes: erro.detalhes } : {}) });
}

module.exports = { autenticar, validarSegredoWebhook, tratarErros };
