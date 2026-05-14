import React from 'react';
import TelaProduto from './TelaProduto';

export default function Feijao({ navigation }) {
  return <TelaProduto navigation={navigation} route={{ params: { id: 'feijao-preto' } }} />;
}
