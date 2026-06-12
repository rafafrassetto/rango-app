import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, ScrollView,
} from 'react-native';
import { RestauranteAuth } from './services/restauranteAuth';
import InputSenha from './components/InputSenha';
import { colors, spacing, radius } from './theme/theme';

export default function InscrevaseRestaurante({ navigation }) {
  const [form, setForm] = useState({
    nome: '', email: '', telefone: '', cnpj: '', senha: '',
  });

  function setCampo(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function inscrever() {
    if (!form.nome || !form.email || !form.senha) {
      return Alert.alert('Atenção', 'Preencha pelo menos nome, e-mail e senha.');
    }
    await RestauranteAuth.register(form);
    Alert.alert('Sucesso', 'Restaurante cadastrado! Faça login para acessar o painel.', [
      { text: 'OK', onPress: () => navigation.navigate('LoginRestaurante') },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Cadastrar restaurante</Text>
      <Text style={styles.subtitulo}>Comece a vender no Rango App em minutos.</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Nome do restaurante</Text>
        <TextInput style={styles.input} value={form.nome} onChangeText={(t) => setCampo('nome', t)} placeholder="Ex: Caçarola" placeholderTextColor={colors.placeholder} />

        <Text style={styles.label}>E-mail</Text>
        <TextInput style={styles.input} value={form.email} onChangeText={(t) => setCampo('email', t)} autoCapitalize="none" keyboardType="email-address" placeholderTextColor={colors.placeholder} />

        <Text style={styles.label}>Telefone</Text>
        <TextInput style={styles.input} value={form.telefone} onChangeText={(t) => setCampo('telefone', t)} keyboardType="phone-pad" placeholderTextColor={colors.placeholder} />

        <Text style={styles.label}>CNPJ</Text>
        <TextInput style={styles.input} value={form.cnpj} onChangeText={(t) => setCampo('cnpj', t)} keyboardType="numeric" placeholderTextColor={colors.placeholder} />

        <Text style={styles.label}>Senha</Text>
        <InputSenha style={styles.input} value={form.senha} onChangeText={(t) => setCampo('senha', t)} placeholder="••••••••" />

        <TouchableOpacity style={styles.bt} onPress={inscrever}>
          <Text style={styles.btTxt}>Cadastrar restaurante</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, backgroundColor: colors.background, flexGrow: 1 },
  titulo: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginTop: 8 },
  subtitulo: { color: colors.textSecondary, marginTop: 4, marginBottom: 16 },
  card: { backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.lg },
  label: { color: colors.textSecondary, fontSize: 12, marginTop: 10, marginBottom: 4 },
  input: {
    backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.inputBorder,
    borderRadius: radius.md, padding: 12, color: colors.textPrimary,
  },
  bt: {
    backgroundColor: colors.primary, paddingVertical: 14,
    borderRadius: radius.md, alignItems: 'center', marginTop: 18,
  },
  btTxt: { color: colors.textInverse, fontWeight: '700' },
});
