import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Addresses } from './services/storage';

export default function Localizacao({ navigation }) {
  const [enderecos, setEnderecos] = useState([]);
  const [posicao, setPosicao] = useState({
    latitude: -28.7032,
    longitude: -49.4093,
  });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          setPosicao({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      } catch (e) {
        // mantém posição padrão (SATC)
      }
      const lista = await Addresses.list();
      setEnderecos(lista);
      setCarregando(false);
    })();
  }, []);

  if (carregando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4B0000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          ...posicao,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Marker
          coordinate={posicao}
          title="Você está aqui"
          description="Ponto atual de entrega"
          pinColor="#4B0000"
        />
        {enderecos
          .filter((e) => e.latitude && e.longitude)
          .map((e) => (
            <Marker
              key={e.id}
              coordinate={{ latitude: e.latitude, longitude: e.longitude }}
              title={e.apelido || 'Endereço'}
              description={`${e.rua}, ${e.numero}`}
            />
          ))}
      </MapView>

      <View style={styles.painel}>
        <Text style={styles.titulo}>Localização atual</Text>
        <Text style={styles.coords}>
          {posicao.latitude.toFixed(5)}, {posicao.longitude.toFixed(5)}
        </Text>
        <TouchableOpacity
          style={styles.btCadastrar}
          onPress={() => navigation.navigate('EditarEndereco', {})}
        >
          <Text style={styles.btCadastrarTxt}>Cadastrar novo endereço</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btSecundario}
          onPress={() => navigation.navigate('MeusEnderecos')}
        >
          <Text style={styles.btSecundarioTxt}>Ver meus endereços</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  map: {
    width: Dimensions.get('window').width,
    height: 320,
  },
  painel: {
    flex: 1,
    padding: 18,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4B0000',
  },
  coords: {
    color: '#666',
    marginVertical: 6,
  },
  btCadastrar: {
    backgroundColor: '#4B0000',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 14,
  },
  btCadastrarTxt: { color: 'white', fontWeight: 'bold' },
  btSecundario: {
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#4B0000',
  },
  btSecundarioTxt: { color: '#4B0000', fontWeight: 'bold' },
});
