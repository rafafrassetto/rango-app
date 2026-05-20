import React from 'react';
import { StyleSheet, Text, ScrollView } from 'react-native';
import { colors, spacing } from './theme/theme';

export default function PoliticaPrivacidade() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }}>
      <Text style={styles.titulo}>Política de Privacidade</Text>
      <Text style={styles.paragrafo}>
        O Rango App respeita sua privacidade e protege seus dados pessoais conforme a Lei Geral de
        Proteção de Dados (LGPD, Lei nº 13.709/2018).
      </Text>

      <Text style={styles.secao}>1. Dados coletados</Text>
      <Text style={styles.paragrafo}>
        Coletamos nome, e-mail, telefone, endereços de entrega e histórico de pedidos para viabilizar
        o serviço de delivery.
      </Text>

      <Text style={styles.secao}>2. Finalidade</Text>
      <Text style={styles.paragrafo}>
        Usamos seus dados para autenticar sua conta, processar pedidos, entregar refeições, emitir
        comprovantes e melhorar o app.
      </Text>

      <Text style={styles.secao}>3. Seus direitos (Art. 18 LGPD)</Text>
      <Text style={styles.paragrafo}>
        Você pode a qualquer momento acessar, corrigir, exportar ou excluir seus dados pelo menu
        Perfil. Senhas são armazenadas com criptografia (bcrypt) e nunca são compartilhadas.
      </Text>

      <Text style={styles.secao}>4. Contato do encarregado</Text>
      <Text style={styles.paragrafo}>
        Dúvidas sobre privacidade: privacidade@rangoapp.com.br
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  titulo: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  secao: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginTop: 16, marginBottom: 6 },
  paragrafo: { color: colors.textSecondary, lineHeight: 20, fontSize: 13 },
});
