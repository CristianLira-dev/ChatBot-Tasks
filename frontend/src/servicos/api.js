import axios from 'axios';

const clienteApi = axios.create({
  baseURL: import.meta.env.VITE_URL_API || 'http://localhost:3000/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

clienteApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('assistente_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

clienteApi.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    if (erro.response?.status === 401) {
      localStorage.removeItem('assistente_token');
      window.dispatchEvent(new Event('sessao-expirada'));
    }
    const mensagem = erro.response?.data?.erro || 'Não foi possível concluir a operação.';
    return Promise.reject(new Error(mensagem));
  }
);

export const api = {
  entrar: (dados) => clienteApi.post('/autenticacao/entrar', dados),
  cadastrar: (dados) => clienteApi.post('/autenticacao/cadastro', dados),
  eu: () => clienteApi.get('/autenticacao/eu'),
  resumo: () => clienteApi.get('/painel/resumo'),
  tarefas: (params) => clienteApi.get('/tarefas', { params }),
  tarefa: (id) => clienteApi.get(`/tarefas/${id}`),
  criarTarefa: (dados) => clienteApi.post('/tarefas', dados),
  atualizarTarefa: (id, dados) => clienteApi.patch(`/tarefas/${id}`, dados),
  excluirTarefa: (id) => clienteApi.delete(`/tarefas/${id}`),
  concluirTarefa: (id) => clienteApi.post(`/tarefas/${id}/concluir`),
  lembretes: () => clienteApi.get('/lembretes'),
  criarLembrete: (dados) => clienteApi.post('/lembretes', dados),
  atualizarLembrete: (id, dados) => clienteApi.patch(`/lembretes/${id}`, dados),
  excluirLembrete: (id) => clienteApi.delete(`/lembretes/${id}`),
  conversas: () => clienteApi.get('/conversas'),
  mensagens: (id) => clienteApi.get(`/conversas/${id}/mensagens`),
  conexoesCalendario: () => clienteApi.get('/calendarios/conexoes'),
  conectarCalendario: (provedor) => clienteApi.get(`/calendarios/${provedor}/conectar`),
  desconectarCalendario: (provedor) => clienteApi.delete(`/calendarios/${provedor}/desconectar`),
  sincronizarCalendario: (provedor) => clienteApi.post(`/calendarios/${provedor}/sincronizar`)
};

export default clienteApi;
