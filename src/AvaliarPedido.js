import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, Alert,
} from 'react-native';
import Icon from '@expo/vector-icons/Feather';
import { Ratings } from './services/storage';
import { colors, spacing, radius, shadow } from './theme/theme';

function Estrelas({ valor, onChange, tamanho = 30 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity key={n} onPress={() => onChange(n)} activeOpacity={0.7}>
          <Icon
            name="star"
            size={tamanho}
            color={n <= valor ? '#F5B400' : colors.divider}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function AvaliarPedido({ navigation, route }) {
  const { orderId, restaurantId, restaurantNome } = route?.params || {};
  const [notaEntrega, setNotaEntrega] = useState(0);
  const [notaRestaurante, setNotaRestaurante] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    if (notaEntrega === 0 || notaRestaurante === 0) {
      return Alert.alert('Avaliação', 'Selecione as notas de entrega e restaurante.');
    }
    setEnviando(true);
    try {
      await Ratings.add({
        orderId,
        restaurantId,
        entrega: notaEntrega,
        restaurante: notaRestaurante,
        comentario,
      });
      Alert.alert(
        'Obrigado!',
        'Sua avaliação foi registrada.',
        [{ text: 'OK', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Home' }] }) }]
      );
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível enviar a avaliação.');
      setEnviando(false);
    }
  }

  function pular() {
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }}>
      <View style={styles.cabecalho}>
        <Icon name="award" size={36} color={colors.primary} />
        <Text style={styles.titulo}>Como foi seu pedido?</Text>
        <Text style={styles.sub}>{restaurantNome || 'Restaurante'}</Text>
      </View>

      <View style={styles.bloco}>
        <Text style={styles.label}>Entrega</Text>
        <Text style={styles.descricao}>Avalie o tempo e o atendimento do entregador.</Text>
        <View style={{ alignItems: 'center', marginTop: 12 }}>
          <Estrelas valor={notaEntrega} onChange={setNotaEntrega} />
        </View>
      </View>

      <View style={styles.bloco}>
        <Text style={styles.label}>Restaurante</Text>
        <Text style={styles.descricao}>Avalie a comida, embalagem e preço.</Text>
        <View style={{ alignItems: 'center', marginTop: 12 }}>
          <Estrelas valor={notaRestaurante} onChange={setNotaRestaurante} />
        </View>
      </View>

      <View style={styles.bloco}>
        <Text style={styles.label}>Comentário (opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Conte como foi sua experiência..."
          multiline
          maxLength={300}
          value={comentario}
          onChangeText={setComentario}
          placeholderTextColor={colors.placeholder}
        />
      </View>

      <TouchableOpacity
        style={[styles.btEnviar, enviando && { opacity: 0.6 }]}
        onPress={enviar}
        disabled={enviando}
      >
        <Icon name="send" size={18} color={colors.textInverse} />
        <Text style={styles.btEnviarTxt}>{enviando ? 'Enviando...' : 'Enviar avaliação'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btPular} onPress={pular}>
        <Text style={styles.btPularTxt}>Avaliar depois</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  cabecalho: { alignItems: 'center', marginBottom: spacing.lg, marginTop: spacing.md },
  titulo: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginTop: 8 },
  sub: { color: colors.textSecondary, marginTop: 4 },

  bloco: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  label: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  descricao: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1, borderColor: colors.divider,
    borderRadius: radius.md, padding: spacing.md,
    minHeight: 80, textAlignVertical: 'top',
    color: colors.textPrimary,
    marginTop: 10,
  },

  btEnviar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 16, borderRadius: radius.md,
    ...shadow.card,
  },
  btEnviarTxt: { color: colors.textInverse, fontWeight: '700', fontSize: 15 },

  btPular: { marginTop: 12, alignItems: 'center', paddingVertical: 10 },
  btPularTxt: { color: colors.textSecondary, fontSize: 13 },
});
