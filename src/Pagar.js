import React from 'react'
import { Image, VirtualizedList } from "react-native";
import { StyleSheet, View, Text } from 'react-native';

import cartao from '../assets/cartao.png';
import pix from '../assets/pix.png';




export default function Pagar({ navigation }) {
    return (
        <View style={styles.container}>
            <View style={styles.alinhamento}>
                <View style={styles.imagem}>
                    <Image
                        style={styles.cartao}
                        source={cartao}>
                    </Image>
                </View>
                <View style={{ width: '70%',height: 50, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={styles.TextCART}>Cartão de Crédito</Text>
                </View>
            </View>
            <View style={styles.alinhamento}>
                <View style={styles.imagem}>
                    <Image
                        style={styles.cartao}
                        source={cartao}>
                    </Image>
                </View>
                <View style={{ width: '70%', height: 50, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={styles.TextCART}>PIX</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'white',
        justifyContent: 'flex-start',


    },
    alinhamento: {
        borderBottomWidth: 2,
        borderBottomColor: 'gray',
        borderRadius: 10,
        width: '100%',
        height: 100,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        textAlign: 'center',
    },
    TextCART: {
        fontFamily: 'Montserrat',
        fontSize: 25,




    },
    cartao: {
        width: 76,
        height: 80,


    },
    imagem: {
        height: 300
    },
    pix: {
        height: 76,
        width: 80
    }
});

