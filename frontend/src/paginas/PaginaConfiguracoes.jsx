import { useState } from 'react';

export function PaginaConfiguracoes() {
  const [salvo, setSalvo] = useState(false);
  const [notificacoes, setNotificacoes] = useState(true);
  const [antecedencia, setAntecedencia] = useState('1 dia antes');

  function salvar(evento) {
    evento.preventDefault();
    setSalvo(true);
    window.setTimeout(() => setSalvo(false), 2400);
  }

  return <div className="pagina-configuracoes">
    <div className="cabecalho-pagina">
      <div><p className="etiqueta">Preferências</p><h1>Configurações</h1><p className="subtitulo">Ajuste como a Lembraí acompanha sua rotina acadêmica.</p></div>
    </div>
    {salvo && <div className="alerta sucesso" role="status">Preferências salvas nesta sessão.</div>}
    <div className="configuracoes-grid">
      <form className="cartao painel formulario-configuracoes" onSubmit={salvar}>
        <div className="painel-cabecalho"><div><p className="etiqueta">Lembretes</p><h2>Como a Lembraí avisa você</h2></div></div>
        <label className="configuracao-linha"><span><strong>Receber lembretes</strong><small>Ativar avisos antes dos seus prazos.</small></span><input className="interruptor" type="checkbox" checked={notificacoes} onChange={(evento) => setNotificacoes(evento.target.checked)} /></label>
        <div className="campo"><label htmlFor="antecedencia">Antecedência padrão</label><select id="antecedencia" value={antecedencia} onChange={(evento) => setAntecedencia(evento.target.value)}><option>1 dia antes</option><option>2 dias antes</option><option>1 hora antes</option></select></div>
        <div className="acoes-formulario"><button className="botao primario" type="submit">Salvar preferências</button></div>
      </form>
      <section className="cartao painel conta-configuracoes"><div className="painel-cabecalho"><div><p className="etiqueta">Sua conta</p><h2>Privacidade e dados</h2></div></div><p>A Lembraí usa suas preferências para organizar tarefas, calendários e lembretes. Você pode desconectar integrações a qualquer momento.</p><div className="status-conta"><span className="ponto-status conectado" /> Conta protegida por autenticação</div><button className="botao secundario" type="button" onClick={() => alert('A exportação de dados estará disponível em breve.')}>Exportar meus dados</button></section>
    </div>
  </div>;
}
