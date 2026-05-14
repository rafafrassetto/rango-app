import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import Icon from '@expo/vector-icons/Feather';
import cartao from '../assets/cartao.png';
import pix from '../assets/pix.png';
import { colors, spacing, radius, shadow } from './theme/theme';

const METODOS = [
  { id: 'credito', nome: 'Cartão de crédito', img: cartao, desc: 'Visa, Master, Elo...' },
  { id: 'debito', nome: 'Cartão de débito', img: cartao, desc: 'Pague direto da conta' },
  { id: 'pix', nome: 'Pix', img: pix, desc: 'Aprovação imediata' },
  { id: 'dinheiro', nome: 'Dinheiro', icone: 'dollar-sign', desc: 'Pague na entrega' },
];

export default function Pagar({ navigation }) {
  const [selecionado, setSelecionado] = useState('credito');

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Forma de pagamento</Text>
      {METODOS.map((m) => {
        const ativo = selecionado === m.id;
        return (
          <TouchableOpacity
            key={m.id}
            style={[styles.card, ativo && styles.cardAtivo]}
            onPress={() => setSelecionado(m.id)}
            activeOpacity={0.85}
          >
            <View style={styles.cardImgBox}>
              {m.img
                ? <Image source={m.img} style={styles.cardImg} resizeMode="contain" />
                : <Icon name={m.icone} size={24} color={colors.primary} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardNome}>{m.nome}</Text>
              <Text style={styles.cardDesc}>{m.desc}</Text>
            </View>
            <Icon
              name={ativo ? 'check-circle' : 'circle'}
              size={20}
              color={ativo ? colors.primary : colors.divider}
            />
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity style={styles.btConfirmar} onPress={() => navigation.goBack()}>
        <Text style={styles.btConfirmarTxt}>Confirmar forma de pagamento</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  titulo: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, padding: spacing.md,
    borderRadius: radius.lg, marginBottom: 10, ...shadow.card,
    borderWidth: 2, borderColor: 'transparent',
  },
  cardAtivo: { borderColor: colors.primary },
  cardImgBox: {
    width: 50, height: 50, borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  cardImg: { width: 36, height: 36 },
  cardNome: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  cardDesc: { color: colors.textSecondary, fontSize: 12 },

  btConfirmar: {
    backgroundColor: colors.primary, paddingVertical: 14,
    borderRadius: radius.md, alignItems: 'center', marginTop: 18,
  },
  btConfirmarTxt: { color: colors.textInverse, fontWeight: '700' },
});
