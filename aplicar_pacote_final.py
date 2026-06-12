"""Pacote final de melhorias do Rango App (8 pedidos + limpeza do repositorio).
Rode na RAIZ do projeto, DEPOIS do aplicar_recuperacao_senha.py:
    python3 aplicar_pacote_final.py

1. Android imersivo: botoes virtuais escondidos (aparecem ao deslizar da borda).
2. Perfil: botao "Acessar versao web" removido por completo.
3. Perfil: secao "Minhas avaliacoes" (notas que o cliente deu, com nome do restaurante).
4. Login do restaurante: "Esqueceu a senha?" (mesmo fluxo seguro por e-mail/deep link).
5. Login do restaurante: caixa "Demo: ..." removida.
6. Painel > Pedidos: botoes Cancelar/Avancar removidos (visao apenas informativa).
7. Cardapio > prato: foto pela CAMERA, GALERIA ou opcoes padrao (e corrige o bug
   que impedia a imagem personalizada de chegar ao banco).
8. KPI "Pedidos hoje" -> "Pedidos" (passa a contar todos os pedidos).
Extras: remove aplicar.sh / aplicartudo.sh / fixfaltantes.sh e poe o link da
apresentacao (Canva) no README.

Requer depois: npx expo install expo-navigation-bar expo-image-picker
"""
import os, sys

ROOT = os.path.dirname(os.path.abspath(__file__))

def ler(p): return open(os.path.join(ROOT, p), encoding="utf-8").read()
def gravar(p, t): open(os.path.join(ROOT, p), "w", encoding="utf-8").write(t)

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

# -------- pre-requisito: recuperacao de senha aplicada --------
if "esqueci-senha" not in ler("Controller.js"):
    print("ERRO: rode primeiro o aplicar_recuperacao_senha.py (este pacote depende dele).")
    sys.exit(1)

# ============================================================
# 1) ANDROID IMERSIVO (App.js)
# ============================================================
patch("App.js", guard="expo-navigation-bar", edits=[
    ("imports do modo imersivo",
     "import { NavigationContainer } from '@react-navigation/native';",
     "import { useEffect } from 'react';\nimport { Platform } from 'react-native';\nimport * as NavigationBar from 'expo-navigation-bar';\nimport { NavigationContainer } from '@react-navigation/native';"),
    ("useEffect que esconde a barra",
     "export default function App() {\n  return (",
     """export default function App() {
  // Modo imersivo no Android: esconde os botões virtuais de navegação;
  // eles reaparecem temporariamente quando o usuário desliza da borda.
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    (async () => {
      try {
        await NavigationBar.setVisibilityAsync('hidden');
        await NavigationBar.setBehaviorAsync('overlay-swipe');
      } catch (e) { /* alguns aparelhos não suportam */ }
    })();
  }, []);

  return ("""),
])

# ============================================================
# 2) PERFIL: remove botao "Acessar versao web"
# ============================================================
patch("src/Perfil.js", guard=None, edits=[
    ("remove import Linking",
     "  ActivityIndicator,\n  Linking,\n} from 'react-native';",
     "  ActivityIndicator,\n} from 'react-native';"),
    ("remove constante WEB_URL",
     "import InputSenha from './components/InputSenha';\n\n// Integração com o app web (Front-end) — mesma base de dados (Supabase).\nconst WEB_URL = process.env.EXPO_PUBLIC_WEB_URL || '';",
     "import InputSenha from './components/InputSenha';"),
    ("remove handler abrirVersaoWeb",
     """  function abrirVersaoWeb() {
    Linking.openURL(WEB_URL).catch(() =>
      Alert.alert('Ops', 'Não foi possível abrir a versão web.')
    );
  }

""",
     ""),
    ("remove botao do JSX",
     """      {WEB_URL ? (
        <TouchableOpacity style={styles.btWeb} onPress={abrirVersaoWeb}>
          <Icon name="globe" size={16} color={colors.primary} />
          <Text style={styles.btWebTxt}>Acessar versão web</Text>
          <Icon name="external-link" size={14} color={colors.primary} />
        </TouchableOpacity>
      ) : null}

""",
     ""),
    ("remove estilos btWeb",
     """  btWeb: {
    marginTop: 16, paddingVertical: 12, borderRadius: radius.md,
    backgroundColor: colors.primaryLight, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderColor: colors.primary,
  },
  btWebTxt: { color: colors.primary, fontWeight: '700' },

""",
     ""),
])

# ============================================================
# 3) PERFIL: secao "Minhas avaliacoes"
# ============================================================
patch("src/services/storage.js", guard="opts.userId", edits=[
    ("mapRating guarda o userId",
     "    restaurantId: r.restaurant_id != null ? String(r.restaurant_id) : null,",
     "    restaurantId: r.restaurant_id != null ? String(r.restaurant_id) : null,\n    userId: r.user_id != null ? String(r.user_id) : null,"),
    ("Ratings.list filtra por usuario",
     "      if (opts.restaurantId) params.set('restaurant_id', opts.restaurantId);",
     "      if (opts.restaurantId) params.set('restaurant_id', opts.restaurantId);\n      if (opts.userId) params.set('user_id', opts.userId);"),
])

patch("src/Perfil.js", guard="Minhas avaliações", edits=[
    ("imports Ratings + Restaurants",
     "import { Session } from './services/storage';",
     "import { Session, Ratings } from './services/storage';\nimport { Restaurants } from './services/restaurants';"),
    ("estados das avaliacoes",
     "  const [carregando, setCarregando] = useState(true);",
     "  const [carregando, setCarregando] = useState(true);\n  const [avaliacoes, setAvaliacoes] = useState([]);\n  const [nomesRest, setNomesRest] = useState({});"),
    ("carrega avaliacoes no inicio",
     """      const u = await Session.get();
      setUser(u);
      setCarregando(false);""",
     """      const u = await Session.get();
      setUser(u);
      if (u?.id) {
        const [avals, rests] = await Promise.all([
          Ratings.list({ userId: u.id }),
          Restaurants.list(),
        ]);
        setAvaliacoes(avals);
        const mapa = {};
        (rests || []).forEach((r) => { mapa[String(r.id)] = r.nome; });
        setNomesRest(mapa);
      }
      setCarregando(false);"""),
    ("secao no JSX",
     """        <TouchableOpacity style={styles.btSalvar} onPress={atualizarSenha}>
          <Text style={styles.btSalvarTxt}>Atualizar senha</Text>
        </TouchableOpacity>
      </View>""",
     """        <TouchableOpacity style={styles.btSalvar} onPress={atualizarSenha}>
          <Text style={styles.btSalvarTxt}>Atualizar senha</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitulo}>Minhas avaliações</Text>
      {avaliacoes.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.semAval}>Você ainda não avaliou nenhum pedido.</Text>
        </View>
      ) : (
        avaliacoes.map((a) => (
          <View key={a.id} style={[styles.card, { marginBottom: 8 }]}>
            <Text style={styles.avalRest}>
              {nomesRest[String(a.restaurantId)] || 'Restaurante'}
            </Text>
            <View style={styles.avalLinha}>
              <Text style={styles.avalLabel}>Entrega</Text>
              <Estrelas valor={a.entrega} />
            </View>
            <View style={styles.avalLinha}>
              <Text style={styles.avalLabel}>Comida</Text>
              <Estrelas valor={a.restaurante} />
            </View>
            {a.comentario ? (
              <Text style={styles.avalComentario}>"{a.comentario}"</Text>
            ) : null}
            <Text style={styles.avalData}>
              {new Date(a.data).toLocaleDateString('pt-BR')}
            </Text>
          </View>
        ))
      )}"""),
    ("componente Estrelas",
     "const styles = StyleSheet.create({",
     """function Estrelas({ valor }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon
          key={n}
          name="star"
          size={14}
          color={n <= Math.round(valor) ? '#F5B400' : colors.divider}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({"""),
    ("estilos da secao",
     "  btExcluir: { marginTop: 10, paddingVertical: 12, alignItems: 'center' },\n  btExcluirTxt: { color: colors.danger, fontWeight: '600' },",
     """  btExcluir: { marginTop: 10, paddingVertical: 12, alignItems: 'center' },
  btExcluirTxt: { color: colors.danger, fontWeight: '600' },

  semAval: { color: colors.textSecondary, fontSize: 13 },
  avalRest: { fontWeight: '700', color: colors.textPrimary, marginBottom: 6 },
  avalLinha: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginVertical: 2,
  },
  avalLabel: { color: colors.textSecondary, fontSize: 12 },
  avalComentario: { color: colors.textPrimary, fontStyle: 'italic', marginTop: 6, fontSize: 13 },
  avalData: { color: colors.textMuted, fontSize: 11, marginTop: 6, textAlign: 'right' },"""),
])

# ============================================================
# 4+5) LOGIN RESTAURANTE: "esqueceu a senha" + sem caixa Demo
# ============================================================
patch("src/restaurante/LoginRestaurante.js", guard="Esqueceu a senha", edits=[
    ("link esqueceu a senha",
     """          <InputSenha
            style={styles.input} value={senha} onChangeText={setSenha}
            placeholder="••••••••"
          />""",
     """          <InputSenha
            style={styles.input} value={senha} onChangeText={setSenha}
            placeholder="••••••••"
          />

          <TouchableOpacity
            style={styles.linkEsqueceu}
            onPress={() => navigation.navigate('Esqueceu', { tipo: 'restaurante' })}
          >
            <Text style={styles.linkEsqueceuTxt}>Esqueceu a senha?</Text>
          </TouchableOpacity>"""),
    ("remove caixa Demo",
     """
          <View style={styles.dicaBox}>
            <Icon name="info" size={14} color={colors.textSecondary} />
            <Text style={styles.dicaTxt}>
              Demo: contato@cantinadoleo.com.br / restaurante123
            </Text>
          </View>""",
     ""),
    ("remove estilos da caixa Demo",
     """
  dicaBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 14, padding: 10, backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
  },
  dicaTxt: { color: colors.textSecondary, fontSize: 12 },
""",
     ""),
    ("estilos do link esqueceu",
     "  erro: { color: colors.danger, marginTop: 8 },",
     "  erro: { color: colors.danger, marginTop: 8 },\n  linkEsqueceu: { alignSelf: 'flex-end', marginTop: 8 },\n  linkEsqueceuTxt: { color: colors.primary, fontSize: 13, fontWeight: '600' },"),
])

# ============================================================
# 4b) FLUXO DE RESET PARA RESTAURANTE (backend + telas + model + migration)
# ============================================================
patch("Controller.js", guard="ehRestaurante", edits=[
    ("/esqueci-senha aceita tipo",
     """    const email = (req.body.email || '').trim();
    const user = email ? await User.findOne({ where: { email } }) : null;""",
     """    const email = (req.body.email || '').trim();
    const ehRestaurante = req.body.tipo === 'restaurante';
    const Modelo = ehRestaurante ? Restaurant : User;
    const user = email ? await Modelo.findOne({ where: { email } }) : null;"""),
    ("link do e-mail carrega o tipo",
     "      await enviarEmailReset(user.email, user.nome, `${PUBLIC_URL}/reset/${token}`);",
     "      await enviarEmailReset(user.email, user.nome, `${PUBLIC_URL}/reset/${token}${ehRestaurante ? '?tipo=restaurante' : ''}`);"),
    ("GET /reset aceita tipo",
     "    const user = await User.findOne({ where: { reset_token: hashToken(req.params.token) } });",
     """    const ehRestaurante = req.query.tipo === 'restaurante';
    const Modelo = ehRestaurante ? Restaurant : User;
    const user = await Modelo.findOne({ where: { reset_token: hashToken(req.params.token) } });"""),
    ("deep link carrega o tipo",
     "    res.send(paginaReset(`${APP_SCHEME}://redefinir-senha?token=${req.params.token}`));",
     "    res.send(paginaReset(`${APP_SCHEME}://redefinir-senha?token=${req.params.token}${ehRestaurante ? '&tipo=restaurante' : ''}`));"),
    ("POST /redefinir-senha aceita tipo",
     "    const user = await User.findOne({ where: { reset_token: hashToken(token) } });",
     """    const ehRestaurante = req.body.tipo === 'restaurante';
    const Modelo = ehRestaurante ? Restaurant : User;
    const user = await Modelo.findOne({ where: { reset_token: hashToken(token) } });"""),
])

patch("models/restaurant.js", guard="reset_token", edits=[
    ("campos de reset no model",
     "      senha: { type: DataTypes.STRING, allowNull: false },\n      auth_id: { type: DataTypes.UUID, allowNull: true },",
     "      senha: { type: DataTypes.STRING, allowNull: false },\n      auth_id: { type: DataTypes.UUID, allowNull: true },\n      reset_token: { type: DataTypes.STRING, allowNull: true },\n      reset_token_expira: { type: DataTypes.DATE, allowNull: true },"),
])

mig = os.path.join(ROOT, "migrations", "20260612130000-add-reset-token-to-restaurants.js")
if not os.path.exists(mig):
    open(mig, "w", encoding="utf-8").write("""'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tabela = await queryInterface.describeTable('restaurants');
    if (!tabela.reset_token) {
      await queryInterface.addColumn('restaurants', 'reset_token', {
        type: Sequelize.STRING, allowNull: true,
      });
    }
    if (!tabela.reset_token_expira) {
      await queryInterface.addColumn('restaurants', 'reset_token_expira', {
        type: Sequelize.DATE, allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('restaurants', 'reset_token');
    await queryInterface.removeColumn('restaurants', 'reset_token_expira');
  },
};
""")
    print("  + criada migration add-reset-token-to-restaurants")

patch("src/Esqueceu.js", guard="tipoRestaurante", edits=[
    ("recebe o tipo pela rota",
     "export default function Esqueceu({ navigation }) {\n  const [email, setEmail] = useState('');",
     "export default function Esqueceu({ navigation, route }) {\n  // tipo 'restaurante' vem do link \"Esqueceu a senha?\" do painel do parceiro.\n  const tipoRestaurante = route?.params?.tipo === 'restaurante';\n  const telaLogin = tipoRestaurante ? 'LoginRestaurante' : 'Login';\n  const [email, setEmail] = useState('');"),
    ("envia o tipo ao backend",
     "        body: JSON.stringify({ email: email.trim() }),",
     "        body: JSON.stringify({ email: email.trim(), tipo: tipoRestaurante ? 'restaurante' : 'cliente' }),"),
    ("rotulo do e-mail",
     "            <Text style={styles.label}>E-mail</Text>",
     "            <Text style={styles.label}>{tipoRestaurante ? 'E-mail comercial' : 'E-mail'}</Text>"),
    ("voltar (tela de sucesso)",
     "            <TouchableOpacity style={styles.bt} onPress={() => navigation.navigate('Login')}>",
     "            <TouchableOpacity style={styles.bt} onPress={() => navigation.navigate(telaLogin)}>"),
    ("voltar (formulario)",
     "            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkVoltar}>",
     "            <TouchableOpacity onPress={() => navigation.navigate(telaLogin)} style={styles.linkVoltar}>"),
])

patch("src/RedefinirSenha.js", guard="tipoRestaurante", edits=[
    ("le o tipo do deep link",
     "  const token = route?.params?.token || '';",
     "  const token = route?.params?.token || '';\n  // o link do e-mail traz &tipo=restaurante quando o reset é do parceiro\n  const tipoRestaurante = route?.params?.tipo === 'restaurante';\n  const telaLogin = tipoRestaurante ? 'LoginRestaurante' : 'Login';"),
    ("envia o tipo ao backend",
     "        body: JSON.stringify({ token, novaSenha: senha }),",
     "        body: JSON.stringify({ token, novaSenha: senha, tipo: tipoRestaurante ? 'restaurante' : 'cliente' }),"),
    ("sucesso volta pro login certo",
     "            onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }),",
     "            onPress: () => navigation.reset({ index: 0, routes: [{ name: telaLogin }] }),"),
    ("link manual volta pro login certo",
     "          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}",
     "          onPress={() => navigation.reset({ index: 0, routes: [{ name: telaLogin }] })}"),
])

# ============================================================
# 6) GERENCIAR PEDIDOS: visao informativa (sem Cancelar/Avancar)
# ============================================================
patch("src/restaurante/GerenciarPedidos.js", guard=None, edits=[
    ("limpa imports sem uso",
     "import {\n  StyleSheet, View, Text, TouchableOpacity, Alert,\n} from 'react-native';",
     "import {\n  StyleSheet, View, Text,\n} from 'react-native';"),
    ("remove handlers de status",
     """  async function avancarStatus(p) {
    const idx = STATUS_FLUXO.indexOf(p.status);
    const proximo = idx >= 0 && idx < STATUS_FLUXO.length - 1
      ? STATUS_FLUXO[idx + 1] : null;
    if (!proximo) return Alert.alert('Pedido', 'Esse pedido já foi entregue.');
    await Orders.update(p.id, { ...p, status: proximo });
    carregar();
    onChange && onChange();
  }

  async function cancelar(p) {
    Alert.alert('Cancelar pedido', `Cancelar pedido #${p.id.slice(-5)}?`, [
      { text: 'Voltar', style: 'cancel' },
      {
        text: 'Cancelar pedido', style: 'destructive',
        onPress: async () => {
          await Orders.update(p.id, { ...p, status: 'Cancelado' });
          carregar();
          onChange && onChange();
        },
      },
    ]);
  }

""",
     ""),
    ("remove botoes do card",
     """            <View style={styles.cardFooter}>
              <Text style={styles.total}>R$ {Number(p.total || 0).toFixed(2)}</Text>
              <View style={styles.acoes}>
                {p.status !== 'Cancelado' && p.status !== 'Entregue' && (
                  <>
                    <TouchableOpacity style={styles.btCancelar} onPress={() => cancelar(p)}>
                      <Text style={styles.btCancelarTxt}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btAvancar} onPress={() => avancarStatus(p)}>
                      <Text style={styles.btAvancarTxt}>Avançar</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>""",
     """            <View style={styles.cardFooter}>
              <Text style={styles.total}>R$ {Number(p.total || 0).toFixed(2)}</Text>
            </View>"""),
    ("remove estilos dos botoes",
     """  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  total: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  acoes: { flexDirection: 'row', gap: 6 },
  btCancelar: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: colors.surfaceAlt, borderRadius: radius.sm },
  btCancelarTxt: { color: colors.danger, fontWeight: '700', fontSize: 12 },
  btAvancar: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: colors.primary, borderRadius: radius.sm },
  btAvancarTxt: { color: colors.textInverse, fontWeight: '700', fontSize: 12 },""",
     """  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  total: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },"""),
])

# ============================================================
# 7) FOTO DO PRATO (camera/galeria/padrao) + correcao imagemUrl
# ============================================================
patch("src/services/catalogo.js", guard="imagemDoPrato", edits=[
    ("mapServerDish padroniza imagemUrl",
     "    imagem_url: d.imagem_url || null,",
     "    imagemUrl: d.imagem_url || null,"),
    ("upsert envia a imagem certa (bug)",
     "        imagem_url: prato.imagem_url,",
     "        imagem_url: prato.imagemUrl || prato.imagem_url || null,"),
    ("helper imagemDoPrato",
     "export const CATALOGO_DEFAULT = [",
     """// Resolve a imagem de um prato: foto enviada pelo restaurante (URL ou base64)
// tem prioridade; senão cai na imagem padrão do imagemKey.
export function imagemDoPrato(p) {
  if (p?.imagemUrl) return { uri: p.imagemUrl };
  return IMAGENS[p?.imagemKey] || IMAGENS.arrozbranco;
}

export const CATALOGO_DEFAULT = ["""),
])

patch("src/CardapioCacarola.js", guard="imagemDoPrato", edits=[
    ("import do helper",
     "import { Catalogo, IMAGENS } from './services/catalogo';",
     "import { Catalogo, IMAGENS, imagemDoPrato } from './services/catalogo';"),
    ("card usa a foto do prato",
     "                source={IMAGENS[p.imagemKey] || IMAGENS.arrozbranco}",
     "                source={imagemDoPrato(p)}"),
])

patch("src/TelaProduto.js", guard="imagemDoPrato", edits=[
    ("import do helper",
     "import { Catalogo, IMAGENS, PRESETS_FOME } from './services/catalogo';",
     "import { Catalogo, IMAGENS, PRESETS_FOME, imagemDoPrato } from './services/catalogo';"),
    ("imagem do produto",
     "          source={IMAGENS[prato.imagemKey]}",
     "          source={imagemDoPrato(prato)}"),
])

patch("src/restaurante/GerenciarCardapio.js", guard="imagemDoPrato", edits=[
    ("import do helper",
     "import { Catalogo, IMAGENS } from '../services/catalogo';",
     "import { Catalogo, IMAGENS, imagemDoPrato } from '../services/catalogo';"),
    ("card usa a foto do prato",
     "              source={IMAGENS[p.imagemKey] || IMAGENS.arrozbranco}",
     "              source={imagemDoPrato(p)}"),
])

patch("src/restaurante/EditarPrato.js", guard="ImagePicker", edits=[
    ("import do image picker",
     "import { Catalogo, IMAGENS } from '../services/catalogo';",
     "import * as ImagePicker from 'expo-image-picker';\nimport { Catalogo, IMAGENS } from '../services/catalogo';"),
    ("funcoes de camera/galeria",
     "  function validar() {",
     """  // Foto vai para o banco como base64; compressão alta para não pesar.
  const OPTS_FOTO = {
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.2,
    base64: true,
  };

  async function tirarFoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      return Alert.alert('Permissão', 'Autorize o uso da câmera para fotografar o prato.');
    }
    const r = await ImagePicker.launchCameraAsync(OPTS_FOTO);
    if (!r.canceled && r.assets?.[0]?.base64) {
      setImagemUrl(`data:image/jpeg;base64,${r.assets[0].base64}`);
    }
  }

  async function escolherDaGaleria() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      return Alert.alert('Permissão', 'Autorize o acesso à galeria para escolher a foto.');
    }
    const r = await ImagePicker.launchImageLibraryAsync(OPTS_FOTO);
    if (!r.canceled && r.assets?.[0]?.base64) {
      setImagemUrl(`data:image/jpeg;base64,${r.assets[0].base64}`);
    }
  }

  function validar() {"""),
    ("botoes de camera/galeria na UI",
     "          <Text style={styles.label}>Ou cole a URL de uma imagem personalizada</Text>",
     """          <View style={styles.fotoRow}>
            <TouchableOpacity style={styles.btFoto} onPress={tirarFoto}>
              <Icon name="camera" size={15} color={colors.primary} />
              <Text style={styles.btFotoTxt}>Tirar foto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btFoto} onPress={escolherDaGaleria}>
              <Icon name="image" size={15} color={colors.primary} />
              <Text style={styles.btFotoTxt}>Galeria</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Ou cole a URL de uma imagem personalizada</Text>"""),
    ("campo URL nao exibe base64 gigante",
     """          <TextInput
            style={styles.input}
            value={imagemUrl}
            onChangeText={setImagemUrl}
            placeholder="https://..."
            placeholderTextColor={colors.placeholder}
            autoCapitalize="none"
            keyboardType="url"
          />""",
     """          <TextInput
            style={styles.input}
            value={imagemUrl.startsWith('data:') ? '' : imagemUrl}
            onChangeText={setImagemUrl}
            placeholder={imagemUrl.startsWith('data:') ? 'Foto carregada ✓ (cole uma URL para substituir)' : 'https://...'}
            placeholderTextColor={colors.placeholder}
            autoCapitalize="none"
            keyboardType="url"
          />"""),
    ("botao remover imagem",
     """          {imagemUrl ? (
            <Image
              source={{ uri: imagemUrl }}
              style={styles.imgPreviewGrande}
              resizeMode="cover"
            />
          ) : null}""",
     """          {imagemUrl ? (
            <Image
              source={{ uri: imagemUrl }}
              style={styles.imgPreviewGrande}
              resizeMode="cover"
            />
          ) : null}
          {imagemUrl ? (
            <TouchableOpacity
              onPress={() => setImagemUrl('')}
              style={{ marginTop: 8, alignSelf: 'center' }}
            >
              <Text style={{ color: colors.danger, fontSize: 12, fontWeight: '600' }}>
                Remover imagem personalizada
              </Text>
            </TouchableOpacity>
          ) : null}"""),
    ("estilos dos botoes de foto",
     "  imgRotulo: { color: colors.textSecondary, fontSize: 11 },",
     """  imgRotulo: { color: colors.textSecondary, fontSize: 11 },

  fotoRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  btFoto: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 11, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.primaryLight,
  },
  btFotoTxt: { color: colors.primary, fontWeight: '700', fontSize: 13 },"""),
])

patch("models/dish.js", guard="DataTypes.TEXT,\n      preco_por_kg", edits=[
    ("imagem_url vira TEXT (cabe base64)",
     "      imagem_url: DataTypes.STRING,",
     "      imagem_url: DataTypes.TEXT,"),
])

mig2 = os.path.join(ROOT, "migrations", "20260612140000-dish-imagem-url-text.js")
if not os.path.exists(mig2):
    open(mig2, "w", encoding="utf-8").write("""'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('dishes', 'imagem_url', {
      type: Sequelize.TEXT, allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('dishes', 'imagem_url', {
      type: Sequelize.STRING, allowNull: true,
    });
  },
};
""")
    print("  + criada migration dish-imagem-url-text")

patch("app.json", guard="expo-image-picker", edits=[
    ("plugin do image picker (permissoes)",
     '    "scheme": "rangoapp",',
     """    "scheme": "rangoapp",
    "plugins": [
      [
        "expo-image-picker",
        {
          "cameraPermission": "O Rango App usa a câmera para fotografar os pratos do cardápio.",
          "photosPermission": "O Rango App acessa suas fotos para você escolher a imagem do prato."
        }
      ]
    ],"""),
    ("permissao de camera",
     '      "permissions": [\n        "ACCESS_FINE_LOCATION",',
     '      "permissions": [\n        "CAMERA",\n        "ACCESS_FINE_LOCATION",'),
])

# ============================================================
# 8) KPI "Pedidos hoje" -> "Pedidos"
# ============================================================
patch("src/restaurante/PainelRestaurante.js", guard=">Pedidos</Text>", edits=[
    ("KPI conta todos os pedidos",
     "      pedidosHoje: pedidosHoje.length,",
     "      pedidosHoje: pedidos.length,"),
    ("legenda Pedidos",
     "          <Text style={styles.kpiLabel}>Pedidos hoje</Text>",
     "          <Text style={styles.kpiLabel}>Pedidos</Text>"),
])

# ============================================================
# EXTRAS: limpeza do repo + link da apresentacao no README
# ============================================================
for lixo in ("aplicar.sh", "aplicartudo.sh", "fixfaltantes.sh"):
    alvo = os.path.join(ROOT, lixo)
    if os.path.exists(alvo):
        os.remove(alvo)
        print(f"  + removido {lixo}")

patch("README.md", guard="canva.link", edits=[
    ("link da apresentacao",
     "Projeto da disciplina **Soluções Mobile — Engenharia de Software (SATC)** · ABP Final.",
     """Projeto da disciplina **Soluções Mobile — Engenharia de Software (SATC)** · ABP Final.

## 📑 Apresentação

Slides da apresentação final (Canva): **https://canva.link/x2uqjv07xfvmg8s**"""),
])

print("\nPronto! Agora rode: npx expo install expo-navigation-bar expo-image-picker")
print("Depois: git add -A && git commit && git push && rebuild do APK.")
