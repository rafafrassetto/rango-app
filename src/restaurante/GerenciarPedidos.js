import React, { useCallback, useState } from 'react';
import {
  StyleSheet, View, Text,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '@expo/vector-icons/Feather';
import { Orders } from '../services/storage';
import { RestauranteAuth } from '../services/restauranteAuth';
import { colors, spacing, radius, shadow } from '../theme/theme';

const STATUS_FLUXO = ['Em preparo', 'Saiu para entrega', 'Entregue'];
const STATUS_COR = {
  'Em preparo': colors.warning,
  'Saiu para entrega': colors.info,
  'Entregue': colors.success,
  'Cancelado': colors.danger,
};

function formatarHora(iso) {
  try { return new Date(iso).toLocaleString('pt-BR'); } catch { return iso; }
}

function formatPeso(g) {
  if (!g) return '0g';
  if (g >= 1000) return `${(g / 1000).toFixed(g % 1000 === 0 ? 0 : 2)}kg`;
  return `${g}g`;
}

export default function GerenciarPedidos({ onChange }) {
  const [pedidos, setPedidos] = useState([]);

  const carregar = useCallback(async () => {
    const sessao = await RestauranteAuth.getSession();
    const lista = await Orders.list({ restaurantId: sessao?.id });
    setPedidos(lista);
  }, []);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  if (pedidos.length === 0) {
    return (
      <View style={styles.vazio}>
        <Icon name="inbox" size={36} color={colors.textMuted} />
        <Text style={styles.vazioTxt}>Nenhum pedido recebido ainda.</Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.titulo}>Pedidos recebidos</Text>
      {pedidos.map((p) => {
        const cor = STATUS_COR[p.status] || colors.textSecondary;
        return (
          <View key={p.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.numero}>#{p.id.slice(-5)}</Text>
              <View style={[styles.statusTag, { backgroundColor: cor + '22' }]}>
                <Text style={[styles.statusTxt, { color: cor }]}>{p.status}</Text>
              </View>
            </View>
            <Text style={styles.hora}>{formatarHora(p.data)}</Text>

            {(p.itens || []).map((it, i) => (
              <View key={i} style={styles.itemLinha}>
                <Text style={styles.itemNome}>· {it.nome}</Text>
                <Text style={styles.itemQtd}>{formatPeso(it.quantidade)}</Text>
              </View>
            ))}

            <View style={styles.cardFooter}>
              <Text style={styles.total}>R$ {Number(p.total || 0).toFixed(2)}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  titulo: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 10 },
  vazio: { alignItems: 'center', padding: 40, gap: 10 },
  vazioTxt: { color: colors.textSecondary },

  card: {
    backgroundColor: colors.surface, padding: spacing.md,
    borderRadius: radius.lg, marginBottom: 10, ...shadow.card,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  numero: { fontWeight: '700', color: colors.textPrimary },
  statusTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  statusTxt: { fontSize: 10, fontWeight: '700' },
  hora: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },

  itemLinha: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  itemNome: { color: colors.textPrimary, fontSize: 13 },
  itemQtd: { color: colors.textSecondary, fontSize: 13 },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  total: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
});
