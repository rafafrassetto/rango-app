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
import Icon from '@expo/vector-icons/Feather';
import { Cart } from './services/storage';
import { colors, spacing, radius, shadow } from './theme/theme';

function formatPeso(g) {
  if (g >= 1000) return `${(g / 1000).toFixed(g % 1000 === 0 ? 0 : 2)} kg`;
  return `${g} g`;
}

export default function Carrinho({ navigation }) {
  const [itens, setItens] = useState([]);
  const [total, setTotal] = useState(0);

  const carregar = useCallback(async () => {
    const lista = await Cart.list();
    setItens(lista);
    setTotal(lista.reduce((acc, item) => acc + Number(item.preco || 0), 0));
  }, []);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  async function remover(id) {
    await Cart.remove(id);
    carregar();
  }

  async function limpar() {
    Alert.alert('Esvaziar carrinho', 'Remover todos os itens?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Esvaziar',
        style: 'destructive',
        onPress: async () => { await Cart.clear(); carregar(); },
      },
    ]);
  }

  function renderItem({ item }) {
    return (
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.nome}>{item.nome}</Text>
          <Text style={styles.detalhe}>{formatPeso(item.quantidade)} · R$ {Number(item.preco).toFixed(2)}</Text>
          {item.observacao ? <Text style={styles.obs}>Obs: {item.observacao}</Text> : null}
        </View>
        <TouchableOpacity style={styles.btRemover} onPress={() => remover(item.id)}>
          <Icon name="trash-2" size={16} color={colors.danger} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Meu carrinho</Text>

      <FlatList
        data={itens}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={itens.length === 0 ? styles.vazio : { paddingBottom: 12 }}
        ListEmptyComponent={
          <View style={styles.vazioBox}>
            <Icon name="shopping-bag" size={48} color={colors.textMuted} />
            <Text style={styles.vazioTxt}>Seu carrinho está vazio.</Text>
            <TouchableOpacity style={styles.btIr} onPress={() => navigation.navigate('Home')}>
              <Text style={styles.btIrTxt}>Ver restaurantes</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {itens.length > 0 && (
        <View style={styles.rodape}>
          <View>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.total}>R$ {total.toFixed(2)}</Text>
          </View>
          <View style={styles.acoes}>
            <TouchableOpacity style={styles.btLimpar} onPress={limpar}>
              <Text style={styles.btLimparTxt}>Esvaziar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btFinalizar}
              onPress={() => navigation.navigate('FinalizarPedido')}
            >
              <Text style={styles.btFinalizarTxt}>Finalizar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  titulo: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: spacing.md, borderRadius: radius.md,
    marginBottom: 8, alignItems: 'center', ...shadow.card,
  },
  nome: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  detalhe: { color: colors.textSecondary, marginTop: 2 },
  obs: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  btRemover: { padding: 10, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt },
  vazio: { flex: 1, justifyContent: 'center' },
  vazioBox: { alignItems: 'center', padding: 30, gap: 10 },
  vazioTxt: { color: colors.textSecondary, fontSize: 14 },
  btIr: {
    marginTop: 10, backgroundColor: colors.primary,
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: radius.md,
  },
  btIrTxt: { color: colors.textInverse, fontWeight: '700' },

  rodape: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.surface, padding: spacing.md,
    borderRadius: radius.lg, ...shadow.card,
  },
  totalLabel: { color: colors.textSecondary, fontSize: 11 },
  total: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  acoes: { flexDirection: 'row', gap: 8 },
  btLimpar: {
    paddingHorizontal: 14, paddingVertical: 12,
    backgroundColor: colors.surfaceAlt, borderRadius: radius.md,
  },
  btLimparTxt: { color: colors.textPrimary, fontWeight: '600' },
  btFinalizar: {
    paddingHorizontal: 18, paddingVertical: 12,
    backgroundColor: colors.primary, borderRadius: radius.md,
  },
  btFinalizarTxt: { color: colors.textInverse, fontWeight: '700' },
});
