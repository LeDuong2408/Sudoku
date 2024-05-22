import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Modal } from 'react-native';

const GameOver = ({ visible, onRequestClose, onPlayAgain}:any) => {
  return (
    <Modal
      transparent={true}   
      animationType="slide"
      visible={visible}
      onRequestClose={onRequestClose}
    >

        <View style={styles.container}>
        <Image source={{uri: 'https://th.bing.com/th/id/R.f707a3ff5ecd4cd403b8594c19e83bf6?rik=XXDZuV100g8wSg&riu=http%3a%2f%2fpngimg.com%2fuploads%2fgame_over%2fgame_over_PNG46.png&ehk=mtFo6GlPDL4UWtXycllS4Iq3Q0ed6bFmmmZbJ1Uhi5o%3d&risl=&pid=ImgRaw&r=0'}} style={styles.image} />
        <TouchableOpacity style={styles.button} onPress={onPlayAgain}>
            <Text style={styles.buttonText}>Play Again</Text>
        </TouchableOpacity>
        </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width:'100%',
    height:'100%',
    borderColor:'black',
    borderWidth:1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  score: {
    fontSize: 18,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#DE2800',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default GameOver;
