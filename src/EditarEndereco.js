import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Addresses } from './services/storage';
import { buscarCep } from './services/viaCep';
import { Toast } from './components/CustomAlert';
import { colors, spacing, radius } from './theme/theme';

const ESTADO_INICIAL = {
  apelido: '', cep: '', rua: '', numero: '',
  complemento: '', bairro: '', cidade: '', estado: '',
};

export default function EditarEndereco({ route, navigation }) {
  const { id } = route.params || {};
  const editando = !!id;
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [carregando, setCarregando] = useState(editando);
  const [buscandoCep, setBuscandoCep] = useState(false);

  useEffect(() => {
    if (!editando) return;
    (async () => {
      const e = await Addresses.get(id);
      if (e) setForm(e);
      setCarregando(false);
    })();
  }, [editando, id]);

  function setCampo(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function consultarCep() {
    if (!form.cep) return Toast.show('Digite o CEP primeiro.');
    try {
      setBuscandoCep(true);
      const dados = await buscarCep(form.cep);
      setForm((f) => ({
        ...f,
        cep: dados.cep, rua: dados.rua,
        bairro: dados.bairro, cidade: dados.cidade, estado: dados.estado,
      }));
    } catch (e) {
      Toast.show(e.message);
    } finally {
      setBuscandoCep(false);
    }
  }

  async function salvar() {
    if (!form.cep || !form.rua || !form.numero)
      return Toast.show('CEP, rua e número são obrigatórios.');
    if (editando) await Addresses.update(id, form);
    else await Addresses.add(form);
    Toast.show(editando ? 'Endereço atualizado!' : 'Endereço cadastrado!');
    navigation.goBack();
  }

  if (carregando) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.titulo}>{editando ? 'Editar endereço' : 'Novo endereço'}</Text>

      <Text style={styles.label}>Apelido (ex: Casa, Trabalho)</Text>
      <TextInput style={styles.input} value={form.apelido} onChangeText={(t) => setCampo('apelido', t)} placeholderTextColor={colors.placeholder} />

      <Text style={styles.label}>CEP</Text>
      <View style={styles.linhaCep}>
        <TextInput
          style={[styles.input, { flex: 1 }]} value={form.cep}
          onChangeText={(t) => setCampo('cep', t)}
          keyboardType="numeric" maxLength={9} placeholder="00000-000"
          placeholderTextColor={colors.placeholder}
        />
        <TouchableOpacity style={styles.btCep} onPress={consultarCep} disabled={buscandoCep}>
          {buscandoCep ? <ActivityIndicator color={colors.textInverse} /> : <Text style={styles.btCepTxt}>Buscar CEP</Text>}
        </TouchableOpacity>
      </View>
      <Text style={styles.dica}>Os demais campos são preenchidos automaticamente via API ViaCEP.</Text>

      <Text style={styles.label}>Rua</Text>
      <TextInput style={styles.input} value={form.rua} onChangeText={(t) => setCampo('rua', t)} />

      <View style={styles.linha}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.label}>Número</Text>
          <TextInput style={styles.input} value={form.numero} onChangeText={(t) => setCampo('numero', t)} keyboardType="numeric" />
        </View>
        <View style={{ flex: 2 }}>
          <Text style={styles.label}>Complemento</Text>
          <TextInput style={styles.input} value={form.complemento} onChangeText={(t) => setCampo('complemento', t)} />
        </View>
      </View>

      <Text style={styles.label}>Bairro</Text>
      <TextInput style={styles.input} value={form.bairro} onChangeText={(t) => setCampo('bairro', t)} />

      <View style={styles.linha}>
        <View style={{ flex: 2, marginRight: 8 }}>
          <Text style={styles.label}>Cidade</Text>
          <TextInput style={styles.input} value={form.cidade} onChangeText={(t) => setCampo('cidade', t)} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>UF</Text>
          <TextInput style={styles.input} value={form.estado} onChangeText={(t) => setCampo('estado', t)} maxLength={2} autoCapitalize="characters" />
        </View>
      </View>

      <TouchableOpacity style={styles.btSalvar} onPress={salvar}>
        <Text style={styles.btSalvarTxt}>{editando ? 'Salvar alterações' : 'Cadastrar endereço'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btCancelar} onPress={() => navigation.goBack()}>
        <Text style={styles.btCancelarTxt}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  titulo: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 14, textAlign: 'center' },
  label: { fontSize: 12, color: colors.textSecondary, marginTop: 10, marginBottom: 4 },
  input: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.inputBorder,
    borderRadius: radius.md, padding: 12, color: colors.textPrimary,
  },
  linha: { flexDirection: 'row' },
  linhaCep: { flexDirection: 'row', alignItems: 'center' },
  btCep: {
    backgroundColor: colors.primary, marginLeft: 8,
    paddingHorizontal: 14, paddingVertical: 12, borderRadius: radius.md,
  },
  btCepTxt: { color: colors.textInverse, fontWeight: '700' },
  dica: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  btSalvar: {
    marginTop: 18, backgroundColor: colors.primary,
    paddingVertical: 14, borderRadius: radius.md, alignItems: 'center',
  },
  btSalvarTxt: { color: colors.textInverse, fontWeight: '700' },
  btCancelar: { marginTop: 8, paddingVertical: 12, borderRadius: radius.md, alignItems: 'center' },
  btCancelarTxt: { color: colors.primary, fontWeight: '600' },
});
