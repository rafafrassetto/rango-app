import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { TextInput } from 'react-native';
import Icon from '@expo/vector-icons/FontAwesome';
import Icon2 from '@expo/vector-icons/Fontisto';
import { Cart } from './services/storage';

const PRECO_REFERENCIA_500G = 40;

export default function TelaProduto({
  navigation,
  nome,
  imagem,
  passo = 50,
  inicial = 50,
  maximo = 500,
}) {
  const [resultado, setResultado] = useState(inicial);
  const [observacao, setObservacao] = useState('');

  const preco = (resultado * PRECO_REFERENCIA_500G) / 500;

  function somar() {
    setResultado((prev) => Math.min(prev + passo, maximo));
  }

  function subtrair() {
    setResultado((prev) => Math.max(prev - passo, passo));
  }

  async function adicionarAoCarrinho() {
    await Cart.add({
      nome,
      quantidade: resultado,
      preco: parseFloat(preco.toFixed(2)),
      observacao,
    });
    Alert.alert('Adicionado', `${nome} adicionado ao carrinho!`, [
      { text: 'Continuar', style: 'cancel' },
      {
        text: 'Ver carrinho',
        onPress: () => navigation.navigate('Carrinho'),
      },
    ]);
  }

  return (
    <ScrollView style={styles.container}>
      <Image style={styles.imagem} source={imagem} resizeMode="cover" />

      <View style={styles.bloco}>
        <Text style={styles.titulo}>{nome}</Text>

        <View style={styles.contadorBox}>
          <TouchableOpacity style={styles.botaoCounter} onPress={subtrair}>
            <Text style={styles.botaoCounterTxt}>-</Text>
          </TouchableOpacity>
          <Text style={styles.resultado}>{resultado}g</Text>
          <TouchableOpacity style={styles.botaoCounter} onPress={somar}>
            <Text style={styles.botaoCounterTxt}>+</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.preco}>
          Preço: <Text style={styles.precoValor}>R$ {preco.toFixed(2)}</Text>
        </Text>

        <View style={styles.anotLabel}>
          <Text style={styles.anotTxt}>Anotação </Text>
          <Icon name="comment-o" size={15} color="#000" />
        </View>
        <TextInput
          style={styles.inputAnot}
          multiline
          maxLength={200}
          value={observacao}
          onChangeText={setObservacao}
          placeholder="Ex: sem cebola, ponto da carne..."
        />

        <TouchableOpacity
          style={styles.btComprar}
          onPress={adicionarAoCarrinho}
        >
          <Text style={styles.btComprarTxt}>Adicionar ao carrinho</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btCarrinho}
          onPress={() => navigation.navigate('Carrinho')}
        >
          <Text style={styles.btComprarTxt}>Ir para carrinho</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.flutuante}>
        <Icon2.Button
          name="shopping-basket"
          size={20}
          color="#900"
          backgroundColor="white"
          onPress={() => navigation.navigate('Carrinho')}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  imagem: { width: '100%', height: 240 },
  bloco: { padding: 18 },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  contadorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  botaoCounter: {
    backgroundColor: '#4B0000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  botaoCounterTxt: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  resultado: { fontSize: 18, marginHorizontal: 18 },
  preco: { fontSize: 16, marginBottom: 16 },
  precoValor: { color: 'green', fontWeight: 'bold' },
  anotLabel: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  anotTxt: { color: '#444' },
  inputAnot: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 14,
  },
  btComprar: {
    backgroundColor: '#4B0000',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 8,
  },
  btCarrinho: {
    backgroundColor: 'gray',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  btComprarTxt: { color: 'white', fontWeight: 'bold' },
  flutuante: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
});
