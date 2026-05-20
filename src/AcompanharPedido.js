import React, { useEffect, useState } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator,
} from 'react-native';
import Icon from '@expo/vector-icons/Feather';
import { Orders } from './services/storage';
import { colors, spacing, radius, shadow } from './theme/theme';
import { formatBRL, formatPeso } from './services/format';

const ETAPAS = [
  { id: 'Em preparo',    rotulo: 'Pedido confirmado', icone: 'check-circle' },
  { id: 'Em preparo',    rotulo: 'Restaurante preparando', icone: 'clock' },
  { id: 'A caminho',     rotulo: 'A caminho', icone: 'truck' },
  { id: 'Entregue',      rotulo: 'Entregue', icone: 'package' },
];

export default function AcompanharPedido({ navigation, route }) {
  const { orderId, restaurantId, restaurantNome, total, formaPagamento } = route?.params || {};
  const [pedido, setPedido] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let vivo = true;
    (async () => {
      const p = await Orders.get(orderId);
      if (vivo) setPedido(p);
    })();
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => { vivo = false; clearInterval(t); };
  }, [orderId]);

  function tempoDesde(iso) {
    if (!iso) return '';
    const ms = Date.now() - new Date(iso).getTime();
    const min = Math.floor(ms / 60000);
    if (min < 1) return 'agora';
    if (min === 1) return 'há 1 min';
    return `há ${min} min`;
  }

  async function marcarRecebido() {
    await Orders.update(orderId, { status: 'Entregue' });
    navigation.replace('AvaliarPedido', {
      orderId,
      restaurantId,
      restaurantNome,
    });
  }

  if (!pedido) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const entregue = pedido.status === 'Entregue';
  const etapaAtual = entregue ? 3 : 1;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }}>
      <View style={styles.headerBox}>
        <Icon name="shopping-bag" size={32} color={colors.primary} />
        <Text style={styles.headerTitulo}>Pedido em andamento</Text>
        <Text style={styles.headerSub}>
          #{String(pedido.id).slice(-5)} · {restaurantNome || 'Restaurante'}
        </Text>
        <Text style={styles.headerTempo} key={tick}>
          Realizado {tempoDesde(pedido.data)}
        </Text>
      </View>

      <View style={styles.bloco}>
        <Text style={styles.tituloBloco}>Status</Text>
        {ETAPAS.map((e, idx) => {
          const ativo = idx <= etapaAtual;
          return (
            <View key={idx} style={styles.etapaLinha}>
              <View style={[styles.etapaIcon, ativo && styles.etapaIconAtivo]}>
                <Icon
                  name={e.icone}
                  size={14}
                  color={ativo ? '#fff' : colors.textMuted}
                />
              </View>
              <Text style={[styles.etapaTxt, ativo && styles.etapaTxtAtivo]}>{e.rotulo}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.bloco}>
        <Text style={styles.tituloBloco}>Resumo</Text>
        {(pedido.itens || []).map((it) => (
          <View key={it.id} style={styles.itemLinha}>
            <Text style={styles.itemNome}>{it.nome}</Text>
            <Text style={styles.itemDet}>
              {formatPeso(it.quantidade)} · {formatBRL(it.preco)}
            </Text>
          </View>
        ))}
        <View style={styles.totalLinha}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValor}>{formatBRL(pedido.total || total)}</Text>
        </View>
      </View>

      {!entregue && (
        <TouchableOpacity style={styles.btPrincipal} onPress={marcarRecebido}>
          <Icon name="check" size={18} color={colors.textInverse} />
          <Text style={styles.btPrincipalTxt}>Recebi meu pedido</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.btSecundario}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.btSecundarioTxt}>Voltar ao início</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },

  headerBox: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  headerTitulo: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginTop: 8 },
  headerSub: { color: colors.textSecondary, marginTop: 4, fontSize: 12 },
  headerTempo: { color: colors.textMuted, marginTop: 6, fontSize: 11 },

  bloco: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  tituloBloco: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 10 },

  etapaLinha: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  etapaIcon: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 10,
  },
  etapaIconAtivo: { backgroundColor: colors.primary },
  etapaTxt: { color: colors.textMuted, fontSize: 13 },
  etapaTxtAtivo: { color: colors.textPrimary, fontWeight: '600' },

  itemLinha: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: colors.divider,
  },
  itemNome: { color: colors.textPrimary, fontWeight: '600' },
  itemDet: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  totalLinha: {
    marginTop: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  totalLabel: { color: colors.textSecondary, fontSize: 12 },
  totalValor: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },

  btPrincipal: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 16, borderRadius: radius.md,
    ...shadow.card,
  },
  btPrincipalTxt: { color: colors.textInverse, fontWeight: '700', fontSize: 15 },

  btSecundario: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btSecundarioTxt: { color: colors.textSecondary, fontSize: 13 },
});
