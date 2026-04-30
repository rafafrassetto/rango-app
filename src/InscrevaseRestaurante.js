import React from 'react'
import { Button, Image } from "react-native";
import { StyleSheet, View, TextInput,TouchableOpacity, Text} from 'react-native';
import fundo from '../assets/LOGOCOMPESSOAS.png'

export default function InscrevaseRestaurante({navigation}) {
    return (
      <View style={styles.container}>
        
          <View style={styles.imagem}>
            <Image
            style={styles.fundo}
            source={fundo}>
            </Image>
          </View>

          <View style={styles.direction}>
            <TextInput style={styles.input}
              placeholder="Restaurante "
              placeholderTextColor="gray"/>  

              <TextInput style={styles.input}
              placeholder="Email"
              placeholderTextColor="gray"/>  

              <TextInput style={styles.input}
              placeholder="Telefone"
              placeholderTextColor="gray"/> 

              <TextInput style={styles.input}
              placeholder="Cnpj"
              placeholderTextColor="gray"/>  

            <TextInput secureTextEntry = {true} style={styles.input}
            placeholder="Senha"
            placeholderTextColor="gray"/>

           
          </View>

          <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate
              ('')}>
              <Text style={styles.inscrevase}>Inscreva-se</Text>
          </TouchableOpacity>

          
      </View>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,    
      alignItems: 'center', 
      backgroundColor: 'white',
      justifyContent: 'center',
      
    },
    direction: {
      alignItems: 'center',
      top:'-3%'
      
    },
    imagem:{
      top:'5%',
      alignItems: "flex-end" ,
      
    },
    fundo:{
        height:200,
        width:150,
        marginRight:25
       
    },
    input:{
      margin:25,
      borderBottomWidth: 1,
      borderColor:'gray',
      alignItems: 'center',
      color:'gray'
    },
    inscrevase:{
      alignItems:"center",
      color:"white",
      textAlign:'center',
      fontFamily: 'Quicksand-Bold.ttf'
    },
    button:{
      backgroundColor:"#4B0000",
      top:'-2%',
      borderRadius:5,
      borderBottomWidth: 1,
      width:90,
      height:25

      
  
    },

  });