// Autenticação do restaurante: API-primary, AsyncStorage como fallback.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from './api';

const KEY_LISTA = '@rango:restaurantes';
const KEY_SESSAO = '@rango:restaurante-sessao';

const DEMO = {
  id: 'demo',
  nome: 'Caçarola Restaurante',
  email: 'restaurante@rango.app',
  telefone: '(48) 0000-0000',
  cnpj: '00.000.000/0001-00',
  senha: '123456',
};

async function readList() {
  try {
    const raw = await AsyncStorage.getItem(KEY_LISTA);
    if (raw) return JSON.parse(raw);
    await AsyncStorage.setItem(KEY_LISTA, JSON.stringify([DEMO]));
    return [DEMO];
  } catch (e) {
    return [DEMO];
  }
}

async function writeList(list) {
  await AsyncStorage.setItem(KEY_LISTA, JSON.stringify(list));
}

export const RestauranteAuth = {
  async list() {
    return readList();
  },

  async register({ nome, email, telefone, cnpj, senha }) {
    try {
      const novo = await apiRequest('/restaurants', {
        method: 'POST',
        body: { nome, email, telefone, cnpj, senha },
      });
      const list = await readList();
      list.push(novo);
      await writeList(list);
      return novo;
    } catch (e) { /* fallback local */ }
    const list = await readList();
    const novo = {
      id: Date.now().toString(),
      nome, email, telefone, cnpj, senha,
    };
    list.push(novo);
    await writeList(list);
    return novo;
  },

  async login(email, senha) {
    try {
      const r = await apiRequest('/restaurants/login', {
        method: 'POST',
        body: { email, senha },
      });
      return r;
    } catch (e) { /* fallback local */ }
    const list = await readList();
    return list.find((r) => r.email === email && r.senha === senha) || null;
  },

  async getSession() {
    try {
      const raw = await AsyncStorage.getItem(KEY_SESSAO);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  async setSession(restaurante) {
    await AsyncStorage.setItem(KEY_SESSAO, JSON.stringify(restaurante));
  },

  async clearSession() {
    await AsyncStorage.removeItem(KEY_SESSAO);
  },

  async update(id, dados) {
    try {
      const atualizado = await apiRequest(`/restaurants/${id}`, {
        method: 'PUT',
        body: dados,
      });
      const sess = await this.getSession();
      if (sess && String(sess.id) === String(id)) await this.setSession(atualizado);
      return atualizado;
    } catch (e) { /* fallback local */ }

    const list = await readList();
    const idx = list.findIndex((r) => r.id === id);
    if (idx < 0) return null;
    const atualizado = { ...list[idx], ...dados };
    list[idx] = atualizado;
    await writeList(list);
    const sess = await this.getSession();
    if (sess && sess.id === id) await this.setSession(atualizado);
    return atualizado;
  },
};
