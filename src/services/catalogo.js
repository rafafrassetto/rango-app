// Catálogo de pratos: busca do backend, cache no AsyncStorage, fallback local.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from './api';

const KEY = '@rango:catalogo';

// Imagens locais (require estático obrigatório no React Native)
import arrozbranco from '../../assets/arrozbranco2.png';
import feijaopreto from '../../assets/feijaopreto.png';
import macarraoTomate from '../../assets/macarraoTomate.png';

export const IMAGENS = {
  arrozbranco,
  feijaopreto,
  macarraoTomate,
};

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

// Normaliza prato do servidor para o shape usado pelas telas.
function mapServerDish(d) {
  return {
    id: String(d.id),
    nome: d.nome,
    descricao: d.descricao,
    imagemKey: d.imagem_key || 'arrozbranco',
    imagem_url: d.imagem_url || null,
    precoPorKg: Number(d.preco_por_kg),
    pesoMinG: d.peso_min_g,
    pesoMaxG: d.peso_max_g,
    passoG: d.passo_g,
    disponivel: d.disponivel !== false,
    restaurant_id: d.restaurant_id,
  };
}

export const Catalogo = {
  async list() {
    try {
      const lista = await apiRequest('/dishes?disponivel=true');
      const mapped = lista.map(mapServerDish);
      await AsyncStorage.setItem(KEY, JSON.stringify(mapped));
      return mapped;
    } catch (e) {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
      await AsyncStorage.setItem(KEY, JSON.stringify(CATALOGO_DEFAULT));
      return CATALOGO_DEFAULT;
    }
  },

  async listAll() {
    try {
      const lista = await apiRequest('/dishes');
      const mapped = lista.map(mapServerDish);
      await AsyncStorage.setItem(KEY, JSON.stringify(mapped));
      return mapped;
    } catch (e) {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
      return CATALOGO_DEFAULT;
    }
  },

  async get(id) {
    const lista = await this.listAll();
    return lista.find((p) => String(p.id) === String(id)) || null;
  },

  async upsert(prato) {
    try {
      const body = {
        nome: prato.nome,
        descricao: prato.descricao,
        imagem_key: prato.imagemKey,
        imagem_url: prato.imagem_url,
        preco_por_kg: prato.precoPorKg,
        peso_min_g: prato.pesoMinG,
        peso_max_g: prato.pesoMaxG,
        passo_g: prato.passoG,
        disponivel: prato.disponivel,
        restaurant_id: prato.restaurant_id || 1,
      };
      let result;
      const numericId = Number(prato.id);
      if (prato.id && numericId && !isNaN(numericId)) {
        result = await apiRequest(`/dishes/${prato.id}`, { method: 'PUT', body });
      } else {
        result = await apiRequest('/dishes', { method: 'POST', body });
      }
      return mapServerDish(result);
    } catch (e) { /* fallback local */ }

    const lista = await this.listAll();
    const idx = lista.findIndex((p) => p.id === prato.id);
    if (idx >= 0) lista[idx] = { ...lista[idx], ...prato };
    else lista.push(prato);
    await AsyncStorage.setItem(KEY, JSON.stringify(lista));
    return prato;
  },

  async remove(id) {
    try {
      const numericId = Number(id);
      if (numericId && !isNaN(numericId)) {
        await apiRequest(`/dishes/${id}`, { method: 'DELETE' });
      }
    } catch (e) { /* fallback */ }
    const lista = await this.listAll();
    await AsyncStorage.setItem(
      KEY,
      JSON.stringify(lista.filter((p) => String(p.id) !== String(id)))
    );
  },

  async reset() {
    await AsyncStorage.setItem(KEY, JSON.stringify(CATALOGO_DEFAULT));
  },
};

export const PRESETS_FOME = [
  { id: 'pouca',   rotulo: 'Pouca Fome',     descricao: '~300g',  pesoG: 300,  emoji: '🥗' },
  { id: 'normal',  rotulo: 'Fome Normal',    descricao: '~500g',  pesoG: 500,  emoji: '🍽️' },
  { id: 'muita',   rotulo: 'Muita Fome',     descricao: '~800g',  pesoG: 800,  emoji: '🍛' },
  { id: 'familia', rotulo: 'Tamanho Família', descricao: '1.5kg+', pesoG: 1500, emoji: '👨‍👩‍👧' },
];
