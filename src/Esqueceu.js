import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import logo from '../assets/Logo.png';
import { colors, spacing, radius } from './theme/theme';

const API_URL = 'http://localhost:3000';

export default function Esqueceu({ navigation }) {
  const [email, setEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function recuperar() {
    if (!email || !novaSenha) {
      Alert.alert('Atenção', 'Preencha email e a nova senha.');
      return;
    }
    setEnviando(true);
    try {
      const r = await fetch(`${API_URL}/update`, {
        method: 'PUT',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, novaSenha }),
      });
      const txt = await r.json();
      Alert.alert('Tudo certo', String(txt), [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (e) {
      Alert.alert('Servidor offline', 'Tente novamente quando o backend estiver online.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} resizeMode="contain" />
      <Text style={styles.titulo}>Recuperar acesso</Text>
      <Text style={styles.legenda}>
        Informe seu e-mail e defina uma nova senha.
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="voce@email.com"
          placeholderTextColor={colors.placeholder}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Nova senha</Text>
        <TextInput
          style={styles.input}
          value={novaSenha}
          onChangeText={setNovaSenha}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor={colors.placeholder}
        />

        <TouchableOpacity style={styles.bt} onPress={recuperar} disabled={enviando}>
          {enviando
            ? <ActivityIndicator color={colors.textInverse} />
            : <Text style={styles.btTxt}>Salvar nova senha</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 14, alignItems: 'center' }}>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>Voltar para login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: colors.background,
    padding: spacing.lg, alignItems: 'center', justifyContent: 'center',
  },
  logo: { width: 90, height: 90, marginBottom: 12 },
  titulo: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  legenda: { color: colors.textSecondary, marginTop: 4, marginBottom: 20, textAlign: 'center' },
  card: { width: '100%', backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.lg },
  label: { color: colors.textSecondary, fontSize: 12, marginTop: 8, marginBottom: 4 },
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
