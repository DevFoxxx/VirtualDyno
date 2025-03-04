import React from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';

interface TractionPickerProps {
  trazione: string;
  setTrazione: (value: 'FWD' | 'RWD' | 'AWD') => void;
  currentTheme: {
    text: string;
  };
}

//import png images from assets
const tractionIcons = {
  FWD: require('../assets/images/FWD.png'),
  RWD: require('../assets/images/RWD.png'),
  AWD: require('../assets/images/AWD.png'),
};

const tractionOptions: Array<'FWD' | 'RWD' | 'AWD'> = ['FWD', 'RWD', 'AWD'];

const TractionPicker: React.FC<TractionPickerProps> = ({
  trazione,
  setTrazione,
  currentTheme,
}) => {
  return (
    <View style={styles.container}>
      {tractionOptions.map((type) => (
        <View key={type} style={styles.itemContainer}>
          <TouchableOpacity
            onPress={() => setTrazione(type)}
            //border size changes when certain traction is selected
            style={[
              styles.iconContainer,
              {
                borderWidth: trazione === type ? 3 : 1,
                borderColor: trazione === type ? '#004aad' : currentTheme.text,
              },
            ]}
          >
            <Image
              source={tractionIcons[type]}
              style={styles.icon}
              resizeMode='contain'
            />
          </TouchableOpacity>
          <Text
            //selected traction has bold font
            style={[
              styles.label,
              {
                color: currentTheme.text,
                fontWeight: trazione === type ? 'bold' : '300',
              },
            ]}
          >
            {type}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  itemContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  icon: {
    width: 65,
    height: 65,
  },
  label: {
    marginTop: 8,
    fontSize: 16,
  },
});

export default TractionPicker;
