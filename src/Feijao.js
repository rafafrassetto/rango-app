import React from 'react';
import TelaProduto from './TelaProduto';

export default function Feijao({ navigation, route }) {
  const id = route?.params?.id || 'feijao-preto';
  return <TelaProduto navigation={navigation} route={{ params: { id } }} />;
}
