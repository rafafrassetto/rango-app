import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from './api';

const KEYS = {
  CART: '@rango:cart',
  ORDERS: '@rango:orders',
  ADDRESSES: '@rango:addresses',
  USER: '@rango:user',
  WEIGHTS: '@rango:weights',
  RATINGS: '@rango:ratings',
  CANCEL_FEE: '@rango:cancelFee',
};

export const CANCEL_FEE_AMOUNT = 10;

async function readList(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

async function writeList(key, list) {
  await AsyncStorage.setItem(key, JSON.stringify(list));
}

function generateId() {
  return Date.now().toString() + Math.floor(Math.random() * 1000);
}

// Normaliza pedido do servidor para o shape que as telas esperam.
function mapServerOrder(o) {
  return {
    id: String(o.id),
    data: o.created_at || new Date().toISOString(),
    status: o.status,
    total: Number(o.total),
    itens: (o.items || []).map((it) => ({
      id: String(it.id),
      pratoId: String(it.dish_id),
      nome: it.nome_snapshot || (it.dish && it.dish.nome) || '',
      quantidade: it.quantidade_g,
      preco: Number(it.preco_total),
      precoPorKg: Number(it.preco_por_kg_snapshot || 0),
      observacao: it.observacao,
    })),
    endereco: o.address || null,
  };
}

// =================== CARRINHO (sempre local) ===================
export const Cart = {
  list: () => readList(KEYS.CART),

  add: async (item) => {
    const list = await readList(KEYS.CART);
    // Se o carrinho já tem itens de outro restaurante, impede
    if (list.length > 0 && item.restaurantId) {
      const restauranteAtual = list[0].restaurantId;
      if (restauranteAtual && restauranteAtual !== item.restaurantId) {
        throw new Error(`RESTAURANTE_DIFERENTE:${list[0].restaurantNome || 'outro restaurante'}`);
      }
    }
    const novo = { id: generateId(), ...item };
    list.push(novo);
    await writeList(KEYS.CART, list);
    return novo;
  },

  update: async (id, patch) => {
    const list = await readList(KEYS.CART);
    const idx = list.findIndex((p) => p.id === id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...patch };
      await writeList(KEYS.CART, list);
      return list[idx];
    }
    return null;
  },

  remove: async (id) => {
    const list = await readList(KEYS.CART);
    await writeList(KEYS.CART, list.filter((p) => p.id !== id));
  },

  clear: () => writeList(KEYS.CART, []),

  total: async () => {
    const list = await readList(KEYS.CART);
    return list.reduce((acc, item) => acc + Number(item.preco || 0), 0);
  },
};

// =================== PEDIDOS (API-primary, AsyncStorage como cache) ===================
export const Orders = {
  // opts.restaurantId → pedidos com pratos desse restaurante (visão painel)
  // opts.all = true → todos os pedidos (admin/debug)
  // padrão: pedidos do usuário logado
  async list(opts = {}) {
    try {
      const params = new URLSearchParams();
      if (opts.restaurantId) {
        params.set('restaurant_id', opts.restaurantId);
      } else if (!opts.all) {
        const session = await Session.get();
        if (session?.id) params.set('user_id', session.id);
      }
      const qs = params.toString() ? `?${params}` : '';
      const lista = await apiRequest(`/orders${qs}`);
      const mapped = lista.map(mapServerOrder);
      if (!opts.restaurantId) await writeList(KEYS.ORDERS, mapped);
      return mapped;
    } catch (e) {
      return readList(KEYS.ORDERS);
    }
  },

  async get(id) {
    try {
      const o = await apiRequest(`/orders/${id}`);
      return mapServerOrder(o);
    } catch (e) {
      const list = await readList(KEYS.ORDERS);
      return list.find((p) => p.id === String(id));
    }
  },

  // pedido: { itens, total, endereco }
  async add(pedido) {
    try {
      const session = await Session.get();
      if (session?.id) {
        const body = {
          user_id: session.id,
          address_id: pedido.endereco?.id ? Number(pedido.endereco.id) : null,
          total: pedido.total,
          items: (pedido.itens || []).map((it) => ({
            dish_id: Number(it.pratoId) || 1,
            nome_snapshot: it.nome,
            quantidade_g: it.quantidade,
            preco_por_kg_snapshot: it.precoPorKg,
            preco_total: it.preco,
            observacao: it.observacao,
          })),
        };
        const novo = await apiRequest('/orders', { method: 'POST', body });
        const mapped = mapServerOrder(novo);
        const cache = await readList(KEYS.ORDERS);
        cache.unshift(mapped);
        await writeList(KEYS.ORDERS, cache);
        return mapped;
      }
    } catch (e) { /* fallback local */ }

    const list = await readList(KEYS.ORDERS);
    const novo = {
      id: generateId(),
      data: new Date().toISOString(),
      status: 'Em preparo',
      ...pedido,
    };
    list.unshift(novo);
    await writeList(KEYS.ORDERS, list);
    return novo;
  },

  async update(id, patch) {
    if (patch.status) {
      try {
        await apiRequest(`/orders/${id}/status`, {
          method: 'PUT',
          body: { status: patch.status },
        });
      } catch (e) { /* fallback local */ }
    }
    const list = await readList(KEYS.ORDERS);
    const idx = list.findIndex((p) => p.id === String(id));
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...patch };
      await writeList(KEYS.ORDERS, list);
      return list[idx];
    }
    return null;
  },

  async remove(id) {
    try {
      await apiRequest(`/orders/${id}`, { method: 'DELETE' });
    } catch (e) { /* fallback */ }
    const list = await readList(KEYS.ORDERS);
    await writeList(KEYS.ORDERS, list.filter((p) => p.id !== String(id)));
  },
};

// =================== ENDEREÇOS (API-primary, AsyncStorage como cache) ===================
export const Addresses = {
  async list() {
    try {
      const session = await Session.get();
      if (session?.id) {
        const lista = await apiRequest(`/users/${session.id}/addresses`);
        await writeList(KEYS.ADDRESSES, lista);
        return lista;
      }
    } catch (e) { /* fallback */ }
    return readList(KEYS.ADDRESSES);
  },

  async get(id) {
    const list = await this.list();
    return list.find((p) => String(p.id) === String(id)) || null;
  },

  async add(endereco) {
    try {
      const session = await Session.get();
      if (session?.id) {
        const novo = await apiRequest(`/users/${session.id}/addresses`, {
          method: 'POST',
          body: endereco,
        });
        const cache = await readList(KEYS.ADDRESSES);
        cache.push(novo);
        await writeList(KEYS.ADDRESSES, cache);
        return novo;
      }
    } catch (e) { /* fallback */ }
    const list = await readList(KEYS.ADDRESSES);
    const novo = { id: generateId(), ...endereco };
    list.push(novo);
    await writeList(KEYS.ADDRESSES, list);
    return novo;
  },

  async update(id, patch) {
    try {
      const atualizado = await apiRequest(`/addresses/${id}`, {
        method: 'PUT',
        body: patch,
      });
      const cache = await readList(KEYS.ADDRESSES);
      const idx = cache.findIndex((p) => String(p.id) === String(id));
      if (idx >= 0) { cache[idx] = { ...cache[idx], ...atualizado }; }
      await writeList(KEYS.ADDRESSES, cache);
      return atualizado;
    } catch (e) { /* fallback */ }
    const list = await readList(KEYS.ADDRESSES);
    const idx = list.findIndex((p) => String(p.id) === String(id));
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...patch };
      await writeList(KEYS.ADDRESSES, list);
      return list[idx];
    }
    return null;
  },

  async remove(id) {
    try {
      await apiRequest(`/addresses/${id}`, { method: 'DELETE' });
    } catch (e) { /* fallback */ }
    const list = await readList(KEYS.ADDRESSES);
    await writeList(KEYS.ADDRESSES, list.filter((p) => String(p.id) !== String(id)));
  },
};

// =================== PESO LEMBRADO POR PRATO (local) ===================
export const Weights = {
  async get(pratoId) {
    if (pratoId == null) return null;
    try {
      const raw = await AsyncStorage.getItem(KEYS.WEIGHTS);
      const map = raw ? JSON.parse(raw) : {};
      const v = map[String(pratoId)];
      return v != null ? Number(v) : null;
    } catch (e) {
      return null;
    }
  },
  async set(pratoId, pesoG) {
    if (pratoId == null) return;
    try {
      const raw = await AsyncStorage.getItem(KEYS.WEIGHTS);
      const map = raw ? JSON.parse(raw) : {};
      map[String(pratoId)] = Number(pesoG);
      await AsyncStorage.setItem(KEYS.WEIGHTS, JSON.stringify(map));
    } catch (e) { /* silencioso */ }
  },
};

// =================== AVALIAÇÕES DE RESTAURANTES (API-primary) ===================
function mapRating(r) {
  return {
    id: String(r.id),
    orderId: r.order_id != null ? String(r.order_id) : null,
    restaurantId: r.restaurant_id != null ? String(r.restaurant_id) : null,
    userId: r.user_id != null ? String(r.user_id) : null,
    entrega: Number(r.nota_entrega) || 0,
    restaurante: Number(r.nota_restaurante) || 0,
    comentario: r.comentario || '',
    data: r.created_at || new Date().toISOString(),
  };
}

export const Ratings = {
  async list(opts = {}) {
    try {
      const params = new URLSearchParams();
      if (opts.restaurantId) params.set('restaurant_id', opts.restaurantId);
      if (opts.userId) params.set('user_id', opts.userId);
      const qs = params.toString() ? `?${params}` : '';
      const lista = await apiRequest(`/ratings${qs}`);
      const mapped = lista.map(mapRating);
      await writeList(KEYS.RATINGS, mapped);
      return mapped;
    } catch (e) {
      return readList(KEYS.RATINGS);
    }
  },

  async add({ orderId, restaurantId, entrega, restaurante, comentario }) {
    const session = await Session.get();
    const novo = {
      id: generateId(),
      orderId: orderId != null ? String(orderId) : null,
      restaurantId: restaurantId != null ? String(restaurantId) : null,
      entrega: Number(entrega) || 0,
      restaurante: Number(restaurante) || 0,
      comentario: comentario || '',
      data: new Date().toISOString(),
    };
    try {
      const salvo = await apiRequest('/ratings', {
        method: 'POST',
        body: {
          order_id: orderId ? Number(orderId) : null,
          restaurant_id: Number(restaurantId),
          user_id: session?.id ? Number(session.id) : null,
          nota_entrega: Number(entrega) || 0,
          nota_restaurante: Number(restaurante) || 0,
          comentario: comentario || null,
        },
      });
      const mapped = mapRating(salvo);
      const cache = await readList(KEYS.RATINGS);
      cache.push(mapped);
      await writeList(KEYS.RATINGS, cache);
      return mapped;
    } catch (e) {
      const list = await readList(KEYS.RATINGS);
      list.push(novo);
      await writeList(KEYS.RATINGS, list);
      return novo;
    }
  },

  async hasForOrder(orderId) {
    if (!orderId) return false;
    const list = await readList(KEYS.RATINGS);
    return list.some((r) => String(r.orderId) === String(orderId));
  },

  async avgForRestaurant(restaurantId) {
    if (restaurantId == null) return { media: 0, total: 0 };
    try {
      return await apiRequest(`/ratings/avg/${restaurantId}`);
    } catch (e) {
      const list = await readList(KEYS.RATINGS);
      const filt = list.filter((r) => String(r.restaurantId) === String(restaurantId));
      if (filt.length === 0) return { media: 0, total: 0 };
      const soma = filt.reduce((acc, r) => acc + ((r.entrega + r.restaurante) / 2), 0);
      return { media: soma / filt.length, total: filt.length };
    }
  },
};

// =================== TAXA DE CANCELAMENTO ACUMULADA (local) ===================
export const CancelFee = {
  async get() {
    try {
      const raw = await AsyncStorage.getItem(KEYS.CANCEL_FEE);
      return raw ? Number(JSON.parse(raw)) || 0 : 0;
    } catch (e) {
      return 0;
    }
  },
  async add() {
    const atual = await CancelFee.get();
    const novo = atual + CANCEL_FEE_AMOUNT;
    await AsyncStorage.setItem(KEYS.CANCEL_FEE, JSON.stringify(novo));
    return novo;
  },
  async clear() {
    await AsyncStorage.setItem(KEYS.CANCEL_FEE, JSON.stringify(0));
  },
};

// =================== SESSÃO DO CLIENTE ===================
export const Session = {
  get: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEYS.USER);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },
  // LGPD: nunca persistir senha em texto puro no dispositivo (Art. 46).
  set: (user) => {
    const { senha, ...semSenha } = user || {};
    return AsyncStorage.setItem(KEYS.USER, JSON.stringify(semSenha));
  },
  clear: () => AsyncStorage.removeItem(KEYS.USER),
};
