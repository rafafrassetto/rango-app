import React from 'react';
import TelaProduto from './TelaProduto';
import arrozbranco from '../assets/arrozbranco2.png';

export default function Arroz({ navigation }) {
  return (
    <TelaProduto
      navigation={navigation}
      nome="Arroz Branco"
      imagem={arrozbranco}
    />
  );
}
