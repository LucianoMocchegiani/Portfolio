const FICHA_WIRE_PREFIX =
  /^(?:Estoy en la ficha de|Estás respondiendo sobre la ficha)[^\n]*\n+/i;

/** El wire de la ficha no es parte de la pregunta del usuario. */
export function stripFichaWirePrefix(text: string): string {
  return text.replace(FICHA_WIRE_PREFIX, '').trim();
}

/** Saca nombres de tools y disculpas de lookup que el modelo a veces pega en el texto. */
export function stripLeakedToolTalk(text: string): string {
  let out = text.replace(/\bfunctions\.[A-Za-z0-9_.-]+\b/g, '');
  out = out.replace(/\bget_help\b/gi, '');
  out = out.replace(
    /¡?\s*Perd[oó]n!?[^.!?\n]{0,120}?\btopic\b[^.!?\n]{0,120}?[.!?]/gi,
    '',
  );
  out = out.replace(/El topic correcto[^.!?\n]{0,80}[.!?]/gi, '');
  out = out.replace(
    /Consulto la ficha para responder con precisi[oó]n\.?/gi,
    '',
  );
  out = out.replace(/[ \t]{2,}/g, ' ');
  out = out.replace(/\n{3,}/g, '\n\n');
  return out.replace(/^\s+/, '').trimEnd();
}
