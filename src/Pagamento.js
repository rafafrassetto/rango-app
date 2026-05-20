import React, { useMemo, useState } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert,
  TextInput, Platform,
} from 'react-native';
import Icon from '@expo/vector-icons/Feather';
import { Orders } from './services/storage';
import { colors, spacing, radius, shadow } from './theme/theme';
import { formatBRL } from './services/format';

let Clipboard = null;
try { Clipboard = require('expo-clipboard'); } catch (e) { /* opcional */ }

const ROTULOS = {
  pix: 'PIX',
  dinheiro: 'Dinheiro',
  cartao_debito: 'Cartão de débito',
  cartao_credito: 'Cartão de crédito',
};

function gerarPixCopiaCola(restaurantNome, total) {
  const nome = String(restaurantNome || 'Restaurante').trim().toUpperCase().slice(0, 25);
  const chave = `pix-${nome.toLowerCase().replace(/[^a-z0-9]/g, '')}@rangoapp.com.br`;
  const valor = Number(total || 0).toFixed(2);
  return `00020126580014BR.GOV.BCB.PIX0136${chave}5204000053039865802BR5910${nome}6009CRICIUMA62070503***6304ABCD|${valor}`;
}

export default function Pagamento({ navigation, route }) {
  const { orderId, formaPagamento, total, restaurantNome, restaurantId } = route?.params || {};
  const [processando, setProcessando] = useState(false);

  const [numCartao, setNumCartao] = useState('');
  const [nomeCartao, setNomeCartao] = useState('');
  const [validadeCartao, setValidadeCartao] = useState('');
  const [cvvCartao, setCvvCartao] = useState('');
  const [trocoPara, setTrocoPara] = useState('');

  const pixCode = useMemo(
    () => gerarPixCopiaCola(restaurantNome, total),
    [restaurantNome, total]
  );

  async function copiarPix() {
    try {
      if (Clipboard?.setStringAsync) {
        await Clipboard.setStringAsync(pixCode);
      } else if (Platform.OS === 'web' && navigator?.clipboard) {
        await navigator.clipboard.writeText(pixCode);
      }
      Alert.alert('Copiado', 'Código PIX copiado. Cole no seu banco para pagar.');
    } catch (e) {
      Alert.alert('Copiado', 'Selecione e copie o código manualmente.');
    }
  }

  async function confirmar() {
    if (formaPagamento === 'cartao_debito' || formaPagamento === 'cartao_credito') {
      if (numCartao.replace(/\s/g, '').length < 13) {
        return Alert.alert('Cartão', 'Informe o número do cartão.');
      }
      if (!nomeCartao.trim()) {
        return Alert.alert('Cartão', 'Informe o nome impresso no cartão.');
      }
      if (validadeCartao.length < 5) {
        return Alert.alert('Cartão', 'Informe a validade (MM/AA).');
      }
      if (cvvCartao.length < 3) {
        return Alert.alert('Cartão', 'Informe o CVV.');
      }
    }

    setProcessando(true);
    try {
      await Orders.update(orderId, { status: 'Em preparo', forma_pagamento: formaPagamento });
      navigation.replace('AcompanharPedido', {
        orderId,
        restaurantId,
        restaurantNome,
        formaPagamento,
        total,
      });
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível confirmar o pagamento.');
      setProcessando(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }}>
      <View style={styles.cardTotal}>
        <Text style={styles.cardTotalLabel}>Total a pagar</Text>
        <Text style={styles.cardTotalValor}>{formatBRL(total)}</Text>
        <Text style={styles.cardTotalMeio}>{ROTULOS[formaPagamento] || 'Pagamento'}</Text>
      </View>

      {formaPagamento === 'pix' && (
        <View style={styles.bloco}>
          <Text style={styles.titulo}>Pague com PIX</Text>
          <Text style={styles.descricao}>
            Copie o código abaixo e cole no aplicativo do seu banco para concluir o pagamento.
          </Text>
          <View style={styles.codigoBox}>
            <Text style={styles.codigoTxt} selectable numberOfLines={4}>{pixCode}</Text>
          </View>
          <TouchableOpacity style={styles.btSecundario} onPress={copiarPix}>
            <Icon name="copy" size={16} color={colors.primary} />
            <Text style={styles.btSecundarioTxt}>Copiar código PIX</Text>
          </TouchableOpacity>
        </View>
      )}

      {formaPagamento === 'dinheiro' && (
        <View style={styles.bloco}>
          <Text style={styles.titulo}>Pagamento em dinheiro</Text>
          <Text style={styles.descricao}>
            Você pagará {formatBRL(total)} em dinheiro ao entregador. Se precisar de troco, informe abaixo:
          </Text>
          <Text style={styles.label}>Troco para</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 50,00"
            keyboardType="numeric"
            value={trocoPara}
            onChangeText={setTrocoPara}
            placeholderTextColor={colors.placeholder}
          />
        </View>
      )}

      {(formaPagamento === 'cartao_debito' || formaPagamento === 'cartao_credito') && (
        <View style={styles.bloco}>
          <Text style={styles.titulo}>
            {formaPagamento === 'cartao_debito' ? 'Cartão de débito' : 'Cartão de crédito'}
          </Text>
          <Text style={styles.descricao}>Informe os dados do cartão para concluir o pagamento.</Text>

          <Text style={styles.label}>Número do cartão</Text>
          <TextInput
            style={styles.input}
            placeholder="0000 0000 0000 0000"
            keyboardType="numeric"
            value={numCartao}
            onChangeText={setNumCartao}
            maxLength={19}
            placeholderTextColor={colors.placeholder}
          />

          <Text style={styles.label}>Nome impresso no cartão</Text>
          <TextInput
            style={styles.input}
            placeholder="Como está no cartão"
            value={nomeCartao}
            onChangeText={setNomeCartao}
            placeholderTextColor={colors.placeholder}
          />

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Validade</Text>
              <TextInput
                style={styles.input}
                placeholder="MM/AA"
                keyboardType="numeric"
                value={validadeCartao}
                onChangeText={setValidadeCartao}
                maxLength={5}
                placeholderTextColor={colors.placeholder}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>CVV</Text>
              <TextInput
                style={styles.input}
                placeholder="000"
                keyboardType="numeric"
                value={cvvCartao}
                onChangeText={setCvvCartao}
                maxLength={4}
                secureTextEntry
                placeholderTextColor={colors.placeholder}
              />
            </View>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.btPrincipal, processando && { opacity: 0.6 }]}
        onPress={confirmar}
        disabled={processando}
      >
        <Icon name="check" size={18} color={colors.textInverse} />
        <Text style={styles.btPrincipalTxt}>
          {processando ? 'Processando...' : 'Confirmar pagamento'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  cardTotal: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  cardTotalLabel: { color: '#FFD8DA', fontSize: 12 },
  cardTotalValor: { color: '#fff', fontSize: 28, fontWeight: '700', marginTop: 4 },
  cardTotalMeio: { color: '#FFD8DA', fontSize: 12, marginTop: 4 },

  bloco: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  titulo: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 },
  descricao: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
  label: { color: colors.textPrimary, fontWeight: '600', fontSize: 13, marginTop: 12, marginBottom: 6 },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1, borderColor: colors.divider,
    borderRadius: radius.md, padding: spacing.md,
    color: colors.textPrimary,
  },

  codigoBox: {
    marginTop: 14,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1, borderColor: colors.divider,
  },
  codigoTxt: { color: colors.textPrimary, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 11 },

  btSecundario: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginTop: 12,
    paddingVertical: 12, borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
  },
  btSecundarioTxt: { color: colors.primary, fontWeight: '700' },

  btPrincipal: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.md,
    ...shadow.card,
  },
  btPrincipalTxt: { color: colors.textInverse, fontWeight: '700', fontSize: 15 },
});
