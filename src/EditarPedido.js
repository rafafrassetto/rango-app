import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Orders } from './services/storage';

const STATUS_OPCOES = [
  'Em preparo',
  'Saiu para entrega',
  'Entregue',
  'Cancelado',
];

export default function EditarPedido({ route, navigation }) {
  const { id } = route.params || {};
  const [pedido, setPedido] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    (async () => {
      const p = await Orders.get(id);
      setPedido(p);
      setCarregando(false);
    })();
  }, [id]);

  function alterarItem(idx, campo, valor) {
    const novosItens = [...pedido.itens];
    novosItens[idx] = { ...novosItens[idx], [campo]: valor };
    const total = novosItens.reduce(
      (acc, it) => acc + Number(it.preco || 0),
      0
    );
    setPedido({ ...pedido, itens: novosItens, total });
  }

  function removerItem(idx) {
    const novosItens = pedido.itens.filter((_, i) => i !== idx);
    const total = novosItens.reduce(
      (acc, it) => acc + Number(it.preco || 0),
      0
    );
    setPedido({ ...pedido, itens: novosItens, total });
  }

  async function salvar() {
    await Orders.update(pedido.id, pedido);
    Alert.alert('Sucesso', 'Pedido atualizado!');
    navigation.goBack();
  }

  if (carregando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4B0000" />
      </View>
    );
  }

  if (!pedido) {
    return (
      <View style={styles.center}>
        <Text>Pedido não encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.titulo}>Editar Pedido #{pedido.id.slice(-5)}</Text>

      <Text style={styles.label}>Status</Text>
      <View style={styles.statusBox}>
        {STATUS_OPCOES.map((s) => (
          <TouchableOpacity
            key={s}
            style={[
              styles.statusItem,
              pedido.status === s && styles.statusAtivo,
            ]}
            onPress={() => setPedido({ ...pedido, status: s })}
          >
            <Text
              style={[
                styles.statusTxt,
                pedido.status === s && styles.statusTxtAtivo,
              ]}
            >
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Observação</Text>
      <TextInput
        style={[styles.input, styles.inputArea]}
        value={pedido.observacao || ''}
        onChangeText={(t) => setPedido({ ...pedido, observacao: t })}
        multiline
        placeholder="Sem cebola, ponto da carne..."
      />

      <Text style={styles.label}>Itens</Text>
      {(pedido.itens || []).map((item, idx) => (
        <View key={idx} style={styles.itemBox}>
          <View style={styles.linha}>
            <Text style={styles.itemNome}>{item.nome}</Text>
            <TouchableOpacity onPress={() => removerItem(idx)}>
              <Text style={styles.remover}>Remover</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.linha}>
            <Text style={styles.itemLabel}>Quantidade (g):</Text>
            <TextInput
              style={styles.inputPequeno}
              keyboardType="numeric"
              value={String(item.quantidade || 0)}
              onChangeText={(t) =>
                alterarItem(idx, 'quantidade', Number(t) || 0)
              }
            />
          </View>
          <View style={styles.linha}>
            <Text style={styles.itemLabel}>Preço (R$):</Text>
            <TextInput
              style={styles.inputPequeno}
              keyboardType="numeric"
              value={String(item.preco || 0)}
              onChangeText={(t) =>
                alterarItem(idx, 'preco', parseFloat(t) || 0)
              }
            />
          </View>
        </View>
      ))}

      <View style={styles.totalBox}>
        <Text style={styles.totalTxt}>
          Total: R$ {Number(pedido.total || 0).toFixed(2)}
        </Text>
      </View>

      <TouchableOpacity style={styles.btSalvar} onPress={salvar}>
        <Text style={styles.btSalvarTxt}>Salvar alterações</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.btCancelar}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.btCancelarTxt}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4B0000',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
  },
  inputArea: { minHeight: 60, textAlignVertical: 'top' },
  inputPequeno: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 6,
    width: 90,
    textAlign: 'right',
  },
  statusBox: { flexDirection: 'row', flexWrap: 'wrap' },
  statusItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    margin: 4,
  },
  statusAtivo: { backgroundColor: '#4B0000', borderColor: '#4B0000' },
  statusTxt: { color: '#444' },
  statusTxtAtivo: { color: 'white' },
  itemBox: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#fafafa',
  },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 3,
  },
  itemNome: { fontWeight: 'bold', color: '#4B0000' },
  itemLabel: { color: '#555' },
  remover: { color: '#b00' },
  totalBox: {
    marginTop: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#eee',
    alignItems: 'flex-end',
  },
  totalTxt: { fontSize: 18, fontWeight: 'bold', color: '#4B0000' },
  btSalvar: {
    marginTop: 18,
    backgroundColor: '#4B0000',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  btSalvarTxt: { color: 'white', fontWeight: 'bold' },
  btCancelar: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  btCancelarTxt: { color: '#4B0000' },
});
