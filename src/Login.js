import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import logo from '../assets/Logo.png';
import InputSenha from './components/InputSenha';
import { Session } from './services/storage';
import { colors, spacing, radius, shadow } from './theme/theme';
import { API_URL } from './services/api';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [message, setMessage] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Animação da Logo
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animValue, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

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
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });
      const json = await response.json();
      if (json === 'error') {
        setMessage('Usuário ou senha inválidos');
        setTimeout(() => setMessage(''), 3000);
      } else {
        await Session.set({ id: json.id, nome: json.nome, email: json.email });
        navigation.navigate('Home');
      }
    } catch (e) {
      const local = await Session.get();
      if (local && local.email === email && local.senha === senha) {
        await Session.set({ ...local });
        navigation.navigate('Home');
      } else {
        Alert.alert(
          'Servidor indisponível',
          'Não foi possível conectar. Use uma conta cadastrada localmente ou verifique a conexão.'
        );
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Cabeçalho com logo preservada e fundo vermelho de marca */}
        <View style={styles.hero}>
          <Animated.Image
            style={[
              styles.logo,
              {
                opacity: animValue,
                transform: [
                  {
                    scale: animValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 1],
                    }),
                  },
                ],
              },
            ]}
            source={logo}
            resizeMode="contain"
          />
        </View>

        {/* Card branco com os campos, estilo iFood */}
        <View style={styles.card}>
          <Text style={styles.cardTitulo}>Acesse sua conta</Text>

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="voce@email.com"
            onChangeText={setEmail}
            value={email}
            placeholderTextColor={colors.placeholder}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Senha</Text>
          <InputSenha
            style={styles.input}
            placeholder="••••••••"
            onChangeText={setSenha}
            value={senha}
          />

          <TouchableOpacity
            style={styles.linkEsqueceu}
            onPress={() => navigation.navigate('Esqueceu')}
          >
            <Text style={styles.linkEsqueceuTxt}>Esqueceu a senha?</Text>
          </TouchableOpacity>

          {message ? <Text style={styles.erro}>{message}</Text> : null}

          <TouchableOpacity
            style={styles.btPrincipal}
            onPress={entrar}
            disabled={carregando}
          >
            {carregando
              ? <ActivityIndicator color={colors.textInverse} />
              : <Text style={styles.btPrincipalTxt}>Entrar</Text>}
          </TouchableOpacity>

          <View style={styles.divisor}>
            <View style={styles.linhaDiv} />
            <Text style={styles.divTxt}>ou</Text>
            <View style={styles.linhaDiv} />
          </View>

          <TouchableOpacity
            style={styles.btSecundario}
            onPress={() => navigation.navigate('Inscreva')}
          >
            <Text style={styles.btSecundarioTxt}>Criar conta</Text>
          </TouchableOpacity>
        </View>

        {/* Acesso restaurante */}
        <TouchableOpacity
          style={styles.linkRest}
          onPress={() => navigation.navigate('LoginRestaurante')}
        >
          <Text style={styles.linkRestTxt}>Sou restaurante · Entrar pelo painel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.background },
  hero: {
    backgroundColor: colors.primary,
    paddingTop: 30,
    paddingBottom: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  logo: { width: 220, height: 220, marginBottom: 0 },
  heroTitulo: { color: colors.textInverse, fontSize: 22, fontWeight: '700' },
  heroSub: { color: '#FFD8DA', fontSize: 13, marginTop: 4 },

  card: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: -20,
    padding: spacing.lg,
    borderRadius: radius.lg,
    ...shadow.card,
  },
  cardTitulo: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 14 },

  label: { fontSize: 12, color: colors.textSecondary, marginTop: 8, marginBottom: 4 },
  input: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: 15,
  },

  linkEsqueceu: { alignSelf: 'flex-end', marginTop: 8 },
  linkEsqueceuTxt: { color: colors.primary, fontSize: 13, fontWeight: '600' },

  erro: { color: colors.danger, marginTop: 8 },

  btPrincipal: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: 18,
  },
  btPrincipalTxt: { color: colors.textInverse, fontWeight: '700', fontSize: 15 },

  divisor: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  linhaDiv: { flex: 1, height: 1, backgroundColor: colors.divider },
  divTxt: { marginHorizontal: 10, color: colors.textMuted, fontSize: 12 },

  btSecundario: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  btSecundarioTxt: { color: colors.primary, fontWeight: '700', fontSize: 15 },

  linkRest: { alignItems: 'center', padding: spacing.lg, marginTop: 8 },
  linkRestTxt: { color: colors.textSecondary, fontSize: 13, textDecorationLine: 'underline' },
});
