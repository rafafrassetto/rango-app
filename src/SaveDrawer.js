import React from 'react';
import {View, StyleSheet} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';

import Home from './src/Home';
import Sobre from './src/Sobre';

const Drawer = createDrawerNavigator();

export default function App() {
  return(
    <NavigationContainer>
      <Drawer.Navigator useLegacyImplementation initialRouteName= "Home">
      <Drawer.Screen 
      name="Home"
      component={Home}/>
      <Drawer.Screen 
      name="Sobre" 
      component={Sobre}/>
    </Drawer.Navigator>
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
