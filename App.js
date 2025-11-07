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

      <Text>Inicio de la aplicacion</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
