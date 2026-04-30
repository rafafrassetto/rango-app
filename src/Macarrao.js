import React from 'react';
import TelaProduto from './TelaProduto';
import macarrao from '../assets/macarraoTomate.png';

export default function Macarrao({ navigation }) {
  return (
    <TelaProduto
      navigation={navigation}
      nome="Macarrão"
      imagem={macarrao}
    />
  );
}
