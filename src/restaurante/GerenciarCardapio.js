import React, { useCallback, useState } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity, Alert, Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '@expo/vector-icons/Feather';
import { Catalogo, IMAGENS } from '../services/catalogo';
import { RestauranteAuth } from '../services/restauranteAuth';
import { colors, spacing, radius, shadow } from '../theme/theme';

function fmt(g) {
  if (g >= 1000) return `${(g / 1000).toFixed(g % 1000 === 0 ? 0 : 2)}kg`;
  return `${g}g`;
}

export default function GerenciarCardapio({ navigation, onChange }) {
  const [pratos, setPratos] = useState([]);

  const carregar = useCallback(async () => {
    const sessao = await RestauranteAuth.getSession();
    if (sessao?.id) {
      setPratos(await Catalogo.listByRestaurant(sessao.id, { apenasDisponiveis: false }));
    } else {
      setPratos([]);
    }
  }, []);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  function excluir(p) {
    Alert.alert('Excluir prato', `Remover "${p.nome}" do cardápio?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive',
        onPress: async () => {
          await Catalogo.remove(p.id);
          carregar();
          onChange && onChange();
        },
      },
    ]);
  }

  async function toggleDisponivel(p) {
    await Catalogo.upsert({ ...p, disponivel: !p.disponivel });
    carregar();
    onChange && onChange();
  }

  return (
    <View>
      <View style={styles.headerLinha}>
        <Text style={styles.titulo}>Pratos cadastrados</Text>
        <TouchableOpacity
          style={styles.btNovo}
          onPress={() => navigation.navigate('EditarPrato', { id: null })}
        >
          <Icon name="plus" size={14} color={colors.textInverse} />
          <Text style={styles.btNovoTxt}>Novo</Text>
        </TouchableOpacity>
      </View>

      {pratos.length === 0 ? (
        <Text style={styles.vazio}>Nenhum prato cadastrado.</Text>
      ) : (
        pratos.map((p) => (
          <View key={p.id} style={styles.card}>
            <Image
              source={IMAGENS[p.imagemKey] || IMAGENS.arrozbranco}
              style={styles.img}
              resizeMode="cover"
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={styles.linha}>
                <Text style={styles.nome}>{p.nome}</Text>
                {!p.disponivel && (
                  <View style={styles.tagInd}><Text style={styles.tagIndTxt}>Indisponível</Text></View>
                )}
              </View>
              <Text style={styles.preco}>R$ {p.precoPorKg.toFixed(2)} / kg</Text>
              <Text style={styles.regra}>
                {fmt(p.pesoMinG)} – {fmt(p.pesoMaxG)} · passo {fmt(p.passoG)}
              </Text>

              <View style={styles.acoes}>
                <TouchableOpacity
                  style={styles.btEditar}
                  onPress={() => navigation.navigate('EditarPrato', { id: p.id })}
                >
                  <Icon name="edit-2" size={12} color={colors.textInverse} />
                  <Text style={styles.btEditarTxt}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btToggle} onPress={() => toggleDisponivel(p)}>
                  <Text style={styles.btToggleTxt}>
                    {p.disponivel ? 'Pausar' : 'Ativar'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btExcluir} onPress={() => excluir(p)}>
                  <Icon name="trash-2" size={14} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerLinha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  titulo: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  vazio: { color: colors.textSecondary, textAlign: 'center', marginTop: 20 },

  btNovo: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: radius.pill,
  },
  btNovoTxt: { color: colors.textInverse, fontWeight: '700', fontSize: 12 },

  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface, padding: spacing.md,
    borderRadius: radius.lg, marginBottom: 10, ...shadow.card,
  },
  img: { width: 72, height: 72, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nome: { fontWeight: '700', color: colors.textPrimary, fontSize: 14 },
  tagInd: { backgroundColor: colors.surfaceAlt, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.pill },
  tagIndTxt: { color: colors.danger, fontSize: 10, fontWeight: '700' },
  preco: { color: colors.primary, fontWeight: '700', marginTop: 2 },
  regra: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },

  acoes: { flexDirection: 'row', gap: 6, marginTop: 6 },
  btEditar: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: radius.sm,
  },
  btEditarTxt: { color: colors.textInverse, fontSize: 11, fontWeight: '700' },
  btToggle: {
    paddingHorizontal: 10, paddingVertical: 6,
    backgroundColor: colors.surfaceAlt, borderRadius: radius.sm,
  },
  btToggleTxt: { color: colors.textPrimary, fontSize: 11, fontWeight: '700' },
  btExcluir: {
    paddingHorizontal: 8, paddingVertical: 6,
    backgroundColor: colors.surfaceAlt, borderRadius: radius.sm,
  },
});
