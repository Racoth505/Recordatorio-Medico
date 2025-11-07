import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image } from 'react-native';

const icon = require('./assets/icon.png');
export default function App() {
  return (
    <View style={styles.container}>

      <Image source={{uri: "https://wiki.leagueoflegends.com/en-us/images/Chibi_Gwen_Base_Tier_1.png?fc9c7"}} 
        style={{
        width: 512, 
        height: 512,
        resizeMode: 'center'}}/>

      <Text style={{color: 'white'}}>Inicio de la aplicacion</Text>
      <StatusBar style="ligth" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
