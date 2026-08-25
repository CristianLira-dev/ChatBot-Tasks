import { useNavigate } from 'react-router-dom';

export function CartaoIndicador({ classe, icone, numero, rotulo }) {
  return <div className={`cartao indicador ${classe}`}><span className="indicador-icone">{icone}</span><strong className="indicador-numero">{numero}</strong><span className="indicador-label">{rotulo}</span></div>;
}

export function ItemTarefa({ tarefa, compacto = false, onConcluir }) {
  const navegar = useNavigate();
  const data = new Date(tarefa.dataEntrega);
  const atrasada = tarefa.status === 'pendente' && data < new Date();
  return <div className="item-tarefa"><span className={`item-marcador ${tarefa.tipo}`} /><div className="item-tarefa-corpo"><strong>{tarefa.titulo}</strong><span>{tarefa.materia || 'Atividade acadêmica'} {tarefa.horarioEntrega ? `· ${tarefa.horarioEntrega}` : ''}</span></div>{!compacto && <span className={`item-data ${atrasada ? 'atrasada' : ''}`}>{data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>}<div className="acoes">{onConcluir && tarefa.status === 'pendente' && <button className="botao-mini" onClick={() => onConcluir(tarefa.id)}>Concluir</button>}<button className="botao-mini" onClick={() => navegar(`/tarefas/${tarefa.id}`)}>Abrir</button></div></div>;
}
