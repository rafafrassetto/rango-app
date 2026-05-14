import React, { useEffect, useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity, Alert,
  ScrollView, KeyboardAvoidingView, Platform, Switch, Image,
} from 'react-native';
import Icon from '@expo/vector-icons/Feather';
import { Catalogo, IMAGENS } from '../services/catalogo';
import { colors, spacing, radius, shadow } from '../theme/theme';

// Chaves de imagem disponíveis (precisam ter require estático em catalogo.js)
const IMAGENS_DISPONIVEIS = [
  { key: 'arrozbranco', rotulo: 'Arroz' },
  { key: 'feijaopreto', rotulo: 'Feijão' },
  { key: 'macarraoTomate', rotulo: 'Macarrão' },
];

function slugify(s) {
  return (s || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function EditarPrato({ route, navigation }) {
  const id = route?.params?.id || null;
  const editando = Boolean(id);

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [precoPorKg, setPrecoPorKg] = useState('');
  const [pesoMinG, setPesoMinG] = useState('');
  const [pesoMaxG, setPesoMaxG] = useState('');
  const [passoG, setPassoG] = useState('50');
  const [imagemKey, setImagemKey] = useState('arrozbranco');
  const [disponivel, setDisponivel] = useState(true);
  const [carregando, setCarregando] = useState(editando);

  useEffect(() => {
    (async () => {
      if (!editando) return;
      const p = await Catalogo.get(id);
      if (p) {
        setNome(p.nome || '');
        setDescricao(p.descricao || '');
        setPrecoPorKg(String(p.precoPorKg ?? ''));
        setPesoMinG(String(p.pesoMinG ?? ''));
        setPesoMaxG(String(p.pesoMaxG ?? ''));
        setPassoG(String(p.passoG ?? 50));
        setImagemKey(p.imagemKey || 'arrozbranco');
        setDisponivel(p.disponivel !== false);
      }
      setCarregando(false);
    })();
  }, [id, editando]);

  function validar() {
    if (!nome.trim()) return 'Informe o nome do prato.';
    const preco = parseFloat(String(precoPorKg).replace(',', '.'));
    if (!preco || preco <= 0) return 'Preço por kg inválido.';
    const min = parseInt(pesoMinG, 10);
    const max = parseInt(pesoMaxG, 10);
    const passo = parseInt(passoG, 10);
    if (!min || min <= 0) return 'Peso mínimo deve ser maior que zero.';
    if (!max || max <= min) return 'Peso máximo deve ser maior que o mínimo.';
    if (!passo || passo <= 0) return 'Passo deve ser maior que zero.';
    return null;
  }

  async function salvar() {
    const erro = validar();
    if (erro) return Alert.alert('Atenção', erro);

    const prato = {
      id: id || slugify(nome) || `prato-${Date.now()}`,
      nome: nome.trim(),
      descricao: descricao.trim(),
      precoPorKg: parseFloat(String(precoPorKg).replace(',', '.')),
      pesoMinG: parseInt(pesoMinG, 10),
      pesoMaxG: parseInt(pesoMaxG, 10),
      passoG: parseInt(passoG, 10),
      imagemKey,
      disponivel,
    };

    try {
      await Catalogo.upsert(prato);
      Alert.alert('Pronto', editando ? 'Prato atualizado.' : 'Prato cadastrado.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar o prato.');
    }
  }

  if (carregando) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.textSecondary }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={styles.titulo}>
          {editando ? 'Editar prato' : 'Novo prato'}
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input} value={nome} onChangeText={setNome}
            placeholder="Ex.: Arroz Branco"
            placeholderTextColor={colors.placeholder}
          />

          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            value={descricao} onChangeText={setDescricao}
            placeholder="Descrição curta exibida na tela do produto"
            placeholderTextColor={colors.placeholder}
            multiline
          />

          <Text style={styles.label}>Preço por kg (R$)</Text>
          <TextInput
            style={styles.input} value={precoPorKg} onChangeText={setPrecoPorKg}
            placeholder="79.90" placeholderTextColor={colors.placeholder}
            keyboardType="decimal-pad"
          />
        </View>

        <Text style={styles.tituloMenor}>Regras de peso</Text>
        <View style={styles.card}>
          <View style={styles.linhaDupla}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Mínimo (g)</Text>
              <TextInput
                style={styles.input} value={pesoMinG} onChangeText={setPesoMinG}
                placeholder="100" placeholderTextColor={colors.placeholder}
                keyboardType="number-pad"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Máximo (g)</Text>
              <TextInput
                style={styles.input} value={pesoMaxG} onChangeText={setPesoMaxG}
                placeholder="2000" placeholderTextColor={colors.placeholder}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <Text style={styles.label}>Passo (g)</Text>
          <TextInput
            style={styles.input} value={passoG} onChangeText={setPassoG}
            placeholder="50" placeholderTextColor={colors.placeholder}
            keyboardType="number-pad"
          />
          <Text style={styles.dica}>
            O cliente vai poder ajustar o peso de {passoG || '?'}g em {passoG || '?'}g,
            entre o mínimo e o máximo configurados.
          </Text>
        </View>

        <Text style={styles.tituloMenor}>Imagem do prato</Text>
        <View style={styles.card}>
          <View style={styles.imgRow}>
            {IMAGENS_DISPONIVEIS.map((opt) => {
              const ativo = imagemKey === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.imgOpt, ativo && styles.imgOptAtivo]}
                  onPress={() => setImagemKey(opt.key)}
                >
                  <Image source={IMAGENS[opt.key]} style={styles.imgPreview} resizeMode="cover" />
                  <Text style={[styles.imgRotulo, ativo && { color: colors.primary, fontWeight: '700' }]}>
                    {opt.rotulo}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.dica}>
            Por enquanto a imagem é escolhida entre as opções pré-carregadas no app.
          </Text>
        </View>

        <View style={[styles.card, styles.toggleRow]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleTitulo}>Disponível para pedidos</Text>
            <Text style={styles.dica}>
              {disponivel ? 'O prato está visível no cardápio.' : 'O prato está pausado.'}
            </Text>
          </View>
          <Switch
            value={disponivel}
            onValueChange={setDisponivel}
            trackColor={{ true: colors.primary, false: colors.divider }}
            thumbColor={colors.surface}
          />
        </View>

        <TouchableOpacity style={styles.bt} onPress={salvar}>
          <Icon name="check" size={16} color={colors.textInverse} />
          <Text style={styles.btTxt}>
            {editando ? 'Salvar alterações' : 'Cadastrar prato'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btCancel} onPress={() => navigation.goBack()}>
          <Text style={styles.btCancelTxt}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  titulo: {
    fontSize: 22, fontWeight: '700', color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  tituloMenor: {
    fontSize: 13, fontWeight: '700', color: colors.textSecondary,
    marginTop: 6, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.surface, padding: spacing.lg,
    borderRadius: radius.lg, marginBottom: spacing.lg, ...shadow.card,
  },
  label: { color: colors.textSecondary, fontSize: 12, marginTop: 10, marginBottom: 4 },
  input: {
    backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.inputBorder,
    borderRadius: radius.md, padding: 12, color: colors.textPrimary,
  },
  linhaDupla: { flexDirection: 'row', gap: 10 },
  dica: { color: colors.textMuted, fontSize: 11, marginTop: 6 },

  imgRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  imgOpt: {
    flex: 1, alignItems: 'center', padding: 8,
    borderRadius: radius.md, borderWidth: 2, borderColor: 'transparent',
    backgroundColor: colors.surfaceAlt,
  },
  imgOptAtivo: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  imgPreview: { width: 56, height: 56, borderRadius: radius.sm, marginBottom: 6 },
  imgRotulo: { color: colors.textSecondary, fontSize: 11 },

  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleTitulo: { color: colors.textPrimary, fontWeight: '700', fontSize: 14 },

  bt: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary, paddingVertical: 14,
    borderRadius: radius.md, marginTop: 4,
  },
  btTxt: { color: colors.textInverse, fontWeight: '700' },
  btCancel: { paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  btCancelTxt: { color: colors.textSecondary, fontWeight: '600' },
});
