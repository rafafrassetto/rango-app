import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import logo from '../assets/Logo.png';
import { Session } from './services/storage';

const API_URL = 'http://localhost:3000';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [message, setMessage] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function entrar() {
    if (!email || !senha) {
      setMessage('Preencha email e senha');
      return;
    }
    setCarregando(true);
    setMessage('');
    try {
      const response = await fetch(`${API_URL}/Login`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });
      const json = await response.json();
      if (json === 'error') {
        setMessage('Usuário ou senha inválidos');
        setTimeout(() => setMessage(''), 3000);
      } else {
        await Session.set({ nome: json.nome, email: json.email });
        navigation.navigate('Home');
      }
    } catch (e) {
      // fallback offline
      const local = await Session.get();
      if (local && local.email === email && local.senha === senha) {
        await Session.set({ ...local });
        navigation.navigate('Home');
      } else {
        Alert.alert(
          'Servidor indisponível',
          'Não foi possível conectar ao servidor. Use uma conta cadastrada localmente ou verifique a conexão.'
        );
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Image style={styles.meuCafe} source={logo} />
      <View style={styles.blck1}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          onChangeText={setEmail}
          value={email}
          placeholderTextColor="white"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          secureTextEntry
          style={styles.input}
          placeholder="Senha"
          onChangeText={setSenha}
          value={senha}
          placeholderTextColor="white"
          color="white"
        />
        <TouchableOpacity
          style={styles.buttonesqueceu}
          onPress={() => navigation.navigate('Esqueceu')}
        >
          <Text style={styles.esqueceu}>Esqueceu a senha ?</Text>
        </TouchableOpacity>
      </View>

      {message ? <Text style={styles.erro}>{message}</Text> : null}

      <TouchableOpacity
        style={styles.buttonentrar}
        onPress={entrar}
        disabled={carregando}
      >
        {carregando ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.entrar}>Entrar</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Inscreva')}
      >
        <Text style={styles.inscrevase}>Inscreva-se</Text>
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
  },
  meuCafe: {
    height: 150,
    width: 150,
    marginBottom: 60,
  },
  input: {
    borderBottomWidth: 1,
    padding: 10,
    borderColor: 'white',
    color: 'white',
    width: 240,
  },
  blck1: {
    marginBottom: 40,
    alignItems: 'flex-start',
  },
  esqueceu: {
    marginTop: 16,
    color: 'white',
    fontSize: 12,
    textAlign: 'right',
  },
  buttonesqueceu: {
    alignSelf: 'flex-end',
  },
  button: {
    paddingVertical: 8,
  },
  inscrevase: {
    color: 'white',
    textDecorationLine: 'underline',
  },
  buttonentrar: {
    backgroundColor: '#900',
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 4,
    marginBottom: 14,
  },
  entrar: {
    color: 'white',
    fontWeight: 'bold',
  },
  erro: {
    color: '#ffaaaa',
    marginBottom: 8,
  },
});
