"""Recuperacao de senha segura (link por e-mail -> abre no app) + olhinho nas senhas.
Rode na RAIZ do projeto:  python3 aplicar_recuperacao_senha.py

Backend (Controller.js):
  - POST /esqueci-senha      -> gera token (1h, hash sha256 no banco) e envia e-mail
  - GET  /reset/:token       -> pagina ponte que abre rangoapp://redefinir-senha?token=...
  - POST /redefinir-senha    -> valida token e troca a senha (bcrypt)
  - PUT  /update             -> agora EXIGE a senha atual (fecha a brecha)
App:
  - src/Esqueceu.js          -> so pede o e-mail e dispara o link
  - src/RedefinirSenha.js    -> tela nova (chega pelo deep link)
  - App.js                   -> deep linking (rangoapp://) + rota nova
  - app.json                 -> "scheme": "rangoapp"
  - src/components/InputSenha.js -> campo de senha com olho mostrar/ocultar
  - Olhinho aplicado em: Login, Inscreva, Perfil (com campo "senha atual"),
    LoginRestaurante (tambem remove o bypass teste@teste.com que restava
    e corrige a credencial demo falsa), InscrevaseRestaurante
Extras:
  - models/user.js + migration idempotente (reset_token / reset_token_expira)
  - package.json: dependencia nodemailer
"""
import os

ROOT = os.path.dirname(os.path.abspath(__file__))

def ler(p): return open(os.path.join(ROOT, p), encoding="utf-8").read()
def gravar(p, t):
    full = os.path.join(ROOT, p)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    open(full, "w", encoding="utf-8").write(t)

def patch(path, edits, guard=None):
    txt = ler(path)
    if guard and guard in txt:
        print(f"OK  {path}: ja aplicado (pulado).")
        return
    n = 0
    for label, old, new in edits:
        if old in txt:
            txt = txt.replace(old, new, 1)
            n += 1
            print(f"  + {path}: {label}")
        else:
            print(f"  !! {path}: ancora nao encontrada -> '{label}'")
    if n:
        gravar(path, txt)

# ============================================================
# 1) NOVO COMPONENTE: campo de senha com olhinho
# ============================================================
gravar("src/components/InputSenha.js", '''// Campo de senha reutilizável com botão de mostrar/ocultar (olhinho).
// Recebe o mesmo style do TextInput da tela (borda, fundo, padding) no wrapper.
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from '@expo/vector-icons/Feather';
import { colors } from '../theme/theme';

export default function InputSenha({ style, ...props }) {
  const [visivel, setVisivel] = useState(false);
  return (
    <View style={[style, estilos.wrap]}>
      <TextInput
        {...props}
        secureTextEntry={!visivel}
        style={estilos.campo}
        placeholderTextColor={props.placeholderTextColor || colors.placeholder}
      />
      <TouchableOpacity
        onPress={() => setVisivel((v) => !v)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Icon name={visivel ? 'eye-off' : 'eye'} size={18} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

const estilos = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center' },
  campo: { flex: 1, color: colors.textPrimary, fontSize: 15, padding: 0 },
});
''')
print("  + criado src/components/InputSenha.js")

# ============================================================
# 2) MIGRATION (idempotente) + model User
# ============================================================
gravar("migrations/20260612120000-add-reset-token-to-users.js", """'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tabela = await queryInterface.describeTable('users');
    if (!tabela.reset_token) {
      await queryInterface.addColumn('users', 'reset_token', {
        type: Sequelize.STRING, allowNull: true,
      });
    }
    if (!tabela.reset_token_expira) {
      await queryInterface.addColumn('users', 'reset_token_expira', {
        type: Sequelize.DATE, allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'reset_token');
    await queryInterface.removeColumn('users', 'reset_token_expira');
  },
};
""")
print("  + criada migration add-reset-token-to-users")

patch("models/user.js", guard="reset_token", edits=[
    ("campos de reset no model",
     "      senha: { type: DataTypes.STRING, allowNull: false },\n      auth_id: { type: DataTypes.UUID, allowNull: true },",
     "      senha: { type: DataTypes.STRING, allowNull: false },\n      auth_id: { type: DataTypes.UUID, allowNull: true },\n      reset_token: { type: DataTypes.STRING, allowNull: true },\n      reset_token_expira: { type: DataTypes.DATE, allowNull: true },"),
])

# ============================================================
# 3) BACKEND (Controller.js)
# ============================================================
patch("Controller.js", guard="esqueci-senha", edits=[
    ("imports crypto + nodemailer",
     "const bcrypt = require('bcryptjs');",
     "const bcrypt = require('bcryptjs');\nconst crypto = require('crypto');\nconst nodemailer = require('nodemailer');"),

    ("PUT /update exige a senha atual",
     """app.put('/update', async (req, res) => {
  try {
    const senhaHash = await bcrypt.hash(req.body.novaSenha, 10);
    const [count] = await User.update(
      { senha: senhaHash },
      { where: { email: req.body.email } }
    );
    if (count) return res.send(JSON.stringify('Senha atualizada com sucesso!'));
    res.status(404).send(JSON.stringify('Usuário não encontrado'));
  } catch (e) {
    res.status(500).send(JSON.stringify('Erro interno'));
  }
});""",
     """app.put('/update', async (req, res) => {
  try {
    const { email, senhaAtual, novaSenha } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).send(JSON.stringify('Usuário não encontrado'));
    const confere = senhaAtual && (await bcrypt.compare(senhaAtual, user.senha));
    if (!confere) return res.status(401).send(JSON.stringify('Senha atual incorreta'));
    const senhaHash = await bcrypt.hash(novaSenha, 10);
    await user.update({ senha: senhaHash });
    res.send(JSON.stringify('Senha atualizada com sucesso!'));
  } catch (e) {
    res.status(500).send(JSON.stringify('Erro interno'));
  }
});"""),

    ("rotas de recuperacao de senha",
     "// =================== RESTAURANTES ===================",
     """// =================== RECUPERAÇÃO DE SENHA ===================
// Fluxo seguro: o usuário pede o link por e-mail; o token aleatório fica
// guardado com hash e expira em 1 hora. O e-mail leva a uma página ponte
// (GET /reset/:token) que abre o app via deep link rangoapp://.
const PUBLIC_URL = process.env.PUBLIC_URL || 'https://rango-api.onrender.com';
const APP_SCHEME = 'rangoapp';

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function enviarEmailReset(para, nome, link) {
  // Sem SMTP configurado, o link sai no log do servidor (útil em dev).
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[reset-senha] SMTP não configurado. Link para ${para}: ${link}`);
    return;
  }
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transporter.sendMail({
      from: `"Rango App" <${process.env.SMTP_USER}>`,
      to: para,
      subject: 'Redefinição de senha — Rango App',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:440px;margin:0 auto;">
          <div style="background:#EA1D2C;border-radius:12px 12px 0 0;padding:18px;text-align:center;">
            <span style="color:#fff;font-size:22px;font-weight:bold;">Rango App</span>
          </div>
          <div style="border:1px solid #eee;border-top:0;border-radius:0 0 12px 12px;padding:24px;">
            <p>Olá, <strong>${nome || ''}</strong>!</p>
            <p>Recebemos um pedido para redefinir a sua senha. Toque no botão abaixo
            <strong>pelo celular com o Rango App instalado</strong>:</p>
            <p style="text-align:center;margin:26px 0;">
              <a href="${link}" style="background:#EA1D2C;color:#fff;text-decoration:none;
                 padding:14px 28px;border-radius:10px;font-weight:bold;display:inline-block;">
                Redefinir minha senha
              </a>
            </p>
            <p style="color:#888;font-size:12px;">O link expira em 1 hora. Se você não pediu
            a redefinição, ignore este e-mail — sua senha continua a mesma.</p>
          </div>
        </div>`,
    });
  } catch (e) {
    console.log(`[reset-senha] Falha ao enviar e-mail (${e.message}). Link: ${link}`);
  }
}

function paginaReset(deepLink) {
  const corpo = deepLink
    ? `<p style="color:#444;">Toque no botão para abrir o aplicativo e criar sua nova senha.</p>
       <a href="${deepLink}" style="display:inline-block;background:#EA1D2C;color:#fff;
          padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:bold;">Abrir no Rango App</a>
       <p style="color:#9A9A9A;font-size:12px;margin-top:18px;">Abra este link no celular onde o app está instalado.</p>
       <script>setTimeout(function(){ window.location = ${JSON.stringify(deepLink)}; }, 400);</script>`
    : `<p style="color:#444;">Este link de redefinição é <strong>inválido ou expirou</strong>.</p>
       <p style="color:#9A9A9A;font-size:13px;">Volte ao app e solicite um novo em “Esqueceu a senha?”.</p>`;
  return `<!doctype html><html lang="pt-br"><head><meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>Rango App — Redefinir senha</title></head>
    <body style="font-family:Arial,sans-serif;background:#F7F7F8;text-align:center;padding:48px 16px;">
      <div style="max-width:400px;margin:0 auto;background:#fff;border-radius:14px;padding:30px;
                  box-shadow:0 2px 10px rgba(0,0,0,0.06);">
        <h1 style="color:#EA1D2C;margin:0 0 14px;">Rango App</h1>
        ${corpo}
      </div>
    </body></html>`;
}

// Resposta sempre genérica para não revelar quais e-mails existem na base.
app.post('/esqueci-senha', async (req, res) => {
  const mensagem = 'Se este e-mail estiver cadastrado, você receberá um link de redefinição.';
  try {
    const email = (req.body.email || '').trim();
    const user = email ? await User.findOne({ where: { email } }) : null;
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      await user.update({
        reset_token: hashToken(token),
        reset_token_expira: new Date(Date.now() + 60 * 60 * 1000),
      });
      await enviarEmailReset(user.email, user.nome, `${PUBLIC_URL}/reset/${token}`);
    }
    res.json({ ok: true, mensagem });
  } catch (e) {
    res.status(500).json({ erro: 'Erro interno' });
  }
});

// Página ponte: e-mails não abrem rangoapp:// direto, então o link do e-mail
// é HTTPS e esta página redireciona para o deep link do app.
app.get('/reset/:token', async (req, res) => {
  res.set('Content-Type', 'text/html; charset=utf-8');
  try {
    const user = await User.findOne({ where: { reset_token: hashToken(req.params.token) } });
    const valido = user && user.reset_token_expira && new Date(user.reset_token_expira) > new Date();
    if (!valido) return res.status(400).send(paginaReset(null));
    res.send(paginaReset(`${APP_SCHEME}://redefinir-senha?token=${req.params.token}`));
  } catch (e) {
    res.status(400).send(paginaReset(null));
  }
});

app.post('/redefinir-senha', async (req, res) => {
  try {
    const { token, novaSenha } = req.body;
    if (!token || !novaSenha || String(novaSenha).length < 6) {
      return res.status(400).json({ erro: 'A nova senha deve ter pelo menos 6 caracteres.' });
    }
    const user = await User.findOne({ where: { reset_token: hashToken(token) } });
    const valido = user && user.reset_token_expira && new Date(user.reset_token_expira) > new Date();
    if (!valido) {
      return res.status(400).json({ erro: 'Link inválido ou expirado. Solicite um novo.' });
    }
    await user.update({
      senha: await bcrypt.hash(String(novaSenha), 10),
      reset_token: null,
      reset_token_expira: null,
    });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ erro: 'Erro interno' });
  }
});

// =================== RESTAURANTES ==================="""),
])

# ============================================================
# 4) package.json: nodemailer
# ============================================================
patch("package.json", guard='"nodemailer"', edits=[
    ("dependencia nodemailer",
     '    "morgan": "^1.10.0",',
     '    "morgan": "^1.10.0",\n    "nodemailer": "^6.9.14",'),
])

# ============================================================
# 5) app.json: scheme do deep link
# ============================================================
patch("app.json", guard='"scheme"', edits=[
    ("scheme rangoapp",
     '    "orientation": "portrait",',
     '    "orientation": "portrait",\n    "scheme": "rangoapp",'),
])

# ============================================================
# 6) App.js: rota nova + deep linking
# ============================================================
patch("App.js", guard="RedefinirSenha", edits=[
    ("import da tela",
     "import AvaliarPedido from './src/AvaliarPedido';",
     "import AvaliarPedido from './src/AvaliarPedido';\nimport RedefinirSenha from './src/RedefinirSenha';"),
    ("config de deep linking",
     "const Stack = createNativeStackNavigator();",
     """const Stack = createNativeStackNavigator();

// Deep linking: o link do e-mail (rangoapp://redefinir-senha?token=...)
// abre o app direto na tela de redefinição de senha.
const linking = {
  prefixes: ['rangoapp://'],
  config: {
    screens: {
      RedefinirSenha: 'redefinir-senha',
    },
  },
};"""),
    ("linking no NavigationContainer",
     "    <NavigationContainer>",
     "    <NavigationContainer linking={linking}>"),
    ("registro da rota",
     """        <Stack.Screen
          name="Esqueceu"
          component={Esqueceu}
          options={{ headerShown: false }}
        />""",
     """        <Stack.Screen
          name="Esqueceu"
          component={Esqueceu}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RedefinirSenha"
          component={RedefinirSenha}
          options={{ title: 'Redefinir senha', headerLeft: () => null }}
        />"""),
])

# ============================================================
# 7) Esqueceu.js: agora so pede o e-mail (reescrita completa)
# ============================================================
gravar("src/Esqueceu.js", '''import React, { useState, useEffect, useRef } from 'react';
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

export default function Esqueceu({ navigation }) {
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
        body: JSON.stringify({ email: email.trim() }),
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
            <TouchableOpacity style={styles.bt} onPress={() => navigation.navigate('Login')}>
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

            <TouchableOpacity style={styles.bt} onPress={solicitarLink} disabled={enviando}>
              {enviando
                ? <ActivityIndicator color={colors.textInverse} />
                : <Text style={styles.btTxt}>Enviar link de redefinição</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkVoltar}>
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
''')
print("  + reescrito src/Esqueceu.js (fluxo por e-mail)")

# ============================================================
# 8) Tela nova: RedefinirSenha.js
# ============================================================
gravar("src/RedefinirSenha.js", '''import React, { useState } from 'react';
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
''')
print("  + criada src/RedefinirSenha.js")

# ============================================================
# 9) Olhinho nas telas existentes
# ============================================================
patch("src/Login.js", guard="InputSenha", edits=[
    ("import",
     "import logo from '../assets/Logo.png';",
     "import logo from '../assets/Logo.png';\nimport InputSenha from './components/InputSenha';"),
    ("campo senha com olhinho",
     """          <TextInput
            secureTextEntry
            style={styles.input}
            placeholder="••••••••"
            onChangeText={setSenha}
            value={senha}
            placeholderTextColor={colors.placeholder}
          />""",
     """          <InputSenha
            style={styles.input}
            placeholder="••••••••"
            onChangeText={setSenha}
            value={senha}
          />"""),
])

patch("src/Inscreva.js", guard="InputSenha", edits=[
    ("import",
     "import { Session } from './services/storage';",
     "import { Session } from './services/storage';\nimport InputSenha from './components/InputSenha';"),
    ("campo senha com olhinho",
     """          <TextInput style={styles.input} value={senha} onChangeText={setSenha} secureTextEntry placeholder="••••••••" placeholderTextColor={colors.placeholder} />""",
     """          <InputSenha style={styles.input} value={senha} onChangeText={setSenha} placeholder="••••••••" />"""),
])

patch("src/Perfil.js", guard="InputSenha", edits=[
    ("import",
     "import { API_URL } from './services/api';",
     "import { API_URL } from './services/api';\nimport InputSenha from './components/InputSenha';"),
    ("estado senhaAtual",
     "  const [novaSenha, setNovaSenha] = useState('');",
     "  const [senhaAtual, setSenhaAtual] = useState('');\n  const [novaSenha, setNovaSenha] = useState('');"),
    ("atualizarSenha envia senha atual",
     """    if (!novaSenha) return Alert.alert('Atenção', 'Informe a nova senha.');
    try {
      const response = await fetch(`${API_URL}/update`, {
        method: 'PUT',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, novaSenha }),
      });
      const json = await response.json();
      Alert.alert('Resultado', String(json));
      setNovaSenha('');""",
     """    if (!senhaAtual || !novaSenha) {
      return Alert.alert('Atenção', 'Informe a senha atual e a nova senha.');
    }
    try {
      const response = await fetch(`${API_URL}/update`, {
        method: 'PUT',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, senhaAtual, novaSenha }),
      });
      const json = await response.json();
      Alert.alert('Resultado', String(json));
      if (response.ok) {
        setSenhaAtual('');
        setNovaSenha('');
      }"""),
    ("campos com olhinho",
     """        <TextInput
          style={styles.input}
          secureTextEntry
          value={novaSenha}
          onChangeText={setNovaSenha}
          placeholder="Nova senha"
          placeholderTextColor={colors.placeholder}
        />""",
     """        <InputSenha
          style={styles.input}
          value={senhaAtual}
          onChangeText={setSenhaAtual}
          placeholder="Senha atual"
        />
        <InputSenha
          style={[styles.input, { marginTop: 10 }]}
          value={novaSenha}
          onChangeText={setNovaSenha}
          placeholder="Nova senha"
        />"""),
])

patch("src/restaurante/LoginRestaurante.js", guard="InputSenha", edits=[
    ("import",
     "import { RestauranteAuth } from '../services/restauranteAuth';",
     "import { RestauranteAuth } from '../services/restauranteAuth';\nimport InputSenha from '../components/InputSenha';"),
    ("remove bypass teste@teste.com",
     """    // Acesso de Desenvolvedor (Bypass)
    if (email === 'teste@teste.com' && senha === '123456') {
      await RestauranteAuth.setSession({ restaurante: 'Restaurante Teste', email: 'teste@teste.com' });
      navigation.reset({ index: 0, routes: [{ name: 'PainelRestaurante' }] });
      return;
    }

""",
     ""),
    ("credencial demo real",
     "              Demo: restaurante@rango.app / 123456",
     "              Demo: contato@cantinadoleo.com.br / restaurante123"),
    ("campo senha com olhinho",
     """          <TextInput
            style={styles.input} value={senha} onChangeText={setSenha}
            placeholder="••••••••" placeholderTextColor={colors.placeholder}
            secureTextEntry
          />""",
     """          <InputSenha
            style={styles.input} value={senha} onChangeText={setSenha}
            placeholder="••••••••"
          />"""),
])

patch("src/InscrevaseRestaurante.js", guard="InputSenha", edits=[
    ("import",
     "import { RestauranteAuth } from './services/restauranteAuth';",
     "import { RestauranteAuth } from './services/restauranteAuth';\nimport InputSenha from './components/InputSenha';"),
    ("campo senha com olhinho",
     """        <TextInput style={styles.input} value={form.senha} onChangeText={(t) => setCampo('senha', t)} secureTextEntry placeholderTextColor={colors.placeholder} />""",
     """        <InputSenha style={styles.input} value={form.senha} onChangeText={(t) => setCampo('senha', t)} placeholder="••••••••" />"""),
])

print("\\nPronto! Revise com `git diff` e siga o passo a passo (banco + SMTP + rebuild).")
