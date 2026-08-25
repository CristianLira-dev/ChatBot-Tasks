import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAutenticacao } from '../contextos/ContextoAutenticacao';
import { IconeWhatsApp } from '../componentes/IconeWhatsApp';
import { MarcaLembrai } from '../componentes/MarcaLembrai';

export function PaginaCadastro() {
  const { cadastrar } = useAutenticacao();
  const navegar = useNavigate();
  const [dados, setDados] = useState({ nome: '', email: '', telefone: '', senha: '' });
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const alterar = (evento) => setDados({ ...dados, [evento.target.name]: evento.target.value });

  async function enviar(evento) {
    evento.preventDefault();
    setErro('');
    const telefoneNormalizado = dados.telefone.replace(/\D/g, '');

    if (telefoneNormalizado.length < 8 || telefoneNormalizado.length > 15) {
      setErro('Informe um número de WhatsApp válido.');
      return;
    }
    if (dados.senha.length < 8) {
      setErro('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    setEnviando(true);
    try {
      await cadastrar(dados);
      navegar('/painel');
    } catch (erroApi) {
      setErro(erroApi.message);
    } finally {
      setEnviando(false);
    }
  }

  return <div className="tela-autenticacao"><div className="autenticacao-apresentacao"><MarcaLembrai /><h1>Menos<br /><em>correria.</em></h1><p>Seu assistente acadêmico vive no WhatsApp e no seu painel. Crie sua conta e comece a tirar as tarefas da cabeça com a Lembraí.</p><span className="mantra">Clareza para o que vem depois.</span></div><div className="autenticacao-forma"><div className="caixa-autenticacao"><p className="etiqueta">Comece por aqui</p><h2>Crie seu espaço</h2><p className="subtitulo">Uma conta para suas tarefas, calendários e lembretes na Lembraí.</p>{erro && <div className="alerta erro" role="alert">{erro}</div>}<form onSubmit={enviar}><div className="campo"><label htmlFor="nome">Como podemos chamar você?</label><input id="nome" name="nome" value={dados.nome} onChange={alterar} required minLength="2" placeholder="Seu nome" /></div><div className="campo"><label htmlFor="email">E-mail</label><input id="email" name="email" type="email" value={dados.email} onChange={alterar} required placeholder="voce@universidade.com" /></div><div className="campo"><label htmlFor="telefone"><span className="campo-label-conteudo"><span className="icone-whatsapp"><IconeWhatsApp tamanho={16} /></span>WhatsApp <span className="indicador-obrigatorio" aria-hidden="true">*</span></span><span className="texto-acessibilidade"> obrigatório</span></label><input id="telefone" name="telefone" type="tel" inputMode="tel" autoComplete="tel" value={dados.telefone} onChange={alterar} required aria-required="true" placeholder="(11) 99999-9999" /></div><div className="campo"><label htmlFor="senha">Crie uma senha</label><input id="senha" name="senha" type="password" value={dados.senha} onChange={alterar} required minLength="8" autoComplete="new-password" placeholder="No mínimo 8 caracteres" /></div><button className="botao primario" disabled={enviando} type="submit">{enviando ? 'Criando...' : 'Criar meu espaço →'}</button></form><p className="link-autenticacao">Já tem uma conta? <Link to="/entrar">Entrar</Link></p></div></div></div>;
}
