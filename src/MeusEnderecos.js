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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Addresses } from './services/storage';
import { colors, spacing, radius, shadow } from './theme/theme';

const KEY_END_ENTREGA = '@rango:enderecoEntrega';

export default function MeusEnderecos({ navigation }) {
  const [enderecos, setEnderecos] = useState([]);
  const [endEntregaId, setEndEntregaId] = useState(null);

  const carregar = useCallback(async () => {
    setEnderecos(await Addresses.list());
    const salvo = await AsyncStorage.getItem(KEY_END_ENTREGA);
    if (salvo) setEndEntregaId(salvo);
  }, []);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  async function selecionarParaEntrega(id) {
    await AsyncStorage.setItem(KEY_END_ENTREGA, String(id));
    setEndEntregaId(String(id));
    Alert.alert('Endereço selecionado', 'Este endereço será usado na próxima entrega.');
  }

  function confirmarExclusao(id) {
    Alert.alert('Excluir endereço', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive',
        onPress: async () => { await Addresses.remove(id); carregar(); },
      },
    ]);
  }

  function renderItem({ item }) {
    const eSelecionado = String(item.id) === String(endEntregaId);
    return (
      <View style={[styles.card, eSelecionado && styles.cardSelecionado]}>
        <View style={styles.cardHeader}>
          <Icon name="map-pin" size={16} color={eSelecionado ? colors.primary : colors.textSecondary} />
          <Text style={styles.titulo}>{item.apelido || 'Endereço'}</Text>
          {eSelecionado && (
            <View style={styles.tagEntrega}>
              <Text style={styles.tagEntregaTxt}>Para entrega</Text>
            </View>
          )}
        </View>
        <Text style={styles.linha}>
          {item.rua}, {item.numero}
          {item.complemento ? ` - ${item.complemento}` : ''}
        </Text>
        <Text style={styles.linha}>
          {item.bairro} {item.cidade ? `- ${item.cidade}` : ''}
          {item.estado ? `/${item.estado}` : ''}
        </Text>
        <Text style={styles.linha}>CEP: {item.cep}</Text>

        {!eSelecionado && (
          <TouchableOpacity
            style={styles.btSelecionar}
            onPress={() => selecionarParaEntrega(item.id)}
          >
            <Icon name="check-circle" size={14} color={colors.primary} />
            <Text style={styles.btSelecionarTxt}>Selecionar para entrega</Text>
          </TouchableOpacity>
        )}

        <View style={styles.acoes}>
          <TouchableOpacity
            style={styles.btEditar}
            onPress={() => navigation.navigate('EditarEndereco', { id: item.id })}
          >
            <Text style={styles.btEditarTxt}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btExcluir} onPress={() => confirmarExclusao(item.id)}>
            <Text style={styles.btExcluirTxt}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.tituloTela}>Meus endereços</Text>
      <TouchableOpacity style={styles.btNovo} onPress={() => navigation.navigate('EditarEndereco', {})}>
        <Icon name="plus" size={16} color={colors.textInverse} />
        <Text style={styles.btNovoTxt}>Novo endereço</Text>
      </TouchableOpacity>

      <FlatList
        data={enderecos}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.vazioBox}>
            <Text style={styles.vazioTxt}>Nenhum endereço cadastrado ainda.</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  tituloTela: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: 10 },
  btNovo: {
    backgroundColor: colors.primary,
    paddingVertical: 12, borderRadius: radius.md,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6,
    marginBottom: 12,
  },
  btNovoTxt: { color: colors.textInverse, fontWeight: '700' },
  card: {
    backgroundColor: colors.surface, padding: spacing.md,
    borderRadius: radius.lg, marginBottom: 10, ...shadow.card,
  },
  cardSelecionado: { borderWidth: 2, borderColor: colors.primary },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  titulo: { fontWeight: '700', color: colors.textPrimary, flex: 1 },
  linha: { color: colors.textSecondary, fontSize: 13, marginVertical: 1 },
  tagEntrega: {
    backgroundColor: colors.primaryLight, paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: radius.pill,
  },
  tagEntregaTxt: { color: colors.primary, fontSize: 10, fontWeight: '700' },
  btSelecionar: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: colors.primary,
    borderRadius: radius.sm, paddingVertical: 8, paddingHorizontal: 12,
    marginTop: 8, alignSelf: 'flex-start',
  },
  btSelecionarTxt: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  acoes: { flexDirection: 'row', gap: 8, marginTop: 10 },
  btEditar: {
    flex: 1, backgroundColor: colors.primary,
    paddingVertical: 10, borderRadius: radius.sm, alignItems: 'center',
  },
  btEditarTxt: { color: colors.textInverse, fontWeight: '700' },
  btExcluir: {
    flex: 1, backgroundColor: colors.surfaceAlt,
    paddingVertical: 10, borderRadius: radius.sm, alignItems: 'center',
  },
  btExcluirTxt: { color: colors.danger, fontWeight: '700' },
  vazioBox: { alignItems: 'center', padding: 30 },
  vazioTxt: { color: colors.textSecondary },
});
