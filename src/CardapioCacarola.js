import React from 'react'
import {  Image } from "react-native";
import { StyleSheet, View, Text} from 'react-native';
import Icon from '@expo/vector-icons/Fontisto';
import arrozbranco from '../assets/arrozbranco2.png'
import feijaopreto from  '../assets/feijaopreto.png'
import macarraoTomate from '../assets/macarraoTomate.png'


export default function CardapioCacarola({navigation}) {
    return (
      <View style={styles.container}>
        <View style={styles.alinhamento}>
          <View style={styles.imagem}>
            <Image 
            style={styles.arrozbranco}
            source={arrozbranco}>
            </Image>
          <View style={styles.Text1}>
            <Text style={styles.caca} onPress={() => navigation.navigate('Arroz')}>Arroz Branco</Text>
            <Text style={styles.aberto}>Arroz branco tradicional</Text>
            <Text style={styles.km}>Imagem ilustrativa 150g</Text>
          </View>  
          </View>
          
          
        </View>

        <View style={styles.alinhamento}>
          <View style={styles.imagem}>
            <Image 
            style={styles.feijaopreto}
            source={feijaopreto}>
            </Image>
          <View style={styles.Text1}>
            <Text style={styles.caca} onPress={() => navigation.navigate('Feijao')}>Feijão Preto</Text>
            <Text style={styles.aberto}>Feijão preto tradicional</Text>
            <Text style={styles.km}>Imagem ilustrativa 150g</Text>
          </View>  
          </View>
          
        </View>

        <View style={styles.alinhamento}>
          <View style={styles.imagem}>
            <Image 
            style={styles.feijaopreto}
            source={macarraoTomate}>
            </Image>
          <View style={styles.Text1}>
            <Text style={styles.caca} onPress={() => navigation.navigate('Macarrao')}>Macarrão</Text>
            <Text style={styles.aberto}>Macarrão com molho de tomate</Text>
            <Text style={styles.km}>Imagem ilustrativa 150g</Text>
          </View>  
          </View>
          
        </View>
        <View style={styles.carrinho}>
          <Icon.Button
              name="shopping-basket"
              size={20}
              color="#900"
              backgroundColor={'white'}
              onPress={() => navigation.navigate('FinalizarPedido')}>
            </Icon.Button>
          </View> 

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
      imagem:{
      width:70,
      height:83,
         
    }, 
    arrozbranco:{
      width:110,
      height:83,
      marginBottom:600,
      right:'10%',
      top:'-10%'

    },
    feijaopreto:{
        width:110,
        height:83,
        marginBottom:600,
        right:'5%',
        top:'-5%',
  
      },
    alinhamento:{
      borderBottomWidth:2,
      borderBottomColor:'gray',
      borderRadius:10,
      top: '-30%',
      right:'10',
      width:'100%',
      
    },
    alinhamentoSabores:{
      borderBottomWidth:2,
      borderBottomColor:'gray',
      borderRadius:10,
      top: '-33%',
      right:'10',
      width:'100%',

    },
    Text1:{
      width:80,
      marginLeft:80,
      marginTop:-683,
      flexDirection:'column',
      right:'-40%'
      
    },
    caca:{
      fontSize:20,
      width:200
    },
    aberto:{
      width:400,
      color:'green',
      flexDirection:'row'
    },
    km:{
      width:200,
      color:'gray',
      flexDirection:'row'

    },
    carrinho:{
      top:'-20%',
      left:'35%'
      },

  });