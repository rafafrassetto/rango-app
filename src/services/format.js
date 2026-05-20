export function formatBRL(valor) {
  const n = Number(valor || 0);
  return 'R$ ' + n.toFixed(2).replace('.', ',');
}

export function formatPeso(g) {
  if (g >= 1000) return `${(g / 1000).toFixed(g % 1000 === 0 ? 0 : 2).replace('.', ',')} kg`;
  return `${g} g`;
}
