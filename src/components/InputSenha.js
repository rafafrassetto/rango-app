// Campo de senha reutilizável com botão de mostrar/ocultar (olhinho).
// Recebe o mesmo style do TextInput da tela (borda, fundo, padding) no wrapper.
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from '@expo/vector-icons/Feather';
import { colors } from '../theme/theme';

export default function InputSenha({ style, ...props }) {
  const [visivel, setVisivel] = useState(false);
  return (
    <View style={[style, estilos.wrap]}>
      <TextInput
        {...props}
        secureTextEntry={!visivel}
        style={estilos.campo}
        placeholderTextColor={props.placeholderTextColor || colors.placeholder}
      />
      <TouchableOpacity
        onPress={() => setVisivel((v) => !v)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Icon name={visivel ? 'eye-off' : 'eye'} size={18} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

const estilos = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center' },
  campo: { flex: 1, color: colors.textPrimary, fontSize: 15, padding: 0 },
});
