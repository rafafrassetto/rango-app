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
import { Orders } from './services/storage';
import { colors, spacing, radius, shadow } from './theme/theme';

const STATUS_COR = {
  'Em preparo': colors.warning,
  'Saiu para entrega': colors.info,
  'Entregue': colors.success,
  'Cancelado': colors.danger,
};

export default function MeusPedidos({ navigation }) {
  const [pedidos, setPedidos] = useState([]);

  const carregar = useCallback(async () => {
    const lista = await Orders.list();
    setPedidos(lista);
  }, []);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  function confirmarExclusao(id) {
    Alert.alert('Excluir pedido', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => { await Orders.remove(id); carregar(); },
      },
    ]);
  }

  function formatarData(iso) {
    try { return new Date(iso).toLocaleString('pt-BR'); }
    catch { return iso; }
  }

  function renderItem({ item }) {
    const cor = STATUS_COR[item.status] || colors.textSecondary;
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.titulo}>Pedido #{item.id.slice(-5)}</Text>
          <View style={[styles.statusTag, { backgroundColor: cor + '22' }]}>
            <Text style={[styles.statusTagTxt, { color: cor }]}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.info}>Data: {formatarData(item.data)}</Text>
        <Text style={styles.info}>Itens: {(item.itens || []).length}</Text>
        <Text style={styles.infoForte}>R$ {Number(item.total || 0).toFixed(2)}</Text>
        {item.endereco ? (
          <Text style={styles.info} numberOfLines={1}>
            Entrega: {item.endereco.rua}, {item.endereco.numero}
          </Text>
        ) : null}

        <View style={styles.acoes}>
          <TouchableOpacity
            style={styles.btEditar}
            onPress={() => navigation.navigate('EditarPedido', { id: item.id })}
          >
            <Text style={styles.btEditarTxt}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btExcluir}
            onPress={() => confirmarExclusao(item.id)}
          >
            <Text style={styles.btExcluirTxt}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.tituloTela}>Meus pedidos</Text>
      <FlatList
        data={pedidos}
        keyExtractor={(item) => item.id}
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
  acoes: { flexDirection: 'row', gap: 8, marginTop: 10 },
  btEditar: { flex: 1, backgroundColor: colors.primary, paddingVertical: 10, borderRadius: radius.sm, alignItems: 'center' },
  btEditarTxt: { color: colors.textInverse, fontWeight: '700' },
  btExcluir: { flex: 1, backgroundColor: colors.surfaceAlt, paddingVertical: 10, borderRadius: radius.sm, alignItems: 'center' },
  btExcluirTxt: { color: colors.danger, fontWeight: '700' },
});
