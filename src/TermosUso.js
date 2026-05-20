import React from 'react';
import { StyleSheet, Text, ScrollView } from 'react-native';
import { colors, spacing } from './theme/theme';

export default function TermosUso() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }}>
      <Text style={styles.titulo}>Termos de Uso</Text>

      <Text style={styles.paragrafo}>
        Ao utilizar o Rango App você concorda com os termos abaixo. Leia com atenção.
      </Text>

      <Text style={styles.secao}>1. Cadastro e conta</Text>
      <Text style={styles.paragrafo}>
        Você é responsável pela veracidade dos dados informados e pela guarda da sua senha. Contas
        suspeitas podem ser suspensas.
      </Text>

      <Text style={styles.secao}>2. Pedidos e pagamentos</Text>
      <Text style={styles.paragrafo}>
        Os preços são definidos pelo restaurante. O pedido só é considerado confirmado após o
        pagamento ser aprovado.
      </Text>

      <Text style={styles.secao}>3. Entrega</Text>
      <Text style={styles.paragrafo}>
        O prazo de entrega é estimado. Atrasos podem ocorrer por motivos de clima, trânsito ou
        operação do restaurante.
      </Text>

      <Text style={styles.secao}>4. Cancelamento</Text>
      <Text style={styles.paragrafo}>
        Pedidos podem ser cancelados antes do início do preparo. Após esse momento, entre em contato
        com o restaurante.
      </Text>

      <Text style={styles.secao}>5. Avaliações</Text>
      <Text style={styles.paragrafo}>
        Você pode avaliar restaurantes e entregadores. Mantenha respeito; comentários ofensivos
        podem ser removidos.
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
