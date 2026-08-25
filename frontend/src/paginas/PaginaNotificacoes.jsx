import { useEffect, useState } from 'react';
import { api } from '../servicos/api';

export function PaginaNotificacoes() {
  const [lembretes, setLembretes] = useState([]);
  const [erro, setErro] = useState('');
  async function carregar() { try { const resposta = await api.lembretes(); setLembretes(resposta.data.lembretes); } catch (erroApi) { setErro(erroApi.message); } }
  useEffect(() => { carregar(); }, []);
  async function remover(id) { try { await api.excluirLembrete(id); setLembretes((lista) => lista.filter((item) => item.id !== id)); } catch (erroApi) { setErro(erroApi.message); } }
  return <><header className="cabecalho-pagina"><div><p className="etiqueta">Um pequeno empurrão na hora certa</p><h1>Notificações</h1><p className="subtitulo">Seus lembretes ficam aqui para você não precisar guardar tudo na cabeça.</p></div></header>{erro && <div className="alerta erro">{erro}</div>}<div className="cartao painel"><div className="painel-cabecalho"><div><p className="etiqueta">Fila de lembretes</p><h2>{lembretes.length} agendado(s)</h2></div></div><div className="lista">{lembretes.length ? lembretes.map((lembrete) => <div className="item-tarefa" key={lembrete.id}><span className="item-marcador trabalho" /><div className="item-tarefa-corpo"><strong>{lembrete.tarefa?.titulo || 'Lembrete acadêmico'}</strong><span>{lembrete.tipo} · {lembrete.status}</span></div><span className="item-data">{new Date(lembrete.agendadoPara).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span><button className="botao-mini" onClick={() => remover(lembrete.id)}>Remover</button></div>) : <div className="estado-vazio">Quando você criar uma tarefa, os lembretes aparecerão aqui.</div>}</div></div></>;
}
