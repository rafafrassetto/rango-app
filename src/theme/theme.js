// Tema central do Rango App
// Paleta inspirada no iFood: vermelho vibrante como primária,
// neutros claros como fundo, hierarquia tipográfica limpa.

export const colors = {
  // Marca
  primary: '#EA1D2C',        // Vermelho iFood
  primaryDark: '#C2101D',    // Vermelho escuro (hover / botão pressionado)
  primaryLight: '#FFE9EB',   // Fundo de chips/badges
  accent: '#F5A623',         // Laranja secundário (promos / destaques)

  // Neutros
  background: '#F7F7F8',     // Fundo geral da tela
  surface: '#FFFFFF',        // Cards e containers
  surfaceAlt: '#FAFAFA',     // Variante sutil
  divider: '#EDEDED',        // Linhas separadoras

  // Texto
  textPrimary: '#1F1F1F',
  textSecondary: '#717171',
  textMuted: '#9A9A9A',
  textInverse: '#FFFFFF',

  // Estados
  success: '#50A773',
  warning: '#F5A623',
  danger: '#D0021B',
  info: '#3D8BFF',

  // Inputs
  inputBg: '#FFFFFF',
  inputBorder: '#E1E1E1',
  inputBorderFocus: '#EA1D2C',
  placeholder: '#B0B0B0',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  pill: 999,
};

export const typography = {
  h1: { fontSize: 26, fontWeight: '700', color: colors.textPrimary },
  h2: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  h3: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  body: { fontSize: 14, color: colors.textPrimary },
  caption: { fontSize: 12, color: colors.textSecondary },
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
};

export default { colors, spacing, radius, typography, shadow };
