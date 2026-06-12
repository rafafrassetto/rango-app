import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import Icon from '@expo/vector-icons/Feather';
import { Session } from './services/storage';
import { colors, spacing, radius, shadow } from './theme/theme';
import { API_URL } from './services/api';

// Integração com o app web (Front-end) — mesma base de dados (Supabase).
const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL || '';

export default function Perfil({ navigation }) {
  const [user, setUser] = useState(null);
  const [novaSenha, setNovaSenha] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    (async () => {
      const u = await Session.get();
      setUser(u);
      setCarregando(false);
    })();
  }, []);

  async function atualizarSenha() {
    if (!novaSenha) return Alert.alert('Atenção', 'Informe a nova senha.');
    try {
      const response = await fetch(`${API_URL}/update`, {
        method: 'PUT',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, novaSenha }),
      });
      const json = await response.json();
      Alert.alert('Resultado', String(json));
      setNovaSenha('');
    } catch (e) {
      Alert.alert('Sem conexão', 'Não foi possível atualizar a senha agora. Tente novamente.');
    }
  }

  function confirmarExcluir() {
    Alert.alert('Excluir conta', 'Essa ação é permanente. Continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: excluirConta },
    ]);
  }

  async function excluirConta() {
    try {
      const r = await fetch(`${API_URL}/delete`, {
        method: 'DELETE',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });
      if (!r.ok) {
        const msg = await r.json().catch(() => 'Não foi possível excluir a conta.');
        Alert.alert('Não foi possível excluir', String(msg));
        return;
      }
    } catch (e) { /* sem conexão: desloga mesmo assim */ }
    await Session.clear();
    Alert.alert('Conta excluída', 'Você será desconectado.');
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  }

  function abrirVersaoWeb() {
    Linking.openURL(WEB_URL).catch(() =>
      Alert.alert('Ops', 'Não foi possível abrir a versão web.')
    );
  }

  async function sair() {
    await Session.clear();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  }

  if (carregando) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.textSecondary }}>Nenhum usuário logado.</Text>
        <TouchableOpacity style={styles.btSalvar} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.btSalvarTxt}>Ir para login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarBox}>
        <View style={styles.avatar}>
          <Icon name="user" size={36} color={colors.primary} />
        </View>
        <Text style={styles.nome}>{user.nome || '-'}</Text>
        <Text style={styles.email}>{user.email || '-'}</Text>
      </View>

      <Text style={styles.subtitulo}>Alterar senha</Text>
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={novaSenha}
          onChangeText={setNovaSenha}
          placeholder="Nova senha"
          placeholderTextColor={colors.placeholder}
        />
        <TouchableOpacity style={styles.btSalvar} onPress={atualizarSenha}>
          <Text style={styles.btSalvarTxt}>Atualizar senha</Text>
        </TouchableOpacity>
      </View>

      {WEB_URL ? (
        <TouchableOpacity style={styles.btWeb} onPress={abrirVersaoWeb}>
          <Icon name="globe" size={16} color={colors.primary} />
          <Text style={styles.btWebTxt}>Acessar versão web</Text>
          <Icon name="external-link" size={14} color={colors.primary} />
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity style={styles.btSair} onPress={sair}>
        <Icon name="log-out" size={16} color={colors.textPrimary} />
        <Text style={styles.btSairTxt}>Sair</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btExcluir} onPress={confirmarExcluir}>
        <Text style={styles.btExcluirTxt}>Excluir minha conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: colors.background },

  avatarBox: { alignItems: 'center', marginVertical: 16 },
  avatar: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  nome: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  email: { color: colors.textSecondary, marginTop: 2 },

  subtitulo: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginTop: 18, marginBottom: 6 },
  card: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.lg, ...shadow.card },
  input: {
    backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.inputBorder,
    borderRadius: radius.md, padding: 12, color: colors.textPrimary,
  },
  btSalvar: {
    backgroundColor: colors.primary, paddingVertical: 12,
    borderRadius: radius.md, alignItems: 'center', marginTop: 10,
  },
  btSalvarTxt: { color: colors.textInverse, fontWeight: '700' },

  btWeb: {
    marginTop: 16, paddingVertical: 12, borderRadius: radius.md,
    backgroundColor: colors.primaryLight, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderColor: colors.primary,
  },
  btWebTxt: { color: colors.primary, fontWeight: '700' },

  btSair: {
    marginTop: 16, paddingVertical: 12, borderRadius: radius.md,
    backgroundColor: colors.surface, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', gap: 6,
    borderWidth: 1, borderColor: colors.divider,
  },
  btSairTxt: { color: colors.textPrimary, fontWeight: '600' },

  btExcluir: { marginTop: 10, paddingVertical: 12, alignItems: 'center' },
  btExcluirTxt: { color: colors.danger, fontWeight: '600' },
});
