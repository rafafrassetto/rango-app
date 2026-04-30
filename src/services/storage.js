import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  CART: '@rango:cart',
  ORDERS: '@rango:orders',
  ADDRESSES: '@rango:addresses',
  USER: '@rango:user',
};

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

export const Cart = {
  list: () => readList(KEYS.CART),
  add: async (item) => {
    const list = await readList(KEYS.CART);
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
    const novo = list.filter((p) => p.id !== id);
    await writeList(KEYS.CART, novo);
  },
  clear: () => writeList(KEYS.CART, []),
  total: async () => {
    const list = await readList(KEYS.CART);
    return list.reduce((acc, item) => acc + Number(item.preco || 0), 0);
  },
};

export const Orders = {
  list: () => readList(KEYS.ORDERS),
  get: async (id) => {
    const list = await readList(KEYS.ORDERS);
    return list.find((p) => p.id === id);
  },
  add: async (pedido) => {
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
  update: async (id, patch) => {
    const list = await readList(KEYS.ORDERS);
    const idx = list.findIndex((p) => p.id === id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...patch };
      await writeList(KEYS.ORDERS, list);
      return list[idx];
    }
    return null;
  },
  remove: async (id) => {
    const list = await readList(KEYS.ORDERS);
    const novo = list.filter((p) => p.id !== id);
    await writeList(KEYS.ORDERS, novo);
  },
};

export const Addresses = {
  list: () => readList(KEYS.ADDRESSES),
  get: async (id) => {
    const list = await readList(KEYS.ADDRESSES);
    return list.find((p) => p.id === id);
  },
  add: async (endereco) => {
    const list = await readList(KEYS.ADDRESSES);
    const novo = { id: generateId(), ...endereco };
    list.push(novo);
    await writeList(KEYS.ADDRESSES, list);
    return novo;
  },
  update: async (id, patch) => {
    const list = await readList(KEYS.ADDRESSES);
    const idx = list.findIndex((p) => p.id === id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...patch };
      await writeList(KEYS.ADDRESSES, list);
      return list[idx];
    }
    return null;
  },
  remove: async (id) => {
    const list = await readList(KEYS.ADDRESSES);
    const novo = list.filter((p) => p.id !== id);
    await writeList(KEYS.ADDRESSES, novo);
  },
};

export const Session = {
  get: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEYS.USER);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },
  set: (user) => AsyncStorage.setItem(KEYS.USER, JSON.stringify(user)),
  clear: () => AsyncStorage.removeItem(KEYS.USER),
};
