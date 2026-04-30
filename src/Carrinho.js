import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Cart } from './services/storage';

export default function Carrinho({ navigation }) {
  const [itens, setItens] = useState([]);
  const [total, setTotal] = useState(0);

  const carregar = useCallback(async () => {
    const lista = await Cart.list();
    setItens(lista);
    setTotal(lista.reduce((acc, item) => acc + Number(item.preco || 0), 0));
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  async function remover(id) {
    await Cart.remove(id);
    carregar();
  }

  async function limpar() {
    Alert.alert('Esvaziar carrinho', 'Remover todos os itens?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Esvaziar',
        style: 'destructive',
        onPress: async () => {
          await Cart.clear();
          carregar();
        },
      },
    ]);
  }

  function renderItem({ item }) {
    return (
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.nome}>{item.nome}</Text>
          <Text style={styles.detalhe}>
            {item.quantidade}g - R$ {Number(item.preco).toFixed(2)}
          </Text>
          {item.observacao ? (
            <Text style={styles.obs}>Obs: {item.observacao}</Text>
          ) : null}
        </View>
        <TouchableOpacity
          style={styles.btRemover}
          onPress={() => remover(item.id)}
        >
          <Text style={styles.btRemoverTxt}>Remover</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Meu Carrinho</Text>

      <FlatList
        data={itens}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={
          itens.length === 0 ? styles.vazio : { paddingBottom: 12 }
        }
        ListEmptyComponent={
          <View style={styles.vazioBox}>
            <Text style={styles.vazioTxt}>Carrinho vazio.</Text>
            <TouchableOpacity
              style={styles.btIr}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.btIrTxt}>Ver restaurantes</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {itens.length > 0 && (
        <View style={styles.rodape}>
          <Text style={styles.total}>Total: R$ {total.toFixed(2)}</Text>
          <View style={styles.acoes}>
            <TouchableOpacity style={styles.btLimpar} onPress={limpar}>
              <Text style={styles.btLimparTxt}>Esvaziar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btFinalizar}
              onPress={() => navigation.navigate('FinalizarPedido')}
            >
              <Text style={styles.btFinalizarTxt}>Finalizar pedido</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4B0000',
    marginBottom: 12,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
  },
  nome: { fontSize: 16, fontWeight: 'bold', color: '#4B0000' },
  detalhe: { color: '#444', marginTop: 2 },
  obs: { color: '#777', fontSize: 12, marginTop: 2 },
  btRemover: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#888',
    borderRadius: 4,
  },
  btRemoverTxt: { color: 'white', fontSize: 12 },
  vazio: { flex: 1, justifyContent: 'center' },
  vazioBox: { alignItems: 'center', paddingVertical: 40 },
  vazioTxt: { color: '#666', marginBottom: 12 },
  btIr: {
    backgroundColor: '#4B0000',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 4,
  },
  btIrTxt: { color: 'white', fontWeight: 'bold' },
  rodape: {
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 10,
    paddingBottom: 16,
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4B0000',
    textAlign: 'right',
    marginBottom: 8,
  },
  acoes: { flexDirection: 'row', justifyContent: 'space-between' },
  btLimpar: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#888',
    alignItems: 'center',
    marginRight: 8,
  },
  btLimparTxt: { color: '#444' },
  btFinalizar: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 4,
    backgroundColor: '#4B0000',
    alignItems: 'center',
  },
  btFinalizarTxt: { color: 'white', fontWeight: 'bold' },
});
