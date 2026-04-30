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
import { Addresses } from './services/storage';

export default function MeusEnderecos({ navigation }) {
  const [enderecos, setEnderecos] = useState([]);

  const carregar = useCallback(async () => {
    const lista = await Addresses.list();
    setEnderecos(lista);
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  function confirmarExclusao(id) {
    Alert.alert(
      'Excluir endereço',
      'Tem certeza que deseja excluir esse endereço?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await Addresses.remove(id);
            carregar();
          },
        },
      ]
    );
  }

  function renderItem({ item }) {
    return (
      <View style={styles.card}>
        <Text style={styles.titulo}>{item.apelido || 'Endereço'}</Text>
        <Text style={styles.linha}>
          {item.rua}, {item.numero}
          {item.complemento ? ` - ${item.complemento}` : ''}
        </Text>
        <Text style={styles.linha}>
          {item.bairro} {item.cidade ? `- ${item.cidade}` : ''}
          {item.estado ? `/${item.estado}` : ''}
        </Text>
        <Text style={styles.linha}>CEP: {item.cep}</Text>

        <View style={styles.acoes}>
          <TouchableOpacity
            style={[styles.botao, styles.btEditar]}
            onPress={() =>
              navigation.navigate('EditarEndereco', { id: item.id })
            }
          >
            <Text style={styles.botaoTxt}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.botao, styles.btExcluir]}
            onPress={() => confirmarExclusao(item.id)}
          >
            <Text style={styles.botaoTxt}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.tituloTela}>Meus Endereços</Text>
      <TouchableOpacity
        style={styles.btNovo}
        onPress={() => navigation.navigate('EditarEndereco', {})}
      >
        <Text style={styles.btNovoTxt}>+ Novo endereço</Text>
      </TouchableOpacity>

      <FlatList
        data={enderecos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={enderecos.length === 0 && styles.vazio}
        ListEmptyComponent={
          <View style={styles.vazioBox}>
            <Text style={styles.vazioTxt}>
              Nenhum endereço cadastrado ainda.
            </Text>
          </View>
        }
      />
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
  tituloTela: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4B0000',
    marginBottom: 12,
    textAlign: 'center',
  },
  btNovo: {
    backgroundColor: '#4B0000',
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 12,
  },
  btNovoTxt: { color: 'white', fontWeight: 'bold' },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
  },
  titulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4B0000',
    marginBottom: 4,
  },
  linha: { color: '#444', fontSize: 13, marginVertical: 1 },
  acoes: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'flex-end',
  },
  botao: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  btEditar: { backgroundColor: '#4B0000' },
  btExcluir: { backgroundColor: '#888' },
  botaoTxt: { color: 'white', fontWeight: '600' },
  vazio: { flex: 1, justifyContent: 'center' },
  vazioBox: { alignItems: 'center', paddingVertical: 40 },
  vazioTxt: { color: '#666' },
});
