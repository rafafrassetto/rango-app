import React from 'react';
import TelaProduto from './TelaProduto';
import feijaopreto from '../assets/feijaopreto.png';

export default function Feijao({ navigation }) {
  return (
    <TelaProduto
      navigation={navigation}
      nome="Feijão Preto"
      imagem={feijaopreto}
    />
  );
}
