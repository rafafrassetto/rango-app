// Cliente Supabase para o app.
// Usado para:
//   - Realtime de status do pedido (canal "orders")
//   - Storage de imagens dos pratos
//   - (Opcional) Supabase Auth no lugar de senha em texto plano
//
// Configure as variáveis no .env (raiz do projeto):
//   EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
//   EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...   (ou eyJ... no formato legado)
//
// Expo expõe automaticamente vars com prefixo EXPO_PUBLIC_ no bundle.

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    '[supabase] EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY não definidos. ' +
      'Realtime e Storage não funcionarão até configurar o .env.'
  );
}

export const supabase = createClient(
  SUPABASE_URL || 'http://localhost',
  SUPABASE_ANON_KEY || 'anon',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// Assina mudanças de status de um pedido específico.
// Uso:
//   const off = subscribeOrderStatus(orderId, (novoStatus) => setStatus(novoStatus));
//   // depois: off();
export function subscribeOrderStatus(orderId, onChange) {
  const channel = supabase
    .channel(`order:${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      },
      (payload) => {
        if (payload.new && payload.new.status) onChange(payload.new.status);
      }
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}

// URL pública de uma imagem no bucket "dishes".
export function urlImagemPrato(path) {
  if (!path) return null;
  const { data } = supabase.storage.from('dishes').getPublicUrl(path);
  return data.publicUrl;
}
