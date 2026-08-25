import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAutenticacao } from '../contextos/ContextoAutenticacao';
import { IconeWhatsApp } from '../componentes/IconeWhatsApp';
import { MarcaLembrai } from '../componentes/MarcaLembrai';
import { RotuloCampo } from '../componentes/RotuloCampo';

export function PaginaEntrada() {
  const { entrar } = useAutenticacao();
  const navegar = useNavigate();
  const [dados, setDados] = useState({ email: '', telefone: '', senha: '' });
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

    setEnviando(true);
    try {
      await entrar(dados);
      navegar('/painel');
    } catch (erroApi) {
      setErro(erroApi.message);
    } finally {
      setEnviando(false);
    }
  }

  return <div className="tela-autenticacao"><div className="autenticacao-apresentacao"><MarcaLembrai /><h1>Seu semestre,<br /><em>no eixo.</em></h1><p>Um espaço simples para transformar mensagens, prazos e provas em clareza. Fale com a Lembraí. Ela organiza o resto.</p><span className="mantra">Você fala. A Lembraí organiza.</span></div><div className="autenticacao-forma"><div className="caixa-autenticacao"><p className="etiqueta">Bem-vindo de volta</p><h2>Entre no seu espaço</h2><p className="subtitulo">Acompanhe tudo o que importa na sua vida acadêmica com a Lembraí.</p>{erro && <div className="alerta erro" role="alert">{erro}</div>}<form onSubmit={enviar}><div className="campo"><RotuloCampo htmlFor="email" obrigatorio>E-mail</RotuloCampo><input id="email" name="email" type="email" value={dados.email} onChange={alterar} required autoComplete="email" placeholder="voce@universidade.com" /></div><div className="campo"><RotuloCampo htmlFor="telefone" obrigatorio><span className="icone-whatsapp"><IconeWhatsApp tamanho={16} /></span>WhatsApp</RotuloCampo><input id="telefone" name="telefone" type="tel" inputMode="tel" autoComplete="tel" value={dados.telefone} onChange={alterar} required aria-required="true" placeholder="(11) 99999-9999" /></div><div className="campo"><RotuloCampo htmlFor="senha" obrigatorio>Senha</RotuloCampo><input id="senha" name="senha" type="password" value={dados.senha} onChange={alterar} required autoComplete="current-password" minLength="8" placeholder="Sua senha" /></div><button className="botao primario" disabled={enviando} type="submit">{enviando ? 'Entrando...' : 'Entrar na Lembraí →'}</button></form><p className="link-autenticacao">Ainda não tem uma conta? <Link to="/cadastro">Criar meu espaço</Link></p></div></div></div>;
}
