import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity, Image,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Animated,
} from 'react-native';
import Icon from '@expo/vector-icons/Feather';
import logo from '../../assets/Logo.png';
import { RestauranteAuth } from '../services/restauranteAuth';
import InputSenha from '../components/InputSenha';
import { colors, spacing, radius, shadow } from '../theme/theme';

export default function LoginRestaurante({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
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
    if (!email || !senha) return setErro('Preencha e-mail e senha.');

    setCarregando(true); setErro('');
    try {
      const r = await RestauranteAuth.login(email.trim(), senha);
      if (!r) {
        setErro('E-mail ou senha inválidos.');
      } else {
        await RestauranteAuth.setSession(r);
        navigation.reset({ index: 0, routes: [{ name: 'PainelRestaurante' }] });
      }
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível entrar.');
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
        <View style={styles.hero}>
          <View style={styles.badge}>
            <Icon name="briefcase" size={14} color={colors.textInverse} />
            <Text style={styles.badgeTxt}>ÁREA DO RESTAURANTE</Text>
          </View>
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

        <View style={styles.card}>
          <Text style={styles.cardTitulo}>Acessar painel</Text>

          <Text style={styles.label}>E-mail comercial</Text>
          <TextInput
            style={styles.input} value={email} onChangeText={setEmail}
            placeholder="restaurante@rango.app"
            placeholderTextColor={colors.placeholder}
            autoCapitalize="none" keyboardType="email-address"
          />

          <Text style={styles.label}>Senha</Text>
          <InputSenha
            style={styles.input} value={senha} onChangeText={setSenha}
            placeholder="••••••••"
          />

          <TouchableOpacity
            style={styles.linkEsqueceu}
            onPress={() => navigation.navigate('Esqueceu', { tipo: 'restaurante' })}
          >
            <Text style={styles.linkEsqueceuTxt}>Esqueceu a senha?</Text>
          </TouchableOpacity>

          {erro ? <Text style={styles.erro}>{erro}</Text> : null}

          <TouchableOpacity style={styles.bt} onPress={entrar} disabled={carregando}>
            {carregando ? <ActivityIndicator color={colors.textInverse} /> : <Text style={styles.btTxt}>Entrar no painel</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btOutline}
            onPress={() => navigation.navigate('InscrevaseRestaurante')}
          >
            <Text style={styles.btOutlineTxt}>Quero cadastrar meu restaurante</Text>
          </TouchableOpacity>

        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.voltar}>
          <Text style={styles.voltarTxt}>← Voltar para o app do cliente</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.background },
  hero: {
    backgroundColor: '#2B2B2B', // tom mais corporativo no painel
    paddingTop: 30, paddingBottom: 20, alignItems: 'center',
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radius.pill, marginBottom: 10,
  },
  badgeTxt: { color: colors.textInverse, fontSize: 10, fontWeight: '700' },
  logo: { width: 180, height: 180, marginBottom: 0 },
  heroTitulo: { color: colors.textInverse, fontSize: 20, fontWeight: '700' },
  heroSub: { color: '#C9C9C9', fontSize: 12, marginTop: 4, textAlign: 'center', paddingHorizontal: 30 },

  card: {
    backgroundColor: colors.surface, marginHorizontal: spacing.lg, marginTop: -20,
    padding: spacing.lg, borderRadius: radius.lg, ...shadow.card,
  },
  cardTitulo: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  label: { color: colors.textSecondary, fontSize: 12, marginTop: 8, marginBottom: 4 },
  input: {
    backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.inputBorder,
    borderRadius: radius.md, padding: 12, color: colors.textPrimary,
  },
  erro: { color: colors.danger, marginTop: 8 },
  linkEsqueceu: { alignSelf: 'flex-end', marginTop: 8 },
  linkEsqueceuTxt: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  bt: {
    backgroundColor: colors.primary, paddingVertical: 14,
    borderRadius: radius.md, alignItems: 'center', marginTop: 18,
  },
  btTxt: { color: colors.textInverse, fontWeight: '700' },

  btOutline: {
    marginTop: 8, paddingVertical: 12, borderRadius: radius.md,
    alignItems: 'center', borderWidth: 1, borderColor: colors.divider,
  },
  btOutlineTxt: { color: colors.textPrimary, fontWeight: '600' },

  voltar: { padding: spacing.lg, alignItems: 'center', marginTop: 4 },
  voltarTxt: { color: colors.textSecondary, fontSize: 13 },
});
