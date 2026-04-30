import React from 'react';
import {
  Image,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from '@expo/vector-icons/Fontisto';
import cacarola from '../assets/cacarola.png';
import sabores from '../assets/sabores.png';
import rest from '../assets/rest.png';

const RESTAURANTES = [
  { id: '1', nome: 'Caçarola Restaurante', dist: '1,5 KM', img: cacarola },
  { id: '2', nome: 'Fábrica De Sabores', dist: '3 KM', img: sabores },
  { id: '3', nome: 'Parrilla', dist: '5 KM', img: rest },
];

export default function Home({ navigation }) {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.tituloSecao}>Restaurantes próximos</Text>

        {RESTAURANTES.map((r) => (
          <TouchableOpacity
            key={r.id}
            style={styles.cardRest}
            onPress={() => navigation.navigate('CardapioCacarola')}
          >
            <Image style={styles.imgRest} source={r.img} />
            <View style={styles.infoRest}>
              <Text style={styles.nomeRest}>{r.nome}</Text>
              <Text style={styles.aberto}>ABERTO</Text>
              <Text style={styles.km}>{r.dist}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <Text style={styles.tituloSecao}>Atalhos</Text>

        <View style={styles.atalhosBox}>
          <TouchableOpacity
            style={styles.atalho}
            onPress={() => navigation.navigate('MeusPedidos')}
          >
            <Icon name="shopping-bag-1" size={24} color="#4B0000" />
            <Text style={styles.atalhoTxt}>Meus Pedidos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.atalho}
            onPress={() => navigation.navigate('MeusEnderecos')}
          >
            <Icon name="map-marker-alt" size={24} color="#4B0000" />
            <Text style={styles.atalhoTxt}>Endereços</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.atalho}
            onPress={() => navigation.navigate('Localizacao')}
          >
            <Icon name="map" size={24} color="#4B0000" />
            <Text style={styles.atalhoTxt}>Mapa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.atalho}
            onPress={() => navigation.navigate('Perfil')}
          >
            <Icon name="person" size={24} color="#4B0000" />
            <Text style={styles.atalhoTxt}>Perfil</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.flutuante}>
        <Icon.Button
          name="shopping-basket"
          size={20}
          color="#900"
          backgroundColor="white"
          onPress={() => navigation.navigate('Carrinho')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  scroll: { padding: 14, paddingBottom: 80 },
  tituloSecao: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4B0000',
    marginVertical: 12,
  },
  cardRest: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  imgRest: { width: 70, height: 70, borderRadius: 6 },
  infoRest: { marginLeft: 14, flex: 1 },
  nomeRest: { fontSize: 18, color: '#222' },
  aberto: { color: 'green', fontSize: 12, marginTop: 2 },
  km: { color: 'gray', fontSize: 12, marginTop: 2 },
  atalhosBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  atalho: {
    width: '48%',
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  atalhoTxt: {
    color: '#4B0000',
    fontWeight: 'bold',
    marginTop: 6,
  },
  flutuante: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
});
