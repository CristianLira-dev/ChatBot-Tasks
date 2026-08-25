export function RotuloCampo({ htmlFor, children, obrigatorio = false }) {
  return <label htmlFor={htmlFor}><span className="campo-label-conteudo">{children}{obrigatorio && <span className="indicador-obrigatorio" aria-hidden="true">*</span>}</span>{obrigatorio && <span className="texto-acessibilidade"> obrigatório</span>}</label>;
}
