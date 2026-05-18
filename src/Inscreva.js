import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Session } from './services/storage';
import { colors, spacing, radius } from './theme/theme';
import { API_URL } from './services/api';

export default function Inscreva({ navigation }) {
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function registerUser() {
    if (!nome || !email || !senha) {
      Alert.alert('Atenção', 'Preencha nome, email e senha.');
      return;
    }
    const usuario = { nome: `${nome} ${sobrenome}`.trim(), email, senha };

    setEnviando(true);
    try {
      const response = await fetch(`${API_URL}/create`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario),
      });
      const ress = await response.json();
      await Session.set({ nome: usuario.nome, email });
      Alert.alert('Sucesso', String(ress) || 'Cadastro realizado!', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (e) {
      await Session.set({ nome: usuario.nome, email });
      Alert.alert(
        'Cadastro local',
        'Servidor offline — sua conta foi salva localmente.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.titulo}>Criar conta</Text>
        <Text style={styles.subtitulo}>É rapidinho, em menos de 1 minuto.</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Nome</Text>
          <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Seu nome" placeholderTextColor={colors.placeholder} />

          <Text style={styles.label}>Sobrenome</Text>
          <TextInput style={styles.input} value={sobrenome} onChangeText={setSobrenome} placeholder="Seu sobrenome" placeholderTextColor={colors.placeholder} />

          <Text style={styles.label}>E-mail</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="voce@email.com" autoCapitalize="none" keyboardType="email-address" placeholderTextColor={colors.placeholder} />

          <Text style={styles.label}>Telefone</Text>
          <TextInput style={styles.input} value={telefone} onChangeText={setTelefone} placeholder="(00) 00000-0000" keyboardType="phone-pad" placeholderTextColor={colors.placeholder} />

          <Text style={styles.label}>Senha</Text>
          <TextInput style={styles.input} value={senha} onChangeText={setSenha} secureTextEntry placeholder="••••••••" placeholderTextColor={colors.placeholder} />

          <TouchableOpacity style={styles.bt} onPress={registerUser} disabled={enviando}>
            {enviando
              ? <ActivityIndicator color={colors.textInverse} />
              : <Text style={styles.btTxt}>Cadastrar</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 14, alignItems: 'center' }}>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>Já tenho conta · Entrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg },
  titulo: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginTop: 10 },
  subtitulo: { color: colors.textSecondary, marginTop: 4, marginBottom: 16 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg },
  label: { color: colors.textSecondary, fontSize: 12, marginTop: 10, marginBottom: 4 },
  input: {
    backgroundColor: colors.inputBg,
    borderWidth: 1, borderColor: colors.inputBorder,
    borderRadius: radius.md, padding: 12, color: colors.textPrimary,
  },
  bt: {
    backgroundColor: colors.primary,
    paddingVertical: 14, borderRadius: radius.md,
    alignItems: 'center', marginTop: 18,
  },
  btTxt: { color: colors.textInverse, fontWeight: '700', fontSize: 15 },
});
