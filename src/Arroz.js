import React from 'react';
import TelaProduto from './TelaProduto';

export default function Arroz({ navigation }) {
  // delega para a tela genérica passando o id do catálogo
  return <TelaProduto navigation={navigation} route={{ params: { id: 'arroz-branco' } }} />;
}
