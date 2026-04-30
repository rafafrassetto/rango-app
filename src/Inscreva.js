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
  ScrollView,
} from 'react-native';
import fundo from '../assets/LOGOCOMPESSOAS.png';
import { Session } from './services/storage';

const API_URL = 'http://localhost:3000';

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
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(usuario),
      });
      const ress = await response.json();
      await Session.set({ nome: usuario.nome, email, senha });
      Alert.alert('Sucesso', String(ress) || 'Cadastro realizado!', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (e) {
      // fallback offline
      await Session.set({ nome: usuario.nome, email, senha });
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
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.imagem}>
        <Image style={styles.fundo} source={fundo} />
      </View>

      <View style={styles.direction}>
        <TextInput
          onChangeText={setNome}
          value={nome}
          placeholder="Nome"
          style={styles.input}
        />
        <TextInput
          style={styles.input}
          placeholder="Sobrenome"
          value={sobrenome}
          onChangeText={setSobrenome}
          placeholderTextColor="gray"
        />
        <TextInput
          style={styles.input}
          onChangeText={setEmail}
          value={email}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Telefone"
          value={telefone}
          onChangeText={setTelefone}
          keyboardType="phone-pad"
          placeholderTextColor="gray"
        />
        <TextInput
          secureTextEntry
          style={styles.input}
          onChangeText={setSenha}
          value={senha}
          placeholder="Senha"
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={registerUser}
        disabled={enviando}
      >
        {enviando ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.inscrevase}>Inscreva-se</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: 'white',
    justifyContent: 'center',
    padding: 16,
  },
  direction: {
    alignItems: 'center',
    marginVertical: 16,
  },
  imagem: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  fundo: {
    height: 160,
    width: 130,
  },
  input: {
    marginVertical: 8,
    borderBottomWidth: 1,
    borderColor: 'gray',
    color: 'gray',
    width: 240,
    paddingVertical: 6,
  },
  inscrevase: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#4B0000',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginTop: 8,
  },
});
