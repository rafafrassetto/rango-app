import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Orders } from './services/storage';
import { colors, spacing, radius, shadow } from './theme/theme';

const STATUS_OPCOES = ['Em preparo', 'Saiu para entrega', 'Entregue', 'Cancelado'];

export default function EditarPedido({ route, navigation }) {
  const { id } = route.params || {};
  const [pedido, setPedido] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    (async () => {
      const p = await Orders.get(id);
      setPedido(p);
      setCarregando(false);
    })();
  }, [id]);

  function alterarItem(idx, campo, valor) {
    const novosItens = [...pedido.itens];
    novosItens[idx] = { ...novosItens[idx], [campo]: valor };
    const total = novosItens.reduce((acc, it) => acc + Number(it.preco || 0), 0);
    setPedido({ ...pedido, itens: novosItens, total });
  }

  function removerItem(idx) {
    const novosItens = pedido.itens.filter((_, i) => i !== idx);
    const total = novosItens.reduce((acc, it) => acc + Number(it.preco || 0), 0);
    setPedido({ ...pedido, itens: novosItens, total });
  }

  async function salvar() {
    await Orders.update(pedido.id, pedido);
    Alert.alert('Sucesso', 'Pedido atualizado!', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  }

  if (carregando) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  if (!pedido) {
    return <View style={styles.center}><Text>Pedido não encontrado.</Text></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.titulo}>Editar pedido #{pedido.id.slice(-5)}</Text>

      <Text style={styles.label}>Status</Text>
      <View style={styles.statusBox}>
        {STATUS_OPCOES.map((s) => {
          const ativo = pedido.status === s;
          return (
            <TouchableOpacity
              key={s}
              style={[styles.statusItem, ativo && styles.statusAtivo]}
              onPress={() => setPedido({ ...pedido, status: s })}
            >
              <Text style={[styles.statusTxt, ativo && styles.statusTxtAtivo]}>{s}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.label}>Itens</Text>
      {pedido.itens.map((item, idx) => (
        <View key={idx} style={styles.itemBox}>
          <View style={styles.linha}>
            <Text style={styles.itemNome}>{item.nome}</Text>
            <TouchableOpacity onPress={() => removerItem(idx)}>
              <Text style={styles.remover}>Remover</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.linha}>
            <Text style={styles.itemLabel}>Quantidade (g):</Text>
            <TextInput
              style={styles.inputPequeno}
              keyboardType="numeric"
              value={String(item.quantidade || 0)}
              onChangeText={(t) => alterarItem(idx, 'quantidade', Number(t) || 0)}
            />
          </View>
          <View style={styles.linha}>
            <Text style={styles.itemLabel}>Preço (R$):</Text>
            <TextInput
              style={styles.inputPequeno}
              keyboardType="numeric"
              value={String(item.preco || 0)}
              onChangeText={(t) => alterarItem(idx, 'preco', parseFloat(t) || 0)}
            />
          </View>
        </View>
      ))}

      <View style={styles.totalBox}>
        <Text style={styles.totalTxt}>Total: R$ {Number(pedido.total || 0).toFixed(2)}</Text>
      </View>

      <TouchableOpacity style={styles.btSalvar} onPress={salvar}>
        <Text style={styles.btSalvarTxt}>Salvar alterações</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btCancelar} onPress={() => navigation.goBack()}>
        <Text style={styles.btCancelarTxt}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  titulo: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 16, textAlign: 'center' },
  label: { fontSize: 13, fontWeight: '700', marginTop: 12, marginBottom: 6, color: colors.textPrimary },
  inputPequeno: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.inputBorder,
    borderRadius: radius.sm, padding: 6, width: 100, textAlign: 'right', color: colors.textPrimary,
  },
  statusBox: { flexDirection: 'row', flexWrap: 'wrap' },
  statusItem: {
    paddingVertical: 6, paddingHorizontal: 12, borderRadius: radius.pill,
    borderWidth: 1, borderColor: colors.divider, margin: 4, backgroundColor: colors.surface,
  },
  statusAtivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  statusTxt: { color: colors.textSecondary },
  statusTxtAtivo: { color: colors.textInverse, fontWeight: '700' },
  itemBox: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: 12,
    marginBottom: 8, ...shadow.card,
  },
  linha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 4 },
  itemNome: { fontWeight: '700', color: colors.textPrimary },
  itemLabel: { color: colors.textSecondary },
  remover: { color: colors.danger, fontWeight: '600' },
  totalBox: { marginTop: 14, paddingVertical: 10, borderTopWidth: 1, borderColor: colors.divider, alignItems: 'flex-end' },
  totalTxt: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  btSalvar: { marginTop: 18, backgroundColor: colors.primary, paddingVertical: 14, borderRadius: radius.md, alignItems: 'center' },
  btSalvarTxt: { color: colors.textInverse, fontWeight: '700' },
  btCancelar: { marginTop: 8, paddingVertical: 12, borderRadius: radius.md, alignItems: 'center' },
  btCancelarTxt: { color: colors.primary, fontWeight: '600' },
});
