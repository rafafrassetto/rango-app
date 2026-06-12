import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from '@expo/vector-icons/Feather';
import logo from '../assets/Logo.png';
import { colors, spacing, radius, shadow } from './theme/theme';
import { API_URL } from './services/api';

export default function Esqueceu({ navigation, route }) {
  // tipo 'restaurante' vem do link "Esqueceu a senha?" do painel do parceiro.
  const tipoRestaurante = route?.params?.tipo === 'restaurante';
  const telaLogin = tipoRestaurante ? 'LoginRestaurante' : 'Login';
  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

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

  // Pede ao backend o envio do link de redefinição. A resposta é sempre
  // genérica (não revela se o e-mail existe).
  async function solicitarLink() {
    if (!email.trim()) {
      Alert.alert('Atenção', 'Informe o seu e-mail.');
      return;
    }
    setEnviando(true);
    try {
      await fetch(`${API_URL}/esqueci-senha`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), tipo: tipoRestaurante ? 'restaurante' : 'cliente' }),
      });
      setEnviado(true);
    } catch (e) {
      Alert.alert('Servidor offline', 'Tente novamente quando o backend estiver online.');
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
        <View style={styles.hero}>
          <Animated.Image
            source={logo}
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
            resizeMode="contain"
          />
        </View>

        {enviado ? (
          <View style={styles.card}>
            <View style={styles.iconeOk}>
              <Icon name="mail" size={30} color={colors.primary} />
            </View>
            <Text style={[styles.cardTitulo, { textAlign: 'center' }]}>Confira seu e-mail</Text>
            <Text style={[styles.legenda, { textAlign: 'center' }]}>
              Se {email.trim()} estiver cadastrado, você receberá um link para
              redefinir a senha. O link abre direto aqui no app e expira em 1 hora.
            </Text>
            <TouchableOpacity style={styles.bt} onPress={() => navigation.navigate(telaLogin)}>
              <Text style={styles.btTxt}>Voltar para o login</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEnviado(false)} style={styles.linkVoltar}>
              <Text style={styles.linkVoltarTxt}>Enviar para outro e-mail</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitulo}>Recuperar acesso</Text>
            <Text style={styles.legenda}>
              Informe o e-mail da sua conta. Vamos enviar um link seguro para você
              criar uma nova senha.
            </Text>

            <Text style={styles.label}>{tipoRestaurante ? 'E-mail comercial' : 'E-mail'}</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="voce@email.com"
              placeholderTextColor={colors.placeholder}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TouchableOpacity style={styles.bt} onPress={solicitarLink} disabled={enviando}>
              {enviando
                ? <ActivityIndicator color={colors.textInverse} />
                : <Text style={styles.btTxt}>Enviar link de redefinição</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate(telaLogin)} style={styles.linkVoltar}>
              <Text style={styles.linkVoltarTxt}>Voltar para o login</Text>
            </TouchableOpacity>
          </View>
        )}
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
  logo: { width: 220, height: 220 },
  card: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: -20,
    padding: spacing.lg,
    borderRadius: radius.lg,
    ...shadow.card,
  },
  iconeOk: {
    alignSelf: 'center',
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  cardTitulo: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  legenda: { color: colors.textSecondary, fontSize: 13, marginBottom: 14, lineHeight: 19 },
  label: { color: colors.textSecondary, fontSize: 12, marginTop: 8, marginBottom: 4 },
  input: {
    backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.inputBorder,
    borderRadius: radius.md, padding: 12, color: colors.textPrimary, fontSize: 15,
  },
  bt: {
    backgroundColor: colors.primary, paddingVertical: 14,
    borderRadius: radius.md, alignItems: 'center', marginTop: 18,
  },
  btTxt: { color: colors.textInverse, fontWeight: '700' },
  linkVoltar: { marginTop: 16, alignItems: 'center' },
  linkVoltarTxt: { color: colors.primary, fontWeight: '600', fontSize: 14 },
});
