import React from 'react';
import { View, Text, Image, Modal, TouchableOpacity, StyleSheet } from 'react-native';

const CongratulationsModal = ({ visible, onRequestClose, elapsed }:any) => {
  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={visible}
      onRequestClose={onRequestClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
        <Image
            source={{ uri: 'https://static.vecteezy.com/system/resources/previews/000/462/680/original/hand-holding-a-winner-trophy-cup-award-vector.jpg' }} 
            style={styles.cupImage}
        />
          <Text style={styles.congratsText}>Congratulations!</Text>
          <Text style={styles.messageText}>You have successfully completed the Sudoku game!</Text>
          <Text style={styles.messageText}>{elapsed}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onRequestClose} >
            <Text style={styles.closeButtonText} >Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width:'100%',
    height:'100%',
    borderColor:'black',
    borderWidth:1,
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  cupImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  congratsText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  messageText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    padding: 10,
    backgroundColor: 'blue',
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default CongratulationsModal;
