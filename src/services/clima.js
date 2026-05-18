// Busca o clima atual de Criciúma via wttr.in (API pública gratuita, sem chave).
// Fallback silencioso: se a API falhar, retorna null e a UI esconde o widget.

const URL = 'https://wttr.in/Criciuma,SC?format=j1&lang=pt';

export async function obterClimaCriciuma() {
  try {
    const r = await fetch(URL);
    if (!r.ok) return null;
    const data = await r.json();
    const atual = data.current_condition?.[0];
    if (!atual) return null;
    return {
      tempC: Number(atual.temp_C),
      sensacaoC: Number(atual.FeelsLikeC),
      descricao: atual.lang_pt?.[0]?.value || atual.weatherDesc?.[0]?.value || '',
      umidade: Number(atual.humidity),
      icone: mapIcone(atual.weatherCode),
    };
  } catch (e) {
    return null;
  }
}

// Mapeia código WWO pra ícone do Feather Icons.
function mapIcone(code) {
  const n = Number(code);
  if ([113].includes(n)) return 'sun';
  if ([116].includes(n)) return 'cloud';
  if ([119, 122].includes(n)) return 'cloud';
  if ([143, 248, 260].includes(n)) return 'cloud-drizzle';
  if ([176, 263, 266, 281, 284, 293, 296, 299, 302, 305, 308, 311, 314, 317, 350, 353, 356, 359, 362, 365, 368, 374, 377].includes(n)) return 'cloud-rain';
  if ([200, 386, 389, 392, 395].includes(n)) return 'cloud-lightning';
  if ([179, 182, 185, 227, 230, 320, 323, 326, 329, 332, 335, 338, 371].includes(n)) return 'cloud-snow';
  return 'cloud';
}
