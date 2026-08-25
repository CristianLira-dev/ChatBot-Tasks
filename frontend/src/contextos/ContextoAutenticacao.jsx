import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../servicos/api';

const ContextoAutenticacao = createContext(null);

export function ProvedorAutenticacao({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('assistente_token');
    if (!token) { setCarregando(false); return; }
    api.eu().then((resposta) => setUsuario(resposta.data.usuario)).catch(() => localStorage.removeItem('assistente_token')).finally(() => setCarregando(false));
    const expirada = () => setUsuario(null);
    window.addEventListener('sessao-expirada', expirada);
    return () => window.removeEventListener('sessao-expirada', expirada);
  }, []);

  async function entrar(dados) {
    const resposta = await api.entrar(dados);
    localStorage.setItem('assistente_token', resposta.data.token);
    setUsuario(resposta.data.usuario);
  }

  async function cadastrar(dados) {
    const resposta = await api.cadastrar(dados);
    localStorage.setItem('assistente_token', resposta.data.token);
    setUsuario(resposta.data.usuario);
  }

  function sair() {
    localStorage.removeItem('assistente_token');
    setUsuario(null);
  }

  const valor = useMemo(() => ({ usuario, carregando, autenticado: Boolean(usuario), entrar, cadastrar, sair }), [usuario, carregando]);
  return <ContextoAutenticacao.Provider value={valor}>{children}</ContextoAutenticacao.Provider>;
}

export function useAutenticacao() {
  const contexto = useContext(ContextoAutenticacao);
  if (!contexto) throw new Error('useAutenticacao deve ser usado dentro de ProvedorAutenticacao');
  return contexto;
}
