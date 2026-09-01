const URL_API = (import.meta.env.VITE_URL_API || 'http://localhost:3000/api').replace(/\/$/, '');

function criarUrl(caminho, params) {
  const url = new URL(`${URL_API}${caminho}`);

  if (params) {
    Object.entries(params).forEach(([chave, valor]) => {
      if (valor !== undefined && valor !== null && valor !== '') {
        url.searchParams.set(chave, String(valor));
      }
    });
  }

  return url.toString();
}

async function requisitar(caminho, { metodo = 'GET', dados, params } = {}) {
  const cabecalhos = {
    Accept: 'application/json'
  };

  const token = localStorage.getItem('assistente_token');
  if (token) {
    cabecalhos.Authorization = `Bearer ${token}`;
  }

  const opcoes = {
    method: metodo,
    headers: cabecalhos
  };

  if (dados !== undefined) {
    cabecalhos['Content-Type'] = 'application/json';
    opcoes.body = JSON.stringify(dados);
  }

  let resposta;

  try {
    resposta = await fetch(criarUrl(caminho, params), opcoes);
  } catch {
    throw new Error('Não foi possível conectar ao servidor. Tente novamente em instantes.');
  }

  const tipoConteudo = resposta.headers.get('content-type') || '';
  const corpo = tipoConteudo.includes('application/json')
    ? await resposta.json().catch(() => ({}))
    : await resposta.text().catch(() => '');

  if (!resposta.ok) {
    if (resposta.status === 401 && token) {
      localStorage.removeItem('assistente_token');
      window.dispatchEvent(new Event('sessao-expirada'));
    }

    const mensagem = corpo?.erro || 'Não foi possível concluir a operação.';
    throw new Error(mensagem);
  }

  return { data: corpo };
}

export const api = {
  entrar: (dados) => requisitar('/autenticacao/entrar', { metodo: 'POST', dados }),
  cadastrar: (dados) => requisitar('/autenticacao/cadastro', { metodo: 'POST', dados }),
  eu: () => requisitar('/autenticacao/eu'),
  resumo: () => requisitar('/painel/resumo'),
  tarefas: (params) => requisitar('/tarefas', { params }),
  tarefa: (id) => requisitar(`/tarefas/${id}`),
  criarTarefa: (dados) => requisitar('/tarefas', { metodo: 'POST', dados }),
  atualizarTarefa: (id, dados) => requisitar(`/tarefas/${id}`, { metodo: 'PATCH', dados }),
  excluirTarefa: (id) => requisitar(`/tarefas/${id}`, { metodo: 'DELETE' }),
  concluirTarefa: (id) => requisitar(`/tarefas/${id}/concluir`, { metodo: 'POST' }),
  lembretes: () => requisitar('/lembretes'),
  criarLembrete: (dados) => requisitar('/lembretes', { metodo: 'POST', dados }),
  atualizarLembrete: (id, dados) => requisitar(`/lembretes/${id}`, { metodo: 'PATCH', dados }),
  excluirLembrete: (id) => requisitar(`/lembretes/${id}`, { metodo: 'DELETE' }),
  conversas: () => requisitar('/conversas'),
  mensagens: (id) => requisitar(`/conversas/${id}/mensagens`),
  conexoesCalendario: () => requisitar('/calendarios/conexoes'),
  conectarCalendario: (provedor) => requisitar(`/calendarios/${provedor}/conectar`),
  desconectarCalendario: (provedor) => requisitar(`/calendarios/${provedor}/desconectar`, { metodo: 'DELETE' }),
  sincronizarCalendario: (provedor) => requisitar(`/calendarios/${provedor}/sincronizar`, { metodo: 'POST' })
};

export default api;
