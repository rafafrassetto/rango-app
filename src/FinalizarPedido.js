import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Cart, Orders, Addresses } from './services/storage';
import { gerarReciboPdf } from './services/reciboPdf';

export default function FinalizarPedido({ navigation }) {
  const [itens, setItens] = useState([]);
  const [enderecos, setEnderecos] = useState([]);
  const [enderecoSelecionado, setEnderecoSelecionado] = useState(null);
  const [total, setTotal] = useState(0);

  const carregar = useCallback(async () => {
    const cart = await Cart.list();
    setItens(cart);
    setTotal(cart.reduce((acc, item) => acc + Number(item.preco || 0), 0));
    const ends = await Addresses.list();
    setEnderecos(ends);
    if (ends.length > 0 && !enderecoSelecionado) {
      setEnderecoSelecionado(ends[0]);
    }
  }, [enderecoSelecionado]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  async function finalizar() {
    if (itens.length === 0) {
      Alert.alert('Atenção', 'Carrinho vazio.');
      return;
    }
    if (!enderecoSelecionado) {
      Alert.alert(
        'Endereço',
        'Cadastre um endereço de entrega antes de finalizar.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Cadastrar',
            onPress: () => navigation.navigate('EditarEndereco', {}),
          },
        ]
      );
      return;
    }

    const pedido = await Orders.add({
      itens,
      total,
      endereco: enderecoSelecionado,
    });
    await Cart.clear();

    Alert.alert(
      'Pedido enviado!',
      `Seu pedido #${pedido.id.slice(-5)} foi registrado. Deseja gerar o recibo em PDF?`,
      [
        {
          text: 'Não',
          onPress: () => navigation.navigate('MeusPedidos'),
        },
        {
          text: 'Gerar PDF',
          onPress: async () => {
            try {
              await gerarReciboPdf(pedido);
            } catch (e) {
              Alert.alert('PDF', 'Não foi possível gerar o PDF.');
            }
            navigation.navigate('MeusPedidos');
          },
        },
      ]
    );
  }

  function renderItem({ item }) {
    return (
      <View style={styles.itemBox}>
        <Text style={styles.itemNome}>{item.nome}</Text>
        <Text style={styles.itemDetalhe}>
          {item.quantidade}g · R$ {Number(item.preco).toFixed(2)}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Finalizar pedido</Text>

      <Text style={styles.subtitulo}>Itens do carrinho</Text>
      {itens.length === 0 ? (
        <Text style={styles.vazio}>Carrinho vazio.</Text>
      ) : (
        <FlatList
          data={itens}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          style={{ maxHeight: 200 }}
        />
      )}

      <Text style={styles.subtitulo}>Endereço de entrega</Text>
      {enderecos.length === 0 ? (
        <TouchableOpacity
          style={styles.btCadastrar}
          onPress={() => navigation.navigate('EditarEndereco', {})}
        >
          <Text style={styles.btCadastrarTxt}>+ Cadastrar endereço</Text>
        </TouchableOpacity>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {enderecos.map((end) => {
            const ativo = enderecoSelecionado?.id === end.id;
            return (
              <TouchableOpacity
                key={end.id}
                style={[styles.enderecoCard, ativo && styles.enderecoAtivo]}
                onPress={() => setEnderecoSelecionado(end)}
              >
                <Text
                  style={[styles.enderecoTitulo, ativo && { color: 'white' }]}
                >
                  {end.apelido || 'Endereço'}
                </Text>
                <Text style={[styles.enderecoTxt, ativo && { color: 'white' }]}>
                  {end.rua}, {end.numero}
                </Text>
                <Text style={[styles.enderecoTxt, ativo && { color: 'white' }]}>
                  {end.cidade}/{end.estado}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      <View style={styles.totalBox}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValor}>R$ {total.toFixed(2)}</Text>
      </View>

      <TouchableOpacity style={styles.btFinalizar} onPress={finalizar}>
        <Text style={styles.btFinalizarTxt}>Confirmar pedido</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 14,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4B0000',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4B0000',
    marginTop: 12,
    marginBottom: 6,
  },
  itemBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  itemNome: { fontWeight: 'bold', color: '#333' },
  itemDetalhe: { color: '#666' },
  vazio: { color: '#999', fontStyle: 'italic' },
  btCadastrar: {
    backgroundColor: '#4B0000',
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  btCadastrarTxt: { color: 'white', fontWeight: 'bold' },
  enderecoCard: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    marginRight: 8,
    minWidth: 160,
    backgroundColor: '#fafafa',
  },
  enderecoAtivo: { backgroundColor: '#4B0000', borderColor: '#4B0000' },
  enderecoTitulo: { fontWeight: 'bold', color: '#4B0000' },
  enderecoTxt: { color: '#444', fontSize: 12 },
  totalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 12,
  },
  totalLabel: { fontSize: 16, color: '#666' },
  totalValor: { fontSize: 22, fontWeight: 'bold', color: '#4B0000' },
  btFinalizar: {
    marginTop: 16,
    backgroundColor: '#4B0000',
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: 'center',
  },
  btFinalizarTxt: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
