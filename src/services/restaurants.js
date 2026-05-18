import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from './api';

const KEY = '@rango:restaurants';

const FALLBACK = [
  { id: 1, nome: 'Sabor da Terra', telefone: '(11) 91234-5678' },
  { id: 2, nome: 'Churrascaria Gaúcha', telefone: '(11) 98765-4321' },
];

export const Restaurants = {
  async list() {
    try {
      const lista = await apiRequest('/restaurants');
      await AsyncStorage.setItem(KEY, JSON.stringify(lista));
      return lista;
    } catch (e) {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
      return FALLBACK;
    }
  },

  async get(id) {
    const lista = await this.list();
    return lista.find((r) => String(r.id) === String(id)) || null;
  },
};
