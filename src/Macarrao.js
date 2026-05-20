import React from 'react';
import TelaProduto from './TelaProduto';

export default function Macarrao({ navigation, route }) {
  const id = route?.params?.id || 'macarrao';
  return <TelaProduto navigation={navigation} route={{ params: { id } }} />;
}
