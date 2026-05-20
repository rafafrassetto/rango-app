import React, { useCallback, useState } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '@expo/vector-icons/Feather';
import { Orders } from '../services/storage';
import { Catalogo } from '../services/catalogo';
import { RestauranteAuth } from '../services/restauranteAuth';
import { colors, spacing, radius, shadow } from '../theme/theme';

import GerenciarPedidos from './GerenciarPedidos';
import GerenciarCardapio from './GerenciarCardapio';
import ConfiguracoesRestaurante from './ConfiguracoesRestaurante';

const ABAS = [
  { id: 'pedidos', rotulo: 'Pedidos', icone: 'list' },
  { id: 'cardapio', rotulo: 'Cardápio', icone: 'book-open' },
  { id: 'config', rotulo: 'Configurações', icone: 'settings' },
];

export default function PainelRestaurante({ navigation }) {
  const [abaAtiva, setAbaAtiva] = useState('pedidos');
  const [restaurante, setRestaurante] = useState(null);
  const [stats, setStats] = useState({ pedidosHoje: 0, faturamento: 0, pratos: 0 });
  const [carregando, setCarregando] = useState(true);

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
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  }

  if (carregando) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      {/* Header com nome do restaurante */}
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

      {/* KPIs */}
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

      {/* Tabs */}
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

      {/* Conteúdo da aba */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.lg }}>
        {abaAtiva === 'pedidos' && <GerenciarPedidos navigation={navigation} onChange={carregar} />}
        {abaAtiva === 'cardapio' && <GerenciarCardapio navigation={navigation} onChange={carregar} />}
        {abaAtiva === 'config' && <ConfiguracoesRestaurante restaurante={restaurante} onUpdate={carregar} />}
      </ScrollView>
    </View>
  );
}

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
  tabTxt: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  tabTxtAtivo: { color: colors.primary },
});
