import React from 'react';
import TelaProduto from './TelaProduto';

export default function Arroz({ navigation, route }) {
  const id = route?.params?.id || 'arroz-branco';
  return <TelaProduto navigation={navigation} route={{ params: { id } }} />;
}
