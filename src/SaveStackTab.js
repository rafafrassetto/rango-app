import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View } from 'react-native';


import Home from './src/Home';
import Sobre from './src/Sobre';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Tabs(){
  return(
    <Tab.Navigator>
    <Tab.Screen 
    name="Home" 
    component={Home}/>
    <Tab.Screen 
    name="Sobre" 
    component={Sobre}/>
  </Tab.Navigator>
  )
}

export default function App() {
  return(
    <NavigationContainer>
      <Stack.Navigator initialRouteName= 'Home'>
      <Stack.Screen 
      name="Home"
      component={Tabs}
      options={{
        title:'Bem-Vindo',
        headerStyle:{
          backgroundColor:'#c81920'
        },
        headerTintColor:'black'
      }}
      />
      <Stack.Screen 
      name="Sobre" 
      component={Tabs}/>
    </Stack.Navigator>
  </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
