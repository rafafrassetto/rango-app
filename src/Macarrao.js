import React from 'react';
import TelaProduto from './TelaProduto';

export default function Macarrao({ navigation }) {
  return <TelaProduto navigation={navigation} route={{ params: { id: 'macarrao' } }} />;
}
