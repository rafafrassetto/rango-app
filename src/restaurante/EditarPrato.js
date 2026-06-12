import React, { useEffect, useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity, Alert,
  ScrollView, KeyboardAvoidingView, Platform, Switch, Image,
} from 'react-native';
import Icon from '@expo/vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import { Catalogo, IMAGENS } from '../services/catalogo';
import { RestauranteAuth } from '../services/restauranteAuth';
import { colors, spacing, radius, shadow } from '../theme/theme';

// Chaves de imagem disponíveis (precisam ter require estático em catalogo.js)
const IMAGENS_DISPONIVEIS = [
  { key: 'arrozbranco', rotulo: 'Arroz' },
  { key: 'feijaopreto', rotulo: 'Feijão' },
  { key: 'macarraoTomate', rotulo: 'Macarrão' },
];

// Mantém só dígitos
function soNumeros(s) {
  return (s || '').replace(/\D/g, '');
}

// Máscara R$ a partir de centavos digitados: "1290" -> "R$ 12,90"
function mascaraBRL(s) {
  const dig = soNumeros(s);
  if (!dig) return '';
  const n = Number(dig) / 100;
  return 'R$ ' + n.toFixed(2).replace('.', ',');
}

// Converte string mascarada de volta pra number
function brlParaNumero(s) {
  const dig = soNumeros(s);
  return dig ? Number(dig) / 100 : 0;
}

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
  const [imagemUrl, setImagemUrl] = useState('');
  const [disponivel, setDisponivel] = useState(true);
  const [carregando, setCarregando] = useState(editando);
  const [errosCampos, setErrosCampos] = useState({});

  useEffect(() => {
    (async () => {
      if (!editando) return;
      const p = await Catalogo.get(id);
      if (p) {
        setNome(p.nome || '');
        setDescricao(p.descricao || '');
        const centavos = Math.round(Number(p.precoPorKg || 0) * 100);
        setPrecoPorKg(centavos ? mascaraBRL(String(centavos)) : '');
        setPesoMinG(String(p.pesoMinG ?? ''));
        setPesoMaxG(String(p.pesoMaxG ?? ''));
        setPassoG(String(p.passoG ?? 50));
        setImagemKey(p.imagemKey || 'arrozbranco');
        setImagemUrl(p.imagemUrl || '');
        setDisponivel(p.disponivel !== false);
      }
      setCarregando(false);
    })();
  }, [id, editando]);

  // Foto vai para o banco como base64; compressão alta para não pesar.
  const OPTS_FOTO = {
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.2,
    base64: true,
  };

  async function tirarFoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      return Alert.alert('Permissão', 'Autorize o uso da câmera para fotografar o prato.');
    }
    const r = await ImagePicker.launchCameraAsync(OPTS_FOTO);
    if (!r.canceled && r.assets?.[0]?.base64) {
      setImagemUrl(`data:image/jpeg;base64,${r.assets[0].base64}`);
    }
  }

  async function escolherDaGaleria() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      return Alert.alert('Permissão', 'Autorize o acesso à galeria para escolher a foto.');
    }
    const r = await ImagePicker.launchImageLibraryAsync(OPTS_FOTO);
    if (!r.canceled && r.assets?.[0]?.base64) {
      setImagemUrl(`data:image/jpeg;base64,${r.assets[0].base64}`);
    }
  }

  function validar() {
    const erros = {};
    if (!nome.trim()) erros.nome = true;
    const preco = brlParaNumero(precoPorKg);
    if (!preco || preco <= 0) erros.precoPorKg = true;
    const min = parseInt(pesoMinG, 10);
    const max = parseInt(pesoMaxG, 10);
    const passo = parseInt(passoG, 10);
    if (!min || min <= 0) erros.pesoMinG = true;
    if (!max || max <= min) erros.pesoMaxG = true;
    if (!passo || passo <= 0) erros.passoG = true;
    setErrosCampos(erros);
    if (Object.keys(erros).length === 0) return null;
    if (erros.pesoMaxG && max) return 'Peso máximo deve ser maior que o mínimo.';
    return 'Preencha os campos destacados em vermelho.';
  }

  async function salvar() {
    const erro = validar();
    if (erro) return Alert.alert('Atenção', erro);

    const sessao = await RestauranteAuth.getSession();
    if (!sessao?.id) {
      return Alert.alert('Sessão expirada', 'Faça login no painel do restaurante novamente.');
    }
    const prato = {
      id: id || slugify(nome) || `prato-${Date.now()}`,
      nome: nome.trim(),
      descricao: descricao.trim(),
      precoPorKg: brlParaNumero(precoPorKg),
      pesoMinG: parseInt(pesoMinG, 10),
      pesoMaxG: parseInt(pesoMaxG, 10),
      passoG: parseInt(passoG, 10),
      imagemKey,
      imagemUrl: imagemUrl.trim() || null,
      disponivel,
      restaurant_id: sessao.id,
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
            style={[styles.input, errosCampos.nome && styles.inputErro]}
            value={nome}
            onChangeText={(t) => { setNome(t); setErrosCampos((e) => ({ ...e, nome: false })); }}
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

          <Text style={styles.label}>Preço por kg</Text>
          <TextInput
            style={[styles.input, errosCampos.precoPorKg && styles.inputErro]}
            value={precoPorKg}
            onChangeText={(t) => {
              setPrecoPorKg(mascaraBRL(t));
              setErrosCampos((e) => ({ ...e, precoPorKg: false }));
            }}
            placeholder="R$ 0,00"
            placeholderTextColor={colors.placeholder}
            keyboardType="number-pad"
          />
        </View>

        <Text style={styles.tituloMenor}>Regras de peso</Text>
        <View style={styles.card}>
          <View style={styles.linhaDupla}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Mínimo (g)</Text>
              <TextInput
                style={[styles.input, errosCampos.pesoMinG && styles.inputErro]}
                value={pesoMinG}
                onChangeText={(t) => {
                  setPesoMinG(soNumeros(t));
                  setErrosCampos((e) => ({ ...e, pesoMinG: false }));
                }}
                placeholder="100" placeholderTextColor={colors.placeholder}
                keyboardType="number-pad"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Máximo (g)</Text>
              <TextInput
                style={[styles.input, errosCampos.pesoMaxG && styles.inputErro]}
                value={pesoMaxG}
                onChangeText={(t) => {
                  setPesoMaxG(soNumeros(t));
                  setErrosCampos((e) => ({ ...e, pesoMaxG: false }));
                }}
                placeholder="2000" placeholderTextColor={colors.placeholder}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <Text style={styles.label}>Passo (g)</Text>
          <TextInput
            style={[styles.input, errosCampos.passoG && styles.inputErro]}
            value={passoG}
            onChangeText={(t) => {
              setPassoG(soNumeros(t));
              setErrosCampos((e) => ({ ...e, passoG: false }));
            }}
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
          <View style={styles.fotoRow}>
            <TouchableOpacity style={styles.btFoto} onPress={tirarFoto}>
              <Icon name="camera" size={15} color={colors.primary} />
              <Text style={styles.btFotoTxt}>Tirar foto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btFoto} onPress={escolherDaGaleria}>
              <Icon name="image" size={15} color={colors.primary} />
              <Text style={styles.btFotoTxt}>Galeria</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Ou cole a URL de uma imagem personalizada</Text>
          <TextInput
            style={styles.input}
            value={imagemUrl.startsWith('data:') ? '' : imagemUrl}
            onChangeText={setImagemUrl}
            placeholder={imagemUrl.startsWith('data:') ? 'Foto carregada ✓ (cole uma URL para substituir)' : 'https://...'}
            placeholderTextColor={colors.placeholder}
            autoCapitalize="none"
            keyboardType="url"
          />
          {imagemUrl ? (
            <Image
              source={{ uri: imagemUrl }}
              style={styles.imgPreviewGrande}
              resizeMode="cover"
            />
          ) : null}
          {imagemUrl ? (
            <TouchableOpacity
              onPress={() => setImagemUrl('')}
              style={{ marginTop: 8, alignSelf: 'center' }}
            >
              <Text style={{ color: colors.danger, fontSize: 12, fontWeight: '600' }}>
                Remover imagem personalizada
              </Text>
            </TouchableOpacity>
          ) : null}
          <Text style={styles.dica}>
            Recomendação: imagem quadrada (1:1) com pelo menos 600x600px e no máximo 2MB.
            Formatos aceitos: JPG, PNG ou WEBP.
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
            trackColor={{ true: colors.primaryLight, false: colors.divider }}
            thumbColor={colors.primary}
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
  inputErro: { borderColor: colors.danger, backgroundColor: '#FFF0F0' },
  imgPreviewGrande: {
    width: '100%', height: 140, borderRadius: radius.md,
    marginTop: 10, backgroundColor: colors.surfaceAlt,
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

  fotoRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  btFoto: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 11, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.primaryLight,
  },
  btFotoTxt: { color: colors.primary, fontWeight: '700', fontSize: 13 },

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
