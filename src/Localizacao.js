import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Addresses } from './services/storage';
import { colors, spacing, radius } from './theme/theme';

export default function Localizacao({ navigation }) {
  const [enderecos, setEnderecos] = useState([]);
  const [posicao, setPosicao] = useState({ latitude: -28.7032, longitude: -49.4093 });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          setPosicao({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        }
      } catch (e) { /* mantém padrão */ }
      const lista = await Addresses.list();
      setEnderecos(lista);
      setCarregando(false);
    })();
  }, []);

  if (carregando) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{ ...posicao, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
      >
        <Marker coordinate={posicao} title="Você está aqui" description="Ponto atual" pinColor={colors.primary} />
        {enderecos.filter((e) => e.latitude && e.longitude).map((e) => (
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
        <TouchableOpacity style={styles.btPrimario} onPress={() => navigation.navigate('EditarEndereco', {})}>
          <Text style={styles.btPrimarioTxt}>Cadastrar novo endereço</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btSecundario} onPress={() => navigation.navigate('MeusEnderecos')}>
          <Text style={styles.btSecundarioTxt}>Ver meus endereços</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  map: { width: Dimensions.get('window').width, height: 320 },
  painel: { flex: 1, padding: spacing.lg },
  titulo: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  coords: { color: colors.textSecondary, marginVertical: 6 },
  btPrimario: {
    backgroundColor: colors.primary, paddingVertical: 14,
    borderRadius: radius.md, alignItems: 'center', marginTop: 14,
  },
  btPrimarioTxt: { color: colors.textInverse, fontWeight: '700' },
  btSecundario: {
    paddingVertical: 14, borderRadius: radius.md,
    alignItems: 'center', marginTop: 8,
    borderWidth: 1, borderColor: colors.primary,
  },
  btSecundarioTxt: { color: colors.primary, fontWeight: '700' },
});
