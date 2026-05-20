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
import { Cart, Orders, Addresses } from './services/storage';
import { gerarReciboPdf } from './services/reciboPdf';
import { colors, spacing, radius, shadow } from './theme/theme';

function formatPeso(g) {
  if (g >= 1000) return `${(g / 1000).toFixed(g % 1000 === 0 ? 0 : 2)} kg`;
  return `${g} g`;
}

export default function FinalizarPedido({ navigation }) {
  const [itens, setItens] = useState([]);
  const [enderecos, setEnderecos] = useState([]);
  const [enderecoSelecionado, setEnderecoSelecionado] = useState(null);
  const [total, setTotal] = useState(0);
  const [formaPagamento, setFormaPagamento] = useState('pix');

  const carregar = useCallback(async () => {
    const cart = await Cart.list();
    setItens(cart);
    setTotal(cart.reduce((acc, item) => acc + Number(item.preco || 0), 0));
    const ends = await Addresses.list();
    setEnderecos(ends);
    if (ends.length > 0 && !enderecoSelecionado) setEnderecoSelecionado(ends[0]);
  }, [enderecoSelecionado]);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  async function finalizar() {
    if (itens.length === 0) return Alert.alert('Atenção', 'Carrinho vazio.');
    if (!enderecoSelecionado)
      return Alert.alert('Endereço', 'Cadastre um endereço de entrega antes de finalizar.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cadastrar', onPress: () => navigation.navigate('EditarEndereco', {}) },
      ]);

    const pedido = await Orders.add({ itens, total, endereco: enderecoSelecionado, forma_pagamento: formaPagamento });
    await Cart.clear();

    Alert.alert(
      'Pedido enviado!',
      `Seu pedido #${pedido.id.slice(-5)} foi registrado. Deseja gerar o recibo em PDF?`,
      [
        { text: 'Não', onPress: () => navigation.navigate('MeusPedidos') },
        {
          text: 'Gerar PDF',
          onPress: async () => {
            try { await gerarReciboPdf(pedido); }
            catch (e) { Alert.alert('PDF', 'Não foi possível gerar o PDF.'); }
            navigation.navigate('MeusPedidos');
          },
        },
      ]
    );
  }

  function renderItem({ item }) {
    return (
      <View style={styles.itemBox}>
        <Text style={styles.itemNome}>{item.nome}</Text>
        <Text style={styles.itemDetalhe}>
          {formatPeso(item.quantidade)} · R$ {Number(item.preco).toFixed(2)}
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

      <View style={styles.totalBox}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValor}>R$ {total.toFixed(2)}</Text>
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
});
