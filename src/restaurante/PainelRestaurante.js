import React, { useCallback, useState } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, CommonActions } from '@react-navigation/native';
import Icon from '@expo/vector-icons/Feather';
import { Orders, Ratings } from '../services/storage';
import { Catalogo } from '../services/catalogo';
import { RestauranteAuth } from '../services/restauranteAuth';
import { colors, spacing, radius, shadow } from '../theme/theme';

import GerenciarPedidos from './GerenciarPedidos';
import GerenciarCardapio from './GerenciarCardapio';
import ConfiguracoesRestaurante from './ConfiguracoesRestaurante';

const ABAS = [
  { id: 'pedidos', rotulo: 'Pedidos', icone: 'list' },
  { id: 'cardapio', rotulo: 'Cardápio', icone: 'book-open' },
  { id: 'avaliacoes', rotulo: 'Avaliações', icone: 'star' },
  { id: 'config', rotulo: 'Config', icone: 'settings' },
];

export default function PainelRestaurante({ navigation }) {
  const [abaAtiva, setAbaAtiva] = useState('pedidos');
  const [restaurante, setRestaurante] = useState(null);
  const [stats, setStats] = useState({ pedidosHoje: 0, faturamento: 0, pratos: 0 });
  const [carregando, setCarregando] = useState(true);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [avgRating, setAvgRating] = useState({ media: 0, total: 0 });

  const carregar = useCallback(async () => {
    setCarregando(true);
    const r = await RestauranteAuth.getSession();
    setRestaurante(r);

    const pedidos = r?.id ? await Orders.list({ restaurantId: r.id }) : [];
    const hoje = new Date().toDateString();
    const pedidosHoje = pedidos.filter((p) => new Date(p.data).toDateString() === hoje);
    const faturamento = pedidosHoje.reduce((a, p) => a + Number(p.total || 0), 0);
    const cat = r?.id
      ? await Catalogo.listByRestaurant(r.id, { apenasDisponiveis: false })
      : [];

    setStats({
      pedidosHoje: pedidosHoje.length,
      faturamento,
      pratos: cat.length,
    });

    if (r?.id) {
      const avals = await Ratings.list({ restaurantId: r.id });
      setAvaliacoes(avals);
      setAvgRating(await Ratings.avgForRestaurant(r.id));
    }
    setCarregando(false);
  }, []);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  function sair() {
    Alert.alert('Sair do painel', 'Deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair', style: 'destructive',
        onPress: async () => {
          await RestauranteAuth.clearSession();
          navigation.dispatch(
            CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] })
          );
        },
      },
    ]);
  }

  if (carregando) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerLabel}>Painel do restaurante</Text>
          <Text style={styles.headerNome} numberOfLines={1}>
            {restaurante?.nome || 'Restaurante'}
          </Text>
        </View>
        <TouchableOpacity style={styles.btSair} onPress={sair}>
          <Icon name="log-out" size={18} color={colors.textInverse} />
        </TouchableOpacity>
      </View>

      <View style={styles.kpisBox}>
        <View style={styles.kpi}>
          <Text style={styles.kpiValor}>{stats.pedidosHoje}</Text>
          <Text style={styles.kpiLabel}>Pedidos hoje</Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.kpiValor}>R$ {stats.faturamento.toFixed(2)}</Text>
          <Text style={styles.kpiLabel}>Faturamento</Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.kpiValor}>{stats.pratos}</Text>
          <Text style={styles.kpiLabel}>Pratos</Text>
        </View>
      </View>

      <View style={styles.tabsBox}>
        {ABAS.map((a) => {
          const ativo = abaAtiva === a.id;
          return (
            <TouchableOpacity
              key={a.id}
              style={[styles.tab, ativo && styles.tabAtivo]}
              onPress={() => setAbaAtiva(a.id)}
            >
              <Icon
                name={a.icone}
                size={a.id === 'config' ? 13 : 16}
                color={ativo ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.tabTxt, ativo && styles.tabTxtAtivo]}>{a.rotulo}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.lg }}>
        {abaAtiva === 'pedidos' && <GerenciarPedidos navigation={navigation} onChange={carregar} />}
        {abaAtiva === 'cardapio' && <GerenciarCardapio navigation={navigation} onChange={carregar} />}
        {abaAtiva === 'config' && <ConfiguracoesRestaurante restaurante={restaurante} onUpdate={carregar} />}
        {abaAtiva === 'avaliacoes' && <AbaAvaliacoes avaliacoes={avaliacoes} avgRating={avgRating} />}
      </ScrollView>
    </View>
  );
}

function Estrelinhas({ valor, tamanho = 16 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon key={n} name="star" size={tamanho} color={n <= Math.round(valor) ? '#F5B400' : colors.divider} />
      ))}
    </View>
  );
}

function AbaAvaliacoes({ avaliacoes, avgRating }) {
  if (avaliacoes.length === 0) {
    return (
      <View style={{ alignItems: 'center', padding: 40 }}>
        <Icon name="star" size={32} color={colors.divider} />
        <Text style={{ color: colors.textSecondary, marginTop: 12, textAlign: 'center' }}>
          Nenhuma avaliação recebida ainda.
        </Text>
      </View>
    );
  }
  return (
    <View>
      <View style={avStyles.resumoCard}>
        <Text style={avStyles.resumoMedia}>
          {Number(avgRating.media || 0).toFixed(1).replace('.', ',')}
        </Text>
        <Estrelinhas valor={avgRating.media} tamanho={22} />
        <Text style={avStyles.resumoTotal}>
          {avgRating.total} avaliação{avgRating.total !== 1 ? 'ões' : ''}
        </Text>
      </View>
      {avaliacoes.map((a) => (
        <View key={a.id} style={avStyles.card}>
          <View style={avStyles.linha}>
            <Text style={avStyles.label}>Entrega</Text>
            <Estrelinhas valor={a.entrega} />
          </View>
          <View style={avStyles.linha}>
            <Text style={avStyles.label}>Comida</Text>
            <Estrelinhas valor={a.restaurante} />
          </View>
          {a.comentario ? <Text style={avStyles.comentario}>"{a.comentario}"</Text> : null}
          <Text style={avStyles.data}>{new Date(a.data).toLocaleDateString('pt-BR')}</Text>
        </View>
      ))}
    </View>
  );
}

const avStyles = StyleSheet.create({
  resumoCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg,
    alignItems: 'center', marginBottom: spacing.lg, ...shadow.card,
  },
  resumoMedia: { fontSize: 42, fontWeight: '700', color: colors.textPrimary },
  resumoTotal: { color: colors.textSecondary, marginTop: 6 },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, marginBottom: 10, ...shadow.card,
  },
  linha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 4 },
  label: { color: colors.textSecondary, fontSize: 13 },
  comentario: { color: colors.textPrimary, fontStyle: 'italic', marginTop: 8, fontSize: 13 },
  data: { color: colors.textMuted, fontSize: 11, marginTop: 6, textAlign: 'right' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary, paddingTop: 40, paddingBottom: 16,
    paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center',
  },
  headerLabel: { color: '#FFD8DA', fontSize: 11 },
  headerNome: { color: colors.textInverse, fontSize: 18, fontWeight: '700' },
  btSair: { padding: 8 },
  kpisBox: {
    flexDirection: 'row', marginHorizontal: spacing.lg, marginTop: 20,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, ...shadow.card,
  },
  kpi: { flex: 1, alignItems: 'center' },
  kpiValor: { fontWeight: '700', fontSize: 17, color: colors.textPrimary },
  kpiLabel: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
  tabsBox: {
    flexDirection: 'row', marginHorizontal: spacing.lg, marginTop: 14,
    backgroundColor: colors.surface, borderRadius: radius.pill, padding: 4, ...shadow.card,
  },
  tab: {
    flex: 1, paddingVertical: 8, borderRadius: radius.pill,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  tabAtivo: { backgroundColor: colors.primaryLight },
  tabTxt: { color: colors.textSecondary, fontSize: 11, fontWeight: '600' },
  tabTxtAtivo: { color: colors.primary },
});
