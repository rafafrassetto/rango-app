import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from './src/Home';
import Login from './src/Login';
import Inscreva from './src/Inscreva';
import CardapioCacarola from './src/CardapioCacarola';
import InscrevaseRestaurante from './src/InscrevaseRestaurante';
import Arroz from './src/Arroz';
import Pagar from './src/Pagar';
import Carrinho from './src/Carrinho';
import Esqueceu from './src/Esqueceu';
import FinalizarPedido from './src/FinalizarPedido';
import Feijao from './src/Feijao';
import Macarrao from './src/Macarrao';
import Localizacao from './src/Localizacao';
import MeusPedidos from './src/MeusPedidos';
import EditarPedido from './src/EditarPedido';
import MeusEnderecos from './src/MeusEnderecos';
import EditarEndereco from './src/EditarEndereco';
import Perfil from './src/Perfil';

// Módulo do restaurante
import LoginRestaurante from './src/restaurante/LoginRestaurante';
import PainelRestaurante from './src/restaurante/PainelRestaurante';
import EditarPrato from './src/restaurante/EditarPrato';

import { colors } from './src/theme/theme';

const Stack = createNativeStackNavigator();

const headerEstilo = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: colors.textInverse,
  headerTitleStyle: { fontWeight: 'bold' },
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={headerEstilo}
      >
        {/* Cliente */}
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Inscreva"
          component={Inscreva}
          options={{ title: 'Cadastro' }}
        />
        <Stack.Screen
          name="Esqueceu"
          component={Esqueceu}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ title: 'Rango App' }}
        />
        <Stack.Screen
          name="CardapioCacarola"
          component={CardapioCacarola}
          options={{ title: 'Cardápio' }}
        />
        <Stack.Screen
          name="Arroz"
          component={Arroz}
          options={{ title: 'Arroz Branco' }}
        />
        <Stack.Screen
          name="Feijao"
          component={Feijao}
          options={{ title: 'Feijão Preto' }}
        />
        <Stack.Screen
          name="Macarrao"
          component={Macarrao}
          options={{ title: 'Macarrão' }}
        />
        <Stack.Screen
          name="InscrevaseRestaurante"
          component={InscrevaseRestaurante}
          options={{ title: 'Cadastro Restaurante' }}
        />
        <Stack.Screen
          name="Pagar"
          component={Pagar}
          options={{ title: 'Pagamento' }}
        />
        <Stack.Screen
          name="Carrinho"
          component={Carrinho}
          options={{ title: 'Carrinho' }}
        />
        <Stack.Screen
          name="FinalizarPedido"
          component={FinalizarPedido}
          options={{ title: 'Finalizar Pedido' }}
        />
        <Stack.Screen
          name="Localizacao"
          component={Localizacao}
          options={{ title: 'Localização' }}
        />
        <Stack.Screen
          name="MeusPedidos"
          component={MeusPedidos}
          options={{ title: 'Meus Pedidos' }}
        />
        <Stack.Screen
          name="EditarPedido"
          component={EditarPedido}
          options={{ title: 'Editar Pedido' }}
        />
        <Stack.Screen
          name="MeusEnderecos"
          component={MeusEnderecos}
          options={{ title: 'Meus Endereços' }}
        />
        <Stack.Screen
          name="EditarEndereco"
          component={EditarEndereco}
          options={{ title: 'Endereço' }}
        />
        <Stack.Screen
          name="Perfil"
          component={Perfil}
          options={{ title: 'Meu Perfil' }}
        />

        {/* Módulo do restaurante */}
        <Stack.Screen
          name="LoginRestaurante"
          component={LoginRestaurante}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PainelRestaurante"
          component={PainelRestaurante}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EditarPrato"
          component={EditarPrato}
          options={{ title: 'Prato' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
