import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import Icon from '@expo/vector-icons/Feather';
import InputSenha from './components/InputSenha';
import { colors, spacing, radius, shadow } from './theme/theme';
import { API_URL } from './services/api';

// Tela aberta pelo deep link do e-mail: rangoapp://redefinir-senha?token=...
export default function RedefinirSenha({ navigation, route }) {
  const token = route?.params?.token || '';
  const [senha, setSenha] = useState('');
  const [confirma, setConfirma] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function redefinir() {
    if (!token) {
      return Alert.alert('Link inválido', 'Abra esta tela pelo link enviado ao seu e-mail.');
    }
    if (!senha || senha.length < 6) {
      return Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres.');
    }
    if (senha !== confirma) {
      return Alert.alert('Atenção', 'As senhas não conferem.');
    }
    setEnviando(true);
    try {
      const r = await fetch(`${API_URL}/redefinir-senha`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, novaSenha: senha }),
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok) {
        Alert.alert('Não foi possível', json?.erro || 'Link inválido ou expirado. Solicite um novo.');
      } else {
        Alert.alert('Senha redefinida!', 'Agora é só entrar com a nova senha.', [
          {
            text: 'OK',
            onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }),
          },
        ]);
      }
    } catch (e) {
      Alert.alert('Sem conexão', 'Não foi possível falar com o servidor. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <View style={styles.card}>
        <View style={styles.icone}>
          <Icon name="lock" size={28} color={colors.primary} />
        </View>
        <Text style={styles.titulo}>Criar nova senha</Text>
        <Text style={styles.legenda}>
          {token
            ? 'Defina a nova senha da sua conta. Ela substitui a anterior imediatamente.'
            : 'Este acesso só funciona pelo link enviado ao seu e-mail em “Esqueceu a senha?”.'}
        </Text>

        <Text style={styles.label}>Nova senha</Text>
        <InputSenha
          style={styles.input}
          value={senha}
          onChangeText={setSenha}
          placeholder="Mínimo 6 caracteres"
        />

        <Text style={styles.label}>Confirmar nova senha</Text>
        <InputSenha
          style={styles.input}
          value={confirma}
          onChangeText={setConfirma}
          placeholder="Repita a senha"
        />

        <TouchableOpacity style={styles.bt} onPress={redefinir} disabled={enviando}>
          {enviando
            ? <ActivityIndicator color={colors.textInverse} />
            : <Text style={styles.btTxt}>Salvar nova senha</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkVoltar}
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
        >
          <Text style={styles.linkVoltarTxt}>Ir para o login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.lg, marginTop: 10, ...shadow.card,
  },
  icone: {
    alignSelf: 'center',
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  titulo: {
    fontSize: 18, fontWeight: '700', color: colors.textPrimary,
    textAlign: 'center', marginBottom: 6,
  },
  legenda: {
    color: colors.textSecondary, fontSize: 13, textAlign: 'center',
    lineHeight: 19, marginBottom: 12,
  },
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
  linkVoltar: { marginTop: 14, alignItems: 'center' },
  linkVoltarTxt: { color: colors.primary, fontWeight: '600', fontSize: 13 },
});
