// Catálogo de pratos do Rango App.
// Cada prato tem regras de peso (mínimo, máximo, passo) e preço por kg.
// Esses dados ficam no AsyncStorage para que o painel do restaurante
// possa cadastrar e editar pratos sem precisar de recompilar o app.

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@rango:catalogo';

// Imagens locais que já existem nos assets
import arrozbranco from '../../assets/arrozbranco2.png';
import feijaopreto from '../../assets/feijaopreto.png';
import macarraoTomate from '../../assets/macarraoTomate.png';

// Mapa de imagens (precisa ser estático porque o RN não aceita require dinâmico)
export const IMAGENS = {
  arrozbranco,
  feijaopreto,
  macarraoTomate,
};

// Catálogo padrão. Usado na primeira execução, antes do restaurante editar.
export const CATALOGO_DEFAULT = [
  {
    id: 'arroz-branco',
    nome: 'Arroz Branco',
    descricao: 'Arroz branco tradicional, soltinho, no ponto certo.',
    imagemKey: 'arrozbranco',
    precoPorKg: 79.9,
    pesoMinG: 100,
    pesoMaxG: 2000,
    passoG: 50,
    disponivel: true,
  },
  {
    id: 'feijao-preto',
    nome: 'Feijão Preto',
    descricao: 'Feijão preto temperado na medida, caldo encorpado.',
    imagemKey: 'feijaopreto',
    precoPorKg: 89.9,
    pesoMinG: 100,
    pesoMaxG: 2000,
    passoG: 50,
    disponivel: true,
  },
  {
    id: 'macarrao',
    nome: 'Macarrão ao Sugo',
    descricao: 'Macarrão fresco com molho de tomate caseiro e manjericão.',
    imagemKey: 'macarraoTomate',
    precoPorKg: 99.9,
    pesoMinG: 150,
    pesoMaxG: 2500,
    passoG: 50,
    disponivel: true,
  },
];

export const Catalogo = {
  async list() {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
      // semeia o catálogo padrão na primeira vez
      await AsyncStorage.setItem(KEY, JSON.stringify(CATALOGO_DEFAULT));
      return CATALOGO_DEFAULT;
    } catch (e) {
      return CATALOGO_DEFAULT;
    }
  },

  async get(id) {
    const lista = await this.list();
    return lista.find((p) => p.id === id);
  },

  async upsert(prato) {
    const lista = await this.list();
    const idx = lista.findIndex((p) => p.id === prato.id);
    if (idx >= 0) lista[idx] = { ...lista[idx], ...prato };
    else lista.push(prato);
    await AsyncStorage.setItem(KEY, JSON.stringify(lista));
    return prato;
  },

  async remove(id) {
    const lista = await this.list();
    const nova = lista.filter((p) => p.id !== id);
    await AsyncStorage.setItem(KEY, JSON.stringify(nova));
  },

  async reset() {
    await AsyncStorage.setItem(KEY, JSON.stringify(CATALOGO_DEFAULT));
  },
};

// Presets de fome para escolha rápida do cliente.
// A tela aplica o valor respeitando o mín/máx do prato.
export const PRESETS_FOME = [
  { id: 'pouca',   rotulo: 'Pouca Fome',     descricao: '~300g',  pesoG: 300,  emoji: '🥗' },
  { id: 'normal',  rotulo: 'Fome Normal',    descricao: '~500g',  pesoG: 500,  emoji: '🍽️' },
  { id: 'muita',   rotulo: 'Muita Fome',     descricao: '~800g',  pesoG: 800,  emoji: '🍛' },
  { id: 'familia', rotulo: 'Tamanho Família', descricao: '1.5kg+', pesoG: 1500, emoji: '👨‍👩‍👧' },
];
