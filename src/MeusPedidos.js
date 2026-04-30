import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Orders } from './services/storage';

export default function MeusPedidos({ navigation }) {
  const [pedidos, setPedidos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const carregar = useCallback(async () => {
    setRefreshing(true);
    const lista = await Orders.list();
    setPedidos(lista);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  function confirmarExclusao(id) {
    Alert.alert(
      'Excluir pedido',
      'Tem certeza que deseja excluir esse pedido?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await Orders.remove(id);
            carregar();
          },
        },
      ]
    );
  }

  function formatarData(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleString('pt-BR');
    } catch {
      return iso;
    }
  }

  function renderItem({ item }) {
    const totalItens = (item.itens || []).length;
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.titulo}>Pedido #{item.id.slice(-5)}</Text>
          <Text style={styles.status}>{item.status}</Text>
        </View>
        <Text style={styles.info}>Data: {formatarData(item.data)}</Text>
        <Text style={styles.info}>Itens: {totalItens}</Text>
        <Text style={styles.info}>
          Total: R$ {Number(item.total || 0).toFixed(2)}
        </Text>
        {item.endereco ? (
          <Text style={styles.info} numberOfLines={1}>
            Entrega: {item.endereco.rua}, {item.endereco.numero}
          </Text>
        ) : null}

        <View style={styles.acoes}>
          <TouchableOpacity
            style={[styles.botao, styles.btEditar]}
            onPress={() =>
              navigation.navigate('EditarPedido', { id: item.id })
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
      <Text style={styles.tituloTela}>Meus Pedidos</Text>
      <FlatList
        data={pedidos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={pedidos.length === 0 && styles.vazio}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={carregar} />
        }
        ListEmptyComponent={
          <View style={styles.vazioBox}>
            <Text style={styles.vazioTxt}>Nenhum pedido encontrado.</Text>
            <TouchableOpacity
              style={styles.btNovo}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.botaoTxt}>Fazer um pedido</Text>
            </TouchableOpacity>
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
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  titulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4B0000',
  },
  status: {
    color: 'green',
    fontWeight: '600',
  },
  info: {
    color: '#444',
    fontSize: 13,
    marginVertical: 1,
  },
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
  vazioTxt: { color: '#666', marginBottom: 14 },
  btNovo: {
    backgroundColor: '#4B0000',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 4,
  },
});
