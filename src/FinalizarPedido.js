import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Cart, Orders, Addresses, CancelFee } from './services/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
const KEY_END_ENTREGA = '@rango:enderecoEntrega';
import { colors, spacing, radius, shadow } from './theme/theme';
import { formatBRL, formatPeso } from './services/format';

export default function FinalizarPedido({ navigation }) {
  const [itens, setItens] = useState([]);
  const [enderecos, setEnderecos] = useState([]);
  const [enderecoSelecionado, setEnderecoSelecionado] = useState(null);
  const [subtotal, setSubtotal] = useState(0);
  const [taxaCancel, setTaxaCancel] = useState(0);
  const [formaPagamento, setFormaPagamento] = useState('pix');

  const total = subtotal + taxaCancel;

  const carregar = useCallback(async () => {
    const cart = await Cart.list();
    setItens(cart);
    setSubtotal(cart.reduce((acc, item) => acc + Number(item.preco || 0), 0));
    setTaxaCancel(await CancelFee.get());
    const ends = await Addresses.list();
    setEnderecos(ends);
    if (ends.length > 0) {
      const salvoId = await AsyncStorage.getItem(KEY_END_ENTREGA);
      const preferido = salvoId && ends.find((e) => String(e.id) === salvoId);
      setEnderecoSelecionado(preferido || ends[0]);
    }
  }, [enderecoSelecionado]);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  async function finalizar() {
    if (itens.length === 0) return Alert.alert('Atenção', 'Carrinho vazio.');
    if (!enderecoSelecionado)
      return Alert.alert('Endereço', 'Cadastre um endereço de entrega antes de finalizar.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cadastrar', onPress: () => navigation.navigate('EditarEndereco', {}) },
      ]);

    const pedido = await Orders.add({
      itens,
      total,
      endereco: enderecoSelecionado,
      forma_pagamento: formaPagamento,
    });
    await Cart.clear();
    if (taxaCancel > 0) await CancelFee.clear();

    navigation.replace('Pagamento', {
      orderId: pedido.id,
      formaPagamento,
      total,
      restaurantId: itens[0]?.restaurantId,
      restaurantNome: itens[0]?.restaurantNome,
    });
  }

  function renderItem({ item }) {
    return (
      <View style={styles.itemBox}>
        <Text style={styles.itemNome}>{item.nome}</Text>
        <Text style={styles.itemDetalhe}>
          {formatPeso(item.quantidade)} · {formatBRL(item.preco)}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }}>
      <Text style={styles.titulo}>Finalizar pedido</Text>

      <Text style={styles.subtitulo}>Itens do carrinho</Text>
      {itens.length === 0 ? (
        <Text style={styles.vazio}>Carrinho vazio.</Text>
      ) : (
        <FlatList
          data={itens}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          style={{ maxHeight: 200 }}
        />
      )}

      <Text style={styles.subtitulo}>Endereço de entrega</Text>
      {enderecos.length === 0 ? (
        <TouchableOpacity style={styles.btCadastrar} onPress={() => navigation.navigate('EditarEndereco', {})}>
          <Text style={styles.btCadastrarTxt}>+ Cadastrar endereço</Text>
        </TouchableOpacity>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {enderecos.map((end) => {
            const ativo = enderecoSelecionado?.id === end.id;
            return (
              <TouchableOpacity
                key={end.id}
                style={[styles.enderecoCard, ativo && styles.enderecoAtivo]}
                onPress={() => setEnderecoSelecionado(end)}
              >
                <Text style={[styles.enderecoTitulo, ativo && { color: colors.textInverse }]}>
                  {end.apelido || 'Endereço'}
                </Text>
                <Text style={[styles.enderecoTxt, ativo && { color: colors.textInverse }]}>
                  {end.rua}, {end.numero}
                </Text>
                <Text style={[styles.enderecoTxt, ativo && { color: colors.textInverse }]}>
                  {end.cidade}/{end.estado}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      <Text style={styles.subtitulo}>Forma de pagamento</Text>
      <View style={styles.formasBox}>
        {['pix', 'dinheiro', 'cartao_debito', 'cartao_credito'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.formaBt, formaPagamento === f && styles.formaAtivo]}
            onPress={() => setFormaPagamento(f)}
          >
            <Text style={[styles.formaTxt, formaPagamento === f && styles.formaAtivoTxt]}>
              {f === 'pix' ? 'PIX' : f === 'dinheiro' ? 'Dinheiro' : f === 'cartao_debito' ? 'Débito' : 'Crédito'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {taxaCancel > 0 && (
        <View style={styles.linhaResumo}>
          <Text style={styles.linhaLabel}>Subtotal</Text>
          <Text style={styles.linhaValor}>{formatBRL(subtotal)}</Text>
        </View>
      )}
      {taxaCancel > 0 && (
        <View style={styles.linhaResumo}>
          <Text style={[styles.linhaLabel, { color: colors.danger }]}>
            Taxa de cancelamento (pedido anterior)
          </Text>
          <Text style={[styles.linhaValor, { color: colors.danger }]}>
            +{formatBRL(taxaCancel)}
          </Text>
        </View>
      )}
      <View style={styles.totalBox}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValor}>{formatBRL(total)}</Text>
      </View>

      <TouchableOpacity style={styles.btFinalizar} onPress={finalizar}>
        <Text style={styles.btFinalizarTxt}>Confirmar pedido</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  titulo: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  subtitulo: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, marginTop: 14, marginBottom: 6 },
  itemBox: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 8, borderBottomWidth: 1, borderColor: colors.divider,
  },
  itemNome: { fontWeight: '700', color: colors.textPrimary },
  itemDetalhe: { color: colors.textSecondary },
  vazio: { color: colors.textSecondary, marginVertical: 8 },

  btCadastrar: {
    padding: spacing.md, backgroundColor: colors.primaryLight,
    borderRadius: radius.md, alignItems: 'center',
  },
  btCadastrarTxt: { color: colors.primary, fontWeight: '700' },

  enderecoCard: {
    backgroundColor: colors.surface, padding: spacing.md,
    borderRadius: radius.md, marginRight: 8, minWidth: 180,
    ...shadow.card,
  },
  enderecoAtivo: { backgroundColor: colors.primary },
  enderecoTitulo: { fontWeight: '700', color: colors.textPrimary },
  enderecoTxt: { color: colors.textSecondary, fontSize: 12 },

  totalBox: {
    marginTop: 18, paddingVertical: 12,
    borderTopWidth: 1, borderColor: colors.divider,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  totalLabel: { color: colors.textSecondary, fontSize: 12 },
  totalValor: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },

  btFinalizar: {
    backgroundColor: colors.primary,
    paddingVertical: 14, borderRadius: radius.md,
    alignItems: 'center', marginTop: 10,
  },
  btFinalizarTxt: { color: colors.textInverse, fontWeight: '700', fontSize: 15 },

  formasBox: { flexDirection: 'row', gap: 8, marginTop: 8, marginBottom: 12, flexWrap: 'wrap' },
  formaBt: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fff' },
  formaAtivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  formaTxt: { fontSize: 13, color: colors.textPrimary },
  formaAtivoTxt: { color: '#fff', fontWeight: '700' },

  linhaResumo: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 4, marginTop: 4,
  },
  linhaLabel: { color: colors.textSecondary, fontSize: 12 },
  linhaValor: { color: colors.textPrimary, fontSize: 13, fontWeight: '600' },
});
