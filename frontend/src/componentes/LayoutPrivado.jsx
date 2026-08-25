import { NavLink, Outlet } from 'react-router-dom';
import { useAutenticacao } from '../contextos/ContextoAutenticacao';

const links = [
  { to: '/painel', rotulo: 'Visão geral', icone: '⌂' },
  { to: '/tarefas', rotulo: 'Tarefas', icone: '✓' },
  { to: '/calendario', rotulo: 'Calendário', icone: '◫' },
  { to: '/integracoes', rotulo: 'Integrações', icone: '◎' },
  { to: '/notificacoes', rotulo: 'Notificações', icone: '◔' }
];

export function LayoutPrivado() {
  const { usuario, sair } = useAutenticacao();
  return (
    <div className="aplicacao">
      <aside className="barra-lateral">
        <div className="marca"><span className="marca-simbolo">✦</span><span>nexo</span></div>
        <p className="marca-subtitulo">seu espaço acadêmico</p>
        <nav className="navegacao">
          {links.map((link) => <NavLink key={link.to} to={link.to} className={({ isActive }) => isActive ? 'navegacao-link ativo' : 'navegacao-link'}><span>{link.icone}</span>{link.rotulo}</NavLink>)}
        </nav>
        <div className="barra-lateral-rodape">
          <div className="avatar pequeno">{usuario?.nome?.slice(0, 1).toUpperCase() || 'E'}</div>
          <div className="usuario-resumo"><strong>{usuario?.nome || 'Estudante'}</strong><span>{usuario?.email || 'conta acadêmica'}</span></div>
          <button className="botao-icone" onClick={sair} title="Sair">↪</button>
        </div>
      </aside>
      <main className="conteudo-principal"><Outlet /></main>
    </div>
  );
}
