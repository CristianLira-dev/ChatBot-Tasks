import { useEffect, useMemo, useState } from 'react';
import { api } from '../servicos/api';
import { ItemTarefa } from '../componentes/ComponentesPainel';

function gerarDias(mes) { const inicio = new Date(mes.getFullYear(), mes.getMonth(), 1); const quantidade = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate(); const deslocamento = (inicio.getDay() + 6) % 7; return [...Array(deslocamento).fill(null), ...Array.from({ length: quantidade }, (_, indice) => new Date(mes.getFullYear(), mes.getMonth(), indice + 1))]; }

export function PaginaCalendario() {
  const [mes, setMes] = useState(new Date());
  const [tarefas, setTarefas] = useState([]);
  useEffect(() => { api.tarefas().then((resposta) => setTarefas(resposta.data.tarefas)).catch(() => {}); }, []);
  const dias = useMemo(() => gerarDias(mes), [mes]);
  const tarefasDoDia = (dia) => tarefas.filter((tarefa) => { const data = new Date(tarefa.dataEntrega); return dia && data.toDateString() === dia.toDateString(); });
  return <><header className="cabecalho-pagina"><div><p className="etiqueta">Uma visão mais ampla</p><h1>Calendário</h1><p className="subtitulo">Veja como seus compromissos se distribuem ao longo do mês.</p></div></header><div className="calendario-grid"><div className="cartao calendario-mes"><div className="calendario-cabecalho"><strong>{mes.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</strong><div className="calendario-navegacao"><button onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() - 1, 1))}>←</button><button onClick={() => setMes(new Date())}>Hoje</button><button onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() + 1, 1))}>→</button></div></div><div className="calendario-semana">{['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'].map((dia) => <span key={dia}>{dia}</span>)}</div><div className="calendario-dias">{dias.map((dia, indice) => { const lista = tarefasDoDia(dia); const hoje = dia?.toDateString() === new Date().toDateString(); return <div className={`dia ${!dia ? 'vazio' : ''} ${hoje ? 'hoje' : ''}`} key={indice}>{dia && <><span className="dia-numero">{dia.getDate()}</span>{lista.slice(0, 3).map((tarefa) => <span className="ponto-evento" key={tarefa.id} title={tarefa.titulo} />)}</>}</div>; })}</div></div><div className="cartao painel-lateral"><p className="etiqueta">Neste mês</p><h2>{tarefas.length} compromissos</h2><div className="lista">{tarefas.filter((tarefa) => new Date(tarefa.dataEntrega).getMonth() === mes.getMonth() && new Date(tarefa.dataEntrega).getFullYear() === mes.getFullYear()).slice(0, 5).map((tarefa) => <ItemTarefa key={tarefa.id} tarefa={tarefa} compacto />)}{!tarefas.length && <div className="estado-vazio">Nenhuma tarefa neste mês.</div>}</div></div></div></>;
}
