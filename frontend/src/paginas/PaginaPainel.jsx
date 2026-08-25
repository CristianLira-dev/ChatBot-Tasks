import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../servicos/api';
import { useAutenticacao } from '../contextos/ContextoAutenticacao';
import { CartaoIndicador, ItemTarefa } from '../componentes/ComponentesPainel';

export function PaginaPainel() {
  const { usuario } = useAutenticacao();
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');
  useEffect(() => { api.resumo().then((resposta) => setDados(resposta.data)).catch((erroApi) => setErro(erroApi.message)); }, []);
  const estatisticas = dados?.estatisticas || { total: 0, pendentes: 0, concluidas: 0, atrasadas: 0, provas: [] };
  const tarefas = dados?.proximasTarefas || [];
  const conclusao = estatisticas.total ? Math.round((estatisticas.concluidas / estatisticas.total) * 100) : 0;
  return <><header className="cabecalho-pagina"><div><p className="etiqueta">Lembraí · {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p><h1>Bom dia, {usuario?.nome?.split(' ')[0] || 'estudante'}.</h1><p className="subtitulo">A Lembraí deixa o que importa no lugar certo.</p></div><Link className="botao primario" to="/tarefas/nova">+ Nova tarefa</Link></header>{erro && <div className="alerta erro" role="alert">A Lembraí não conseguiu carregar seu resumo: {erro}</div>}<section className="grade-indicadores"><CartaoIndicador classe="ciano" icone="◷" numero={estatisticas.pendentes} rotulo="Tarefas pendentes" /><CartaoIndicador classe="lilas" icone="✦" numero={estatisticas.provas.length} rotulo="Próximas provas" /><CartaoIndicador classe="amarelo" icone="↗" numero={estatisticas.atrasadas} rotulo="Em atraso" /><CartaoIndicador classe="rosa" icone="✓" numero={`${conclusao}%`} rotulo="Do semestre concluído" /></section><section className="grade-conteudo"><div className="cartao painel"><div className="painel-cabecalho"><div><p className="etiqueta">Acompanhe de perto</p><h2>Próximos prazos</h2></div><Link className="link-texto" to="/tarefas">Ver todas →</Link></div><div className="lista">{tarefas.length ? tarefas.slice(0, 6).map((tarefa) => <ItemTarefa key={tarefa.id} tarefa={tarefa} compacto />) : <div className="estado-vazio">Tudo tranquilo por aqui. Crie sua primeira tarefa e deixe a Lembraí cuidar do lembrete.</div>}</div></div><div className="cartao painel painel-agenda"><p className="etiqueta">Seu ritmo</p><h2>O semestre está andando.</h2><p className="subtitulo">Cada tarefa concluída abre espaço para a próxima.</p><div className="progresso"><div className="progresso-legenda"><span>Progresso geral</span><strong>{conclusao}%</strong></div><div className="barra-progresso"><span style={{ width: `${conclusao}%` }} /></div></div><div className="mini-agenda"><p className="etiqueta">Próximas provas</p>{estatisticas.provas.length ? estatisticas.provas.slice(0, 3).map((prova) => <div className="mini-agenda-item" key={prova.id}><span className="hora">{new Date(prova.dataEntrega).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span><span>{prova.titulo}</span></div>) : <span className="subtitulo">Nenhuma prova cadastrada.</span>}</div></div></section></>;
}
