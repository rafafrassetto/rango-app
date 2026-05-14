import React from 'react';
import {
  Image,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from '@expo/vector-icons/Feather';
import cacarola from '../assets/cacarola.png';
import sabores from '../assets/sabores.png';
import rest from '../assets/rest.png';
import { colors, spacing, radius, shadow } from './theme/theme';

const RESTAURANTES = [
  { id: '1', nome: 'Caçarola Restaurante', dist: '1,5 KM', img: cacarola, taxa: 'Grátis', rating: 4.7 },
  { id: '2', nome: 'Fábrica De Sabores', dist: '3 KM', img: sabores, taxa: 'R$ 4,99', rating: 4.5 },
  { id: '3', nome: 'Parrilla', dist: '5 KM', img: rest, taxa: 'R$ 6,99', rating: 4.3 },
];

export default function Home({ navigation }) {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header tipo "para você" */}
        <View style={styles.header}>
          <Text style={styles.headerEntrega}>Entrega em</Text>
          <View style={styles.headerLinha}>
            <Icon name="map-pin" size={16} color={colors.primary} />
            <Text style={styles.headerEndereco} numberOfLines={1}>Meu endereço atual</Text>
            <Icon name="chevron-down" size={16} color={colors.textSecondary} />
          </View>
        </View>

        <Text style={styles.tituloSecao}>Restaurantes próximos</Text>

        {RESTAURANTES.map((r) => (
          <TouchableOpacity
            key={r.id}
            style={styles.cardRest}
            onPress={() => navigation.navigate('CardapioCacarola')}
            activeOpacity={0.85}
          >
            <Image style={styles.imgRest} source={r.img} />
            <View style={styles.infoRest}>
              <Text style={styles.nomeRest}>{r.nome}</Text>
              <View style={styles.linhaInfo}>
                <Icon name="star" size={12} color={colors.accent} />
                <Text style={styles.txtSec}>{r.rating}</Text>
                <Text style={styles.bullet}>·</Text>
                <Text style={styles.txtSec}>{r.dist}</Text>
                <Text style={styles.bullet}>·</Text>
                <Text style={styles.txtSec}>{r.taxa}</Text>
              </View>
              <View style={styles.tagAberto}>
                <Text style={styles.tagAbertoTxt}>ABERTO</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

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

  header: { marginBottom: spacing.lg },
  headerEntrega: { color: colors.textSecondary, fontSize: 12 },
  headerLinha: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  headerEndereco: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, flex: 1 },

  tituloSecao: {
    fontSize: 17, fontWeight: '700', color: colors.textPrimary,
    marginTop: spacing.lg, marginBottom: spacing.md,
  },

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
  bullet: { color: colors.textMuted, marginHorizontal: 2 },
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
