import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '@expo/vector-icons/Feather';
import { Catalogo, IMAGENS } from './services/catalogo';
import { colors, spacing, radius, shadow } from './theme/theme';

export default function CardapioCacarola({ navigation, route }) {
  const restaurantId = route?.params?.restaurantId;
  const restaurantNome = route?.params?.nome || 'Restaurante';

  const [pratos, setPratos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setCarregando(true);
        const lista = restaurantId
          ? await Catalogo.listByRestaurant(restaurantId)
          : await Catalogo.list();
        setPratos(lista);
        setCarregando(false);
      })();
    }, [restaurantId])
  );

  function abrirPrato(p) {
    navigation.navigate('Arroz', { id: p.id, restaurantNome });
  }

  if (carregando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}>
        <View style={styles.banner}>
          <Text style={styles.bannerTitulo}>{restaurantNome}</Text>
          <View style={styles.bannerInfo}>
            <Icon name="package" size={12} color={colors.textSecondary} />
            <Text style={styles.bannerInfoTxt}>
              {pratos.length} {pratos.length === 1 ? 'prato disponível' : 'pratos disponíveis'}
            </Text>
          </View>
          <View style={styles.bannerTag}>
            <Text style={styles.bannerTagTxt}>Comida por kg</Text>
          </View>
        </View>

        <Text style={styles.tituloSecao}>Pratos disponíveis</Text>

        {pratos.length === 0 ? (
          <Text style={styles.vazio}>
            Este restaurante ainda não cadastrou pratos disponíveis.
          </Text>
        ) : (
          pratos.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={styles.cardPrato}
              onPress={() => abrirPrato(p)}
              activeOpacity={0.85}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={styles.nome}>{p.nome}</Text>
                <Text style={styles.descricao} numberOfLines={2}>{p.descricao}</Text>
                <Text style={styles.preco}>
                  R$ {p.precoPorKg.toFixed(2)} <Text style={styles.precoUnid}>/ kg</Text>
                </Text>
                <Text style={styles.regra}>
                  {p.pesoMinG}g – {(p.pesoMaxG / 1000).toFixed(2)}kg
                </Text>
              </View>
              <Image
                source={IMAGENS[p.imagemKey] || IMAGENS.arrozbranco}
                style={styles.imagem}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Carrinho')}
        activeOpacity={0.85}
      >
        <Icon name="shopping-bag" size={22} color={colors.textInverse} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },

  banner: {
    backgroundColor: colors.surface,
    padding: spacing.lg, borderRadius: radius.lg, marginBottom: spacing.lg,
    ...shadow.card,
  },
  bannerTitulo: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  bannerInfo: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  bannerInfoTxt: { color: colors.textSecondary, fontSize: 12 },
  bannerTag: {
    backgroundColor: colors.primaryLight, alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radius.pill, marginTop: 8,
  },
  bannerTagTxt: { color: colors.primary, fontSize: 11, fontWeight: '700' },

  tituloSecao: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 10 },
  vazio: { color: colors.textSecondary, textAlign: 'center', marginTop: 30 },

  cardPrato: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: spacing.md, marginBottom: 10,
    borderRadius: radius.lg, ...shadow.card,
  },
  nome: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  descricao: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  preco: { color: colors.primary, fontWeight: '700', marginTop: 6 },
  precoUnid: { color: colors.textSecondary, fontWeight: '400', fontSize: 12 },
  regra: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  imagem: { width: 88, height: 88, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },

  fab: {
    position: 'absolute', right: 20, bottom: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', ...shadow.card,
  },
});
