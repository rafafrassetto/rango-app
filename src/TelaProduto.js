import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Icon from '@expo/vector-icons/Feather';
import { Cart, Weights } from './services/storage';
import { Catalogo, IMAGENS, PRESETS_FOME } from './services/catalogo';
import { colors, spacing, radius, shadow } from './theme/theme';
import { formatBRL, formatPeso as formatarPeso } from './services/format';

function clampPeso(valor, prato) {
  if (!prato) return valor;
  return Math.max(prato.pesoMinG, Math.min(prato.pesoMaxG, valor));
}

export default function TelaProduto({ navigation, route }) {
  const idPrato = route?.params?.id || 'arroz-branco';

  const [prato, setPrato] = useState(null);
  const [pesoG, setPesoG] = useState(0);
  const [observacao, setObservacao] = useState('');
  const [presetAtivo, setPresetAtivo] = useState(null);
  const [mostrarBanner, setMostrarBanner] = useState(false);

  useEffect(() => {
    const nomeRestaurante = route?.params?.restaurantNome;
    if (nomeRestaurante) navigation.setOptions({ title: nomeRestaurante });
  }, [route?.params?.restaurantNome]);

  useEffect(() => {
    (async () => {
      const p = await Catalogo.get(idPrato);
      setPrato(p);
      if (p) {
        const salvo = await Weights.get(p.id);
        const inicial = salvo != null
          ? Math.max(p.pesoMinG, Math.min(p.pesoMaxG, salvo))
          : p.pesoMinG;
        setPesoG(inicial);
        const carrinho = await Cart.list();
        if (carrinho.some((it) => String(it.pratoId) === String(p.id))) {
          setMostrarBanner(true);
        }
      }
    })();
  }, [idPrato]);

  useEffect(() => {
    if (prato && pesoG > 0) Weights.set(prato.id, pesoG);
  }, [prato, pesoG]);

  const preco = useMemo(() => {
    if (!prato) return 0;
    return (pesoG / 1000) * prato.precoPorKg;
  }, [pesoG, prato]);

  function ajustarPeso(delta) {
    if (!prato) return;
    setPresetAtivo(null);
    setPesoG((prev) => clampPeso(prev + delta, prato));
  }

  function aplicarPreset(preset) {
    if (!prato) return;
    const novoPeso = clampPeso(preset.pesoG, prato);
    setPesoG(novoPeso);
    setPresetAtivo(preset.id);
  }

  async function adicionarAoCarrinho() {
    if (!prato) return;
    const item = {
      pratoId: prato.id,
      nome: prato.nome,
      quantidade: pesoG,
      preco: parseFloat(preco.toFixed(2)),
      precoPorKg: prato.precoPorKg,
      observacao,
      restaurantId: prato.restaurantId,
      restaurantNome: prato.restaurantNome,
    };
    try {
      await Cart.add(item);
      setMostrarBanner(true);
    } catch (e) {
      if (e.message?.startsWith('RESTAURANTE_DIFERENTE:')) {
        const nomeOutro = e.message.split(':')[1];
        Alert.alert(
          'Restaurante diferente',
          `Seu carrinho tem itens de "${nomeOutro}". Deseja limpar o carrinho e adicionar este item?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Limpar e adicionar',
              style: 'destructive',
              onPress: async () => {
                await Cart.clear();
                await Cart.add(item);
                setMostrarBanner(true);
              },
            },
          ]
        );
        return;
      }
      Alert.alert('Erro', 'Não foi possível adicionar ao carrinho.');
    }
  }

  if (!prato) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const presetsDisponiveis = PRESETS_FOME.map((p) => ({
    ...p,
    indisponivel: p.pesoG < prato.pesoMinG || p.pesoG > prato.pesoMaxG,
  }));

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: mostrarBanner ? 80 : 40 }}>
        <Image
          style={styles.imagem}
          source={IMAGENS[prato.imagemKey]}
          resizeMode="cover"
        />

        <View style={styles.bloco}>
          <View style={styles.headerLinha}>
            <Text style={styles.titulo}>{prato.nome}</Text>
            <View style={styles.tagKg}>
              <Text style={styles.tagKgTxt}>por kg</Text>
            </View>
          </View>
          <Text style={styles.descricao}>{prato.descricao}</Text>
          <Text style={styles.precoKg}>
            {formatBRL(prato.precoPorKg)}
            <Text style={styles.precoKgUnidade}> / kg</Text>
          </Text>

          <Text style={styles.label}>Qual é a sua fome?</Text>
          <View style={styles.presetsBox}>
            {presetsDisponiveis.map((p) => {
              const ativo = presetAtivo === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  disabled={p.indisponivel}
                  style={[
                    styles.presetChip,
                    ativo && styles.presetChipAtivo,
                    p.indisponivel && styles.presetChipDisabled,
                  ]}
                  onPress={() => aplicarPreset(p)}
                >
                  <Text style={styles.presetEmoji}>{p.emoji}</Text>
                  <Text
                    style={[
                      styles.presetRotulo,
                      ativo && styles.presetRotuloAtivo,
                      p.indisponivel && styles.presetTxtDisabled,
                    ]}
                  >
                    {p.rotulo}
                  </Text>
                  <Text
                    style={[
                      styles.presetDesc,
                      ativo && styles.presetDescAtivo,
                      p.indisponivel && styles.presetTxtDisabled,
                    ]}
                  >
                    {p.descricao}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Ajuste fino</Text>
          <View style={styles.seletorPeso}>
            <TouchableOpacity
              style={styles.btCounter}
              onPress={() => ajustarPeso(-prato.passoG)}
            >
              <Icon name="minus" size={20} color={colors.primary} />
            </TouchableOpacity>
            <View style={styles.pesoDisplay}>
              <Text style={styles.pesoValor}>{formatarPeso(pesoG)}</Text>
              <Text style={styles.pesoLimites}>
                min {formatarPeso(prato.pesoMinG)} · max {formatarPeso(prato.pesoMaxG)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.btCounter}
              onPress={() => ajustarPeso(prato.passoG)}
            >
              <Icon name="plus" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Alguma observação?</Text>
          <TextInput
            style={styles.inputAnot}
            multiline
            maxLength={200}
            value={observacao}
            onChangeText={setObservacao}
            placeholder="Ex: sem cebola, ponto da carne, separar molho…"
            placeholderTextColor={colors.placeholder}
          />
        </View>

        <View style={styles.rodape}>
          <View>
            <Text style={styles.rodapeLabel}>Total</Text>
            <Text style={styles.rodapeValor}>{formatBRL(preco)}</Text>
          </View>
          <TouchableOpacity style={styles.btComprar} onPress={adicionarAoCarrinho}>
            <Icon name="shopping-bag" size={18} color={colors.textInverse} />
            <Text style={styles.btComprarTxt}>Adicionar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {mostrarBanner && (
        <TouchableOpacity
          style={styles.banner}
          onPress={() => navigation.navigate('Carrinho')}
          activeOpacity={0.9}
        >
          <Icon name="shopping-bag" size={16} color="#fff" />
          <Text style={styles.bannerTxt}>Ver carrinho</Text>
          <Icon name="chevron-right" size={16} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imagem: { width: '100%', height: 240, backgroundColor: colors.surfaceAlt },

  bloco: {
    backgroundColor: colors.surface,
    marginTop: -16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },

  headerLinha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titulo: { fontSize: 24, fontWeight: '700', color: colors.textPrimary, flex: 1 },

  tagKg: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  tagKgTxt: { color: colors.primary, fontSize: 12, fontWeight: '700' },

  descricao: { color: colors.textSecondary, marginTop: 6, lineHeight: 20 },
  precoKg: { fontSize: 18, color: colors.primary, fontWeight: '700', marginTop: 10 },
  precoKgUnidade: { fontSize: 13, color: colors.textSecondary, fontWeight: '400' },

  label: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginTop: 22, marginBottom: 10 },

  presetsBox: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  presetChip: {
    width: '48%',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  presetChipAtivo: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  presetChipDisabled: { opacity: 0.4 },
  presetEmoji: { fontSize: 22 },
  presetRotulo: { fontWeight: '700', color: colors.textPrimary, marginTop: 6 },
  presetRotuloAtivo: { color: colors.primary },
  presetDesc: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  presetDescAtivo: { color: colors.primaryDark },
  presetTxtDisabled: { color: colors.textMuted },

  seletorPeso: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  btCounter: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  pesoDisplay: { alignItems: 'center' },
  pesoValor: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  pesoLimites: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },

  inputAnot: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 70,
    textAlignVertical: 'top',
    color: colors.textPrimary,
  },

  rodape: {
    marginTop: 18,
    marginHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.card,
  },
  rodapeLabel: { color: colors.textSecondary, fontSize: 12 },
  rodapeValor: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  btComprar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: radius.md,
    gap: 8,
  },
  btComprarTxt: { color: colors.textInverse, fontWeight: '700', fontSize: 15 },

  banner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  bannerTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
