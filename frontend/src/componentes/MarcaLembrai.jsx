export function MarcaLembrai({ variante = 'app', compact = false }) {
  const classe = variante === 'landing' ? `landing-logo${compact ? ' compact' : ''}` : 'marca';
  const classeSimbolo = variante === 'landing' ? 'landing-logo-mark' : 'marca-simbolo';
  return <span className={classe}><span className={classeSimbolo}>✦</span><span>Lembraí</span></span>;
}
