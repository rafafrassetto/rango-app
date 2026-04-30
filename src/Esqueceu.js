import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import logo from '../assets/Logo.png';

const API_URL = 'http://localhost:3000';

export default function Esqueceu({ navigation }) {
  const [email, setEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function recuperar() {
    if (!email || !novaSenha) {
      Alert.alert('Atenção', 'Preencha email e nova senha.');
      return;
    }
    try {
      setEnviando(true);
      const response = await fetch(`${API_URL}/update`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, novaSenha }),
      });
      const json = await response.json();
      Alert.alert('Recuperação de senha', String(json), [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (e) {
      Alert.alert(
        'Erro',
        'Não foi possível atualizar agora. Verifique se o servidor está rodando.'
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Image style={styles.meuCafe} source={logo} />
      <View style={styles.legenda}>
        <Text style={styles.legendaL}>Defina uma nova senha para sua conta</Text>
      </View>
      <View style={styles.blck1}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="white"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Nova senha"
          placeholderTextColor="white"
          secureTextEntry
          value={novaSenha}
          onChangeText={setNovaSenha}
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={recuperar}
        disabled={enviando}
      >
        {enviando ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.inscrevase}>Enviar</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.voltar}>Voltar para login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#4B0000',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  meuCafe: {
    height: 120,
    width: 120,
    marginBottom: 30,
  },
  input: {
    borderBottomWidth: 1,
    padding: 10,
    borderColor: 'white',
    color: 'white',
    width: 240,
    marginBottom: 8,
  },
  blck1: {
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  button: {
    backgroundColor: '#900',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 4,
    marginBottom: 18,
  },
  inscrevase: {
    color: 'white',
    fontWeight: 'bold',
  },
  legenda: {
    marginBottom: 18,
  },
  legendaL: {
    color: 'white',
    fontSize: 13,
    textAlign: 'center',
  },
  voltar: {
    color: 'white',
    textDecorationLine: 'underline',
    fontSize: 12,
  },
});
