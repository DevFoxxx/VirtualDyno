import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { Feather } from '@expo/vector-icons';

interface PopUpHelpText {
  message: string;
  textColor: string;
  backgroundColor: string;
  iconColor: string;
}

const PopUpHelpText: React.FC<PopUpHelpText> = ({
  message,
  textColor,
  backgroundColor,
  iconColor,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.iconContainer}
      >
        <Feather name='help-circle' size={20} color={iconColor} />
      </TouchableOpacity>

      <Modal
        animationType='fade'
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackground}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={[styles.modalContainer, { backgroundColor }]}>
            <Text style={[styles.modalMessage, { color: textColor }]}>
              {message}
            </Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    marginLeft: 5,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: 300,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    position: 'relative',
  },
  modalMessage: {
    fontSize: 16,
    marginVertical: 10,
    textAlign: 'center',
  },
});

export default PopUpHelpText;
