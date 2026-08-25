import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAutenticacao } from '../contextos/ContextoAutenticacao';
import { PaginaEntrada } from '../paginas/PaginaEntrada';
import { PaginaCadastro } from '../paginas/PaginaCadastro';
import { PaginaPainel } from '../paginas/PaginaPainel';
import { PaginaTarefas } from '../paginas/PaginaTarefas';
import { PaginaNovaTarefa } from '../paginas/PaginaNovaTarefa';
import { PaginaDetalheTarefa } from '../paginas/PaginaDetalheTarefa';
import { PaginaCalendario } from '../paginas/PaginaCalendario';
import { PaginaIntegracoes } from '../paginas/PaginaIntegracoes';
import { PaginaNotificacoes } from '../paginas/PaginaNotificacoes';
import { LayoutPrivado } from '../componentes/LayoutPrivado';

function RotaPrivada() {
  const { autenticado, carregando } = useAutenticacao();
  if (carregando) return <div className="tela-carregando">Carregando seu espaço...</div>;
  return autenticado ? <Outlet /> : <Navigate to="/entrar" replace />;
}

function RotaPublica({ children }) {
  const { autenticado, carregando } = useAutenticacao();
  if (carregando) return <div className="tela-carregando">Carregando...</div>;
  return autenticado ? <Navigate to="/painel" replace /> : children;
}

export function RotasAplicacao() {
  return (
    <Routes>
      <Route path="/entrar" element={<RotaPublica><PaginaEntrada /></RotaPublica>} />
      <Route path="/cadastro" element={<RotaPublica><PaginaCadastro /></RotaPublica>} />
      <Route element={<RotaPrivada />}>
        <Route element={<LayoutPrivado />}>
          <Route path="/painel" element={<PaginaPainel />} />
          <Route path="/tarefas" element={<PaginaTarefas />} />
          <Route path="/tarefas/nova" element={<PaginaNovaTarefa />} />
          <Route path="/tarefas/:id" element={<PaginaDetalheTarefa />} />
          <Route path="/calendario" element={<PaginaCalendario />} />
          <Route path="/integracoes" element={<PaginaIntegracoes />} />
          <Route path="/notificacoes" element={<PaginaNotificacoes />} />
          <Route path="/" element={<Navigate to="/painel" replace />} />
          <Route path="*" element={<Navigate to="/painel" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
