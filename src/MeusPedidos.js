import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Orders, CancelFee, CANCEL_FEE_AMOUNT } from './services/storage';
import { colors, spacing, radius, shadow } from './theme/theme';
import { formatBRL } from './services/format';

const STATUS_COR = {
  'Em preparo': colors.warning,
  'Saiu para entrega': colors.info,
  'Entregue': colors.success,
  'Cancelado': colors.danger,
};

const STATUS_CANCELAVEIS = ['Em preparo', 'Saiu para entrega'];

export default function MeusPedidos({ navigation }) {
  const [pedidos, setPedidos] = useState([]);
  const [taxaPendente, setTaxaPendente] = useState(0);

  const carregar = useCallback(async () => {
    const lista = await Orders.list();
    setPedidos(lista);
    setTaxaPendente(await CancelFee.get());
  }, []);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  function confirmarCancelamento(id) {
    Alert.alert(
      'Cancelar pedido',
      `Tem certeza? Será cobrada uma taxa fixa de ${formatBRL(CANCEL_FEE_AMOUNT)} no seu próximo pedido.`,
      [
        { text: 'Voltar', style: 'cancel' },
        {
          text: 'Sim, cancelar',
          style: 'destructive',
          onPress: async () => {
            await Orders.update(id, { status: 'Cancelado' });
            const novo = await CancelFee.add();
            carregar();
            Alert.alert(
              'Pedido cancelado',
              `Taxa acumulada de cancelamento: ${formatBRL(novo)}.`
            );
          },
        },
      ]
    );
  }

  function formatarData(iso) {
    try { return new Date(iso).toLocaleString('pt-BR'); }
    catch { return iso; }
  }

  function renderItem({ item }) {
    const cor = STATUS_COR[item.status] || colors.textSecondary;
    const podeCancelar = STATUS_CANCELAVEIS.includes(item.status);
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.titulo}>Pedido #{String(item.id).slice(-5)}</Text>
          <View style={[styles.statusTag, { backgroundColor: cor + '22' }]}>
            <Text style={[styles.statusTagTxt, { color: cor }]}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.info}>Data: {formatarData(item.data)}</Text>
        <Text style={styles.info}>Itens: {(item.itens || []).length}</Text>
        <Text style={styles.infoForte}>{formatBRL(item.total || 0)}</Text>
        {item.endereco ? (
          <Text style={styles.info} numberOfLines={1}>
            Entrega: {item.endereco.rua}, {item.endereco.numero}
          </Text>
        ) : null}

        {podeCancelar && (
          <TouchableOpacity
            style={styles.btCancelar}
            onPress={() => confirmarCancelamento(item.id)}
          >
            <Text style={styles.btCancelarTxt}>Cancelar pedido</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.tituloTela}>Meus pedidos</Text>

      {taxaPendente > 0 && (
        <View style={styles.avisoTaxa}>
          <Text style={styles.avisoTxt}>
            Taxa de cancelamento pendente: {formatBRL(taxaPendente)}. Será somada ao próximo pedido.
          </Text>
        </View>
      )}

      <FlatList
        data={pedidos}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.vazio}>Você ainda não fez pedidos.</Text>}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  tituloTela: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  vazio: { color: colors.textSecondary, textAlign: 'center', marginTop: 30 },
  card: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.lg, marginBottom: 10, ...shadow.card },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  titulo: { fontWeight: '700', color: colors.textPrimary, fontSize: 15 },
  statusTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill },
  statusTagTxt: { fontSize: 10, fontWeight: '700' },
  info: { color: colors.textSecondary, fontSize: 12, marginVertical: 1 },
  infoForte: { color: colors.textPrimary, fontWeight: '700', marginTop: 4 },
  btCancelar: {
    marginTop: 10, backgroundColor: colors.surfaceAlt,
    borderWidth: 1, borderColor: colors.danger,
    paddingVertical: 10, borderRadius: radius.sm, alignItems: 'center',
  },
  btCancelarTxt: { color: colors.danger, fontWeight: '700' },
  avisoTaxa: {
    backgroundColor: '#FFF4E5',
    borderLeftWidth: 4, borderLeftColor: colors.warning,
    padding: 10, borderRadius: radius.sm, marginBottom: 12,
  },
  avisoTxt: { color: '#7A4A00', fontSize: 12, fontWeight: '600' },
});
