import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../servicos/api';

export function PaginaTarefas() {
  const [tarefas, setTarefas] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  async function carregar() { setCarregando(true); try { const resposta = await api.tarefas(filtro ? { status: filtro } : undefined); setTarefas(resposta.data.tarefas); } catch (erroApi) { setErro(erroApi.message); } finally { setCarregando(false); } }
  useEffect(() => { carregar(); }, [filtro]);
  async function concluir(id) { try { await api.concluirTarefa(id); setTarefas((lista) => lista.map((tarefa) => tarefa.id === id ? { ...tarefa, status: 'concluida' } : tarefa)); } catch (erroApi) { setErro(erroApi.message); } }
  return <><header className="cabecalho-pagina"><div><p className="etiqueta">Lembraí · sua organização</p><h1>Tarefas</h1><p className="subtitulo">Tudo que você precisa entregar, em um só lugar, com a Lembraí.</p></div><Link className="botao primario" to="/tarefas/nova">+ Nova tarefa</Link></header>{erro && <div className="alerta erro" role="alert">A Lembraí não conseguiu carregar suas tarefas: {erro}</div>}<div className="filtro-barra"><div className="filtros">{[['', 'Todas'], ['pendente', 'Pendentes'], ['concluida', 'Concluídas']].map(([valor, rotulo]) => <button key={valor} className={`filtro ${filtro === valor ? 'ativo' : ''}`} onClick={() => setFiltro(valor)}>{rotulo}</button>)}</div><span className="subtitulo">{tarefas.length} item(ns)</span></div><div className="cartao tabela-rolavel">{carregando ? <div className="estado-vazio">A Lembraí está buscando suas tarefas...</div> : tarefas.length ? <table className="tabela"><thead><tr><th>Atividade</th><th>Tipo</th><th>Entrega</th><th>Status</th><th /></tr></thead><tbody>{tarefas.map((tarefa) => <tr key={tarefa.id}><td><span className="titulo-tabela">{tarefa.titulo}</span><span className="subtitulo-tabela">{tarefa.materia || 'Sem matéria'}</span></td><td><span className={`badge ${tarefa.tipo}`}>{tarefa.tipo}</span></td><td>{new Date(tarefa.dataEntrega).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td><td><span className={`badge ${tarefa.status}`}>{tarefa.status}</span></td><td><div className="acoes">{tarefa.status === 'pendente' && <button className="botao-mini" onClick={() => concluir(tarefa.id)}>Concluir</button>}<Link className="botao-mini" to={`/tarefas/${tarefa.id}`}>Abrir</Link></div></td></tr>)}</tbody></table> : <div className="estado-vazio">Nenhuma tarefa encontrada neste filtro. A Lembraí organiza o próximo passo.</div>}</div></>;
}
