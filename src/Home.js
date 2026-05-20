import React, { useState, useCallback } from 'react';
import {
  Image,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  ToastAndroid,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '@expo/vector-icons/Feather';
import cacarola from '../assets/cacarola.png';
import sabores from '../assets/sabores.png';
import rest from '../assets/rest.png';
import { colors, spacing, radius, shadow } from './theme/theme';
import { Addresses, Ratings } from './services/storage';
import { Restaurants } from './services/restaurants';
import { obterClimaCriciuma } from './services/clima';
import { useShake } from './hooks/useShake';

const IMG_FALLBACK = [cacarola, sabores, rest];

export default function Home({ navigation }) {
  const [enderecoAtual, setEnderecoAtual] = useState('Buscando endereço...');
  const [restaurantes, setRestaurantes] = useState([]);
  const [clima, setClima] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    const lista = await Addresses.list();
    if (lista.length > 0) {
      const e = lista[lista.length - 1];
      setEnderecoAtual(`${e.rua}, ${e.numero}`);
    } else {
      setEnderecoAtual('Cadastrar endereço');
    }

    const [rs, c] = await Promise.all([
      Restaurants.list(),
      obterClimaCriciuma(),
    ]);
    const comNotas = await Promise.all(
      rs.map(async (r) => ({ ...r, rating: await Ratings.avgForRestaurant(r.id) }))
    );
    comNotas.sort((a, b) => {
      if ((b.rating?.total || 0) !== (a.rating?.total || 0)) {
        return (b.rating?.media || 0) - (a.rating?.media || 0);
      }
      return (b.rating?.media || 0) - (a.rating?.media || 0);
    });
    setRestaurantes(comNotas);
    setClima(c);
    setCarregando(false);
  }, []);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  // Shake pra atualizar lista
  useShake(() => {
    if (Platform.OS === 'android') {
      ToastAndroid.show('Atualizando...', ToastAndroid.SHORT);
    }
    carregar();
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity
          style={styles.header}
          onPress={() => navigation.navigate('MeusEnderecos')}
          activeOpacity={0.7}
        >
          <Text style={styles.headerEntrega}>Entrega em</Text>
          <View style={styles.headerLinha}>
            <Icon name="map-pin" size={16} color={colors.primary} />
            <Text style={styles.headerEndereco} numberOfLines={1}>{enderecoAtual}</Text>
            <Icon name="chevron-down" size={16} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>

        {clima && (
          <View style={styles.climaBox}>
            <Icon name={clima.icone} size={28} color={colors.primary} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.climaTemp}>
                {clima.tempC}°C em Criciúma
              </Text>
              <Text style={styles.climaDesc}>
                {clima.descricao} · sensação {clima.sensacaoC}°C · umidade {clima.umidade}%
              </Text>
            </View>
          </View>
        )}

        <View style={styles.dicaShake}>
          <Icon name="smartphone" size={11} color={colors.textMuted} />
          <Text style={styles.dicaShakeTxt}>
            Dica: chacoalhe o celular para atualizar a lista
          </Text>
        </View>

        <Text style={styles.tituloSecao}>Restaurantes próximos</Text>

        {carregando ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
        ) : restaurantes.length === 0 ? (
          <Text style={styles.vazio}>Nenhum restaurante disponível no momento.</Text>
        ) : (
          restaurantes.map((r, idx) => (
            <TouchableOpacity
              key={r.id}
              style={styles.cardRest}
              onPress={() =>
                navigation.navigate('CardapioCacarola', {
                  restaurantId: r.id,
                  nome: r.nome,
                })
              }
              activeOpacity={0.85}
            >
              <Image style={styles.imgRest} source={IMG_FALLBACK[idx % IMG_FALLBACK.length]} />
              <View style={styles.infoRest}>
                <Text style={styles.nomeRest}>{r.nome}</Text>
                <View style={styles.linhaInfo}>
                  <Icon name="star" size={12} color={r.rating?.total > 0 ? '#F5B400' : colors.textMuted} />
                  <Text style={styles.txtSec}>
                    {r.rating?.total > 0
                      ? `${r.rating.media.toFixed(1).replace('.', ',')} (${r.rating.total})`
                      : 'Sem avaliações'}
                  </Text>
                </View>
                <View style={styles.linhaInfo}>
                  <Icon name="phone" size={11} color={colors.textSecondary} />
                  <Text style={styles.txtSec}>{r.telefone || '—'}</Text>
                </View>
                <View style={styles.tagAberto}>
                  <Text style={styles.tagAbertoTxt}>ABERTO</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        <Text style={styles.tituloSecao}>Atalhos</Text>
        <View style={styles.atalhosBox}>
          <TouchableOpacity style={styles.atalho} onPress={() => navigation.navigate('MeusPedidos')}>
            <View style={styles.atalhoIcon}><Icon name="package" size={20} color={colors.primary} /></View>
            <Text style={styles.atalhoTxt}>Meus pedidos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.atalho} onPress={() => navigation.navigate('MeusEnderecos')}>
            <View style={styles.atalhoIcon}><Icon name="map-pin" size={20} color={colors.primary} /></View>
            <Text style={styles.atalhoTxt}>Endereços</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.atalho} onPress={() => navigation.navigate('Localizacao')}>
            <View style={styles.atalhoIcon}><Icon name="map" size={20} color={colors.primary} /></View>
            <Text style={styles.atalhoTxt}>Mapa</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.atalho} onPress={() => navigation.navigate('Perfil')}>
            <View style={styles.atalhoIcon}><Icon name="user" size={20} color={colors.primary} /></View>
            <Text style={styles.atalhoTxt}>Perfil</Text>
          </TouchableOpacity>
        </View>
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
  scroll: { padding: spacing.lg, paddingBottom: 100 },

  header: { marginBottom: spacing.md },
  headerEntrega: { color: colors.textSecondary, fontSize: 12 },
  headerLinha: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  headerEndereco: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, flex: 1 },

  climaBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, padding: spacing.md,
    borderRadius: radius.lg, marginBottom: 8, ...shadow.card,
  },
  climaTemp: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  climaDesc: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },

  dicaShake: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginBottom: spacing.md, paddingHorizontal: 4,
  },
  dicaShakeTxt: { color: colors.textMuted, fontSize: 10 },

  tituloSecao: {
    fontSize: 17, fontWeight: '700', color: colors.textPrimary,
    marginTop: spacing.lg, marginBottom: spacing.md,
  },
  vazio: { color: colors.textSecondary, marginVertical: 12 },

  cardRest: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: 10,
    ...shadow.card,
  },
  imgRest: { width: 64, height: 64, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
  infoRest: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  nomeRest: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  linhaInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  txtSec: { color: colors.textSecondary, fontSize: 12 },
  tagAberto: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5EC',
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: radius.pill, marginTop: 6,
  },
  tagAbertoTxt: { color: colors.success, fontSize: 10, fontWeight: '700' },

  atalhosBox: {
    flexDirection: 'row', flexWrap: 'wrap',
    backgroundColor: colors.surface,
    borderRadius: radius.lg, padding: spacing.md, ...shadow.card,
  },
  atalho: { width: '25%', alignItems: 'center', paddingVertical: 8 },
  atalhoIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  atalhoTxt: { fontSize: 11, color: colors.textPrimary, textAlign: 'center' },

  fab: {
    position: 'absolute', right: 20, bottom: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    ...shadow.card,
  },
});
