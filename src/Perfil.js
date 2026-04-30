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
} from 'react-native';
import { Session } from './services/storage';

const API_URL = 'http://localhost:3000';

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
    if (!novaSenha) {
      Alert.alert('Atenção', 'Informe a nova senha.');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/update`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          novaSenha: novaSenha,
        }),
      });
      const json = await response.json();
      Alert.alert('Resultado', String(json));
      setNovaSenha('');
    } catch (e) {
      Alert.alert(
        'Offline',
        'Não foi possível atualizar no servidor agora. Senha será atualizada localmente.'
      );
      const atualizado = { ...user, senha: novaSenha };
      await Session.set(atualizado);
      setUser(atualizado);
      setNovaSenha('');
    }
  }

  function confirmarExcluir() {
    Alert.alert(
      'Excluir conta',
      'Essa ação remove permanentemente sua conta. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: excluirConta,
        },
      ]
    );
  }

  async function excluirConta() {
    try {
      await fetch(`${API_URL}/delete`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email }),
      });
    } catch (e) {
      // segue mesmo offline
    }
    await Session.clear();
    Alert.alert('Conta excluída', 'Você será desconectado.');
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  }

  async function sair() {
    await Session.clear();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  }

  if (carregando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4B0000" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>Nenhum usuário logado.</Text>
        <TouchableOpacity
          style={styles.btSalvar}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.btSalvarTxt}>Ir para login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.titulo}>Meu Perfil</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Nome</Text>
        <Text style={styles.valor}>{user.nome || '-'}</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.valor}>{user.email || '-'}</Text>
      </View>

      <Text style={styles.subtitulo}>Alterar senha</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        value={novaSenha}
        onChangeText={setNovaSenha}
        placeholder="Nova senha"
      />
      <TouchableOpacity style={styles.btSalvar} onPress={atualizarSenha}>
        <Text style={styles.btSalvarTxt}>Atualizar senha</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btSair} onPress={sair}>
        <Text style={styles.btSairTxt}>Sair</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btExcluir} onPress={confirmarExcluir}>
        <Text style={styles.btExcluirTxt}>Excluir minha conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  content: { padding: 16, paddingBottom: 40 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4B0000',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4B0000',
    marginTop: 18,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#eee',
  },
  label: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
    marginTop: 8,
  },
  valor: { fontSize: 16, color: '#222' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    marginBottom: 8,
  },
  btSalvar: {
    backgroundColor: '#4B0000',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  btSalvarTxt: { color: 'white', fontWeight: 'bold' },
  btSair: {
    marginTop: 18,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4B0000',
  },
  btSairTxt: { color: '#4B0000', fontWeight: 'bold' },
  btExcluir: { marginTop: 8, paddingVertical: 12, alignItems: 'center' },
  btExcluirTxt: { color: '#b00' },
});
