import React, { useEffect, useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity, Alert,
} from 'react-native';
import Icon from '@expo/vector-icons/Feather';
import { RestauranteAuth } from '../services/restauranteAuth';
import { Catalogo } from '../services/catalogo';
import { colors, spacing, radius, shadow } from '../theme/theme';

export default function ConfiguracoesRestaurante({ restaurante, onUpdate }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (restaurante) {
      setNome(restaurante.nome || '');
      setEmail(restaurante.email || '');
      setTelefone(restaurante.telefone || '');
      setCnpj(restaurante.cnpj || '');
    }
  }, [restaurante]);

  async function salvar() {
    if (!restaurante?.id) return;
    if (!nome.trim() || !email.trim()) {
      return Alert.alert('Atenção', 'Nome e e-mail são obrigatórios.');
    }
    setSalvando(true);
    try {
      await RestauranteAuth.update(restaurante.id, {
        nome: nome.trim(),
        email: email.trim(),
        telefone: telefone.trim(),
        cnpj: cnpj.trim(),
      });
      Alert.alert('Pronto', 'Dados atualizados com sucesso.');
      onUpdate && onUpdate();
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar.');
    } finally {
      setSalvando(false);
    }
  }

  function resetarCatalogo() {
    Alert.alert(
      'Restaurar cardápio padrão',
      'Isso vai sobrescrever todos os pratos atuais pelos pratos originais. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar', style: 'destructive',
          onPress: async () => {
            await Catalogo.reset();
            Alert.alert('Pronto', 'Cardápio restaurado.');
            onUpdate && onUpdate();
          },
        },
      ],
    );
  }

  return (
    <View>
      <Text style={styles.titulo}>Dados do restaurante</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Nome fantasia</Text>
        <TextInput
          style={styles.input}
          value={nome}
          onChangeText={setNome}
          placeholder="Ex.: Caçarola Restaurante"
          placeholderTextColor={colors.placeholder}
        />

        <Text style={styles.label}>E-mail comercial</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="restaurante@rango.app"
          placeholderTextColor={colors.placeholder}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Telefone</Text>
        <TextInput
          style={styles.input}
          value={telefone}
          onChangeText={setTelefone}
          placeholder="(48) 0000-0000"
          placeholderTextColor={colors.placeholder}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>CNPJ</Text>
        <TextInput
          style={styles.input}
          value={cnpj}
          onChangeText={setCnpj}
          placeholder="00.000.000/0001-00"
          placeholderTextColor={colors.placeholder}
        />

        <TouchableOpacity
          style={[styles.bt, salvando && { opacity: 0.6 }]}
          onPress={salvar}
          disabled={salvando}
        >
          <Icon name="save" size={14} color={colors.textInverse} />
          <Text style={styles.btTxt}>{salvando ? 'Salvando...' : 'Salvar alterações'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.titulo}>Regras do cardápio</Text>
      <View style={styles.card}>
        <Text style={styles.info}>
          As regras de peso (mínimo, máximo e passo) são definidas individualmente
          em cada prato na aba <Text style={{ fontWeight: '700' }}>Cardápio</Text>.
        </Text>
        <Text style={[styles.info, { marginTop: 6 }]}>
          Caso queira voltar ao cardápio original (arroz, feijão e macarrão padrão),
          use a opção abaixo. Essa ação não pode ser desfeita.
        </Text>

        <TouchableOpacity style={styles.btOutline} onPress={resetarCatalogo}>
          <Icon name="refresh-ccw" size={14} color={colors.danger} />
          <Text style={styles.btOutlineTxt}>Restaurar cardápio padrão</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.titulo}>Sobre</Text>
      <View style={styles.card}>
        <View style={styles.linhaInfo}>
          <Icon name="package" size={14} color={colors.textSecondary} />
          <Text style={styles.infoTxt}>Rango App · Painel do parceiro v1.0</Text>
        </View>
        <View style={styles.linhaInfo}>
          <Icon name="shield" size={14} color={colors.textSecondary} />
          <Text style={styles.infoTxt}>Dados sincronizados com o banco em nuvem</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  titulo: {
    fontSize: 14, fontWeight: '700', color: colors.textSecondary,
    marginTop: 4, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.surface, padding: spacing.lg,
    borderRadius: radius.lg, marginBottom: spacing.lg, ...shadow.card,
  },
  label: { color: colors.textSecondary, fontSize: 12, marginTop: 10, marginBottom: 4 },
  input: {
    backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.inputBorder,
    borderRadius: radius.md, padding: 12, color: colors.textPrimary,
  },
  bt: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: colors.primary, paddingVertical: 14,
    borderRadius: radius.md, marginTop: 18,
  },
  btTxt: { color: colors.textInverse, fontWeight: '700' },
  btOutline: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1, borderColor: colors.danger, paddingVertical: 12,
    borderRadius: radius.md, marginTop: 14,
  },
  btOutlineTxt: { color: colors.danger, fontWeight: '700' },
  info: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },
  linhaInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  infoTxt: { color: colors.textSecondary, fontSize: 12 },
});
