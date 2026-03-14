import React from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';

interface TractionPickerProps {
  trazione: string;
  setTrazione: (value: 'FWD' | 'RWD' | 'AWD') => void;
  currentTheme: {
    text: string;
    background: string;
  };
}

const tractionIcons = {
  FWD: require('../assets/images/FWD.png'),
  RWD: require('../assets/images/RWD.png'),
  AWD: require('../assets/images/AWD.png'),
};

const ACCENT = '#004aad';

const tractionOptions: Array<'FWD' | 'RWD' | 'AWD'> = ['FWD', 'RWD', 'AWD'];

function isDark(hex: string): boolean {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b < 80;
}

const TractionPicker: React.FC<TractionPickerProps> = ({
  trazione,
  setTrazione,
  currentTheme,
}) => {
  const dark = isDark(currentTheme.background);

  return (
    <View style={styles.container}>
      {tractionOptions.map((type) => {
        const isActive = trazione === type;
        const accentColor = ACCENT;
        return (
          <View key={type} style={styles.itemContainer}>
            {isActive && (
              <View style={[
                styles.haloOuter,
                { backgroundColor: accentColor + '18', borderColor: accentColor + '40' },
              ]} />
            )}
            {isActive && (
              <View style={[
                styles.haloInner,
                { backgroundColor: accentColor + '28' },
              ]} />
            )}

            <TouchableOpacity
              onPress={() => setTrazione(type)}
              activeOpacity={0.75}
              style={[
                styles.iconContainer,
                {
                  borderWidth: isActive ? 2 : 1,
                  borderColor: isActive ? accentColor : (dark ? '#2a3a55' : '#d0d8e8'),
                  backgroundColor: isActive
                    ? accentColor + '22'
                    : (dark ? '#111a2a' : '#f5f7fc'),
                  shadowColor:   isActive ? accentColor : 'transparent',
                  shadowOpacity: isActive ? 0.6 : 0,
                  shadowRadius:  isActive ? 12 : 0,
                  shadowOffset:  { width: 0, height: 0 },
                  elevation:     isActive ? 8  : 1,
                },
              ]}
            >
              <Image
                source={tractionIcons[type]}
                style={styles.icon}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <Text style={[
              styles.label,
              {
                color: isActive ? accentColor : (dark ? '#6677aa' : '#8899bb'),
                fontWeight: isActive ? '700' : '400',
              },
            ]}>
              {type}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const CIRCLE     = 72;
const HALO_OUTER = CIRCLE + 22;
const HALO_INNER = CIRCLE + 11;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  itemContainer: {
    alignItems: 'center',
    position: 'relative',
    width: HALO_OUTER + 4,
    paddingTop: 12,
  },
  haloOuter: {
    position: 'absolute',
    top: 12 - (HALO_OUTER - CIRCLE) / 2,
    width: HALO_OUTER,
    height: HALO_OUTER,
    borderRadius: HALO_OUTER / 2,
    borderWidth: 1,
    zIndex: 0,
  },
  haloInner: {
    position: 'absolute',
    top: 12 - (HALO_INNER - CIRCLE) / 2,
    width: HALO_INNER,
    height: HALO_INNER,
    borderRadius: HALO_INNER / 2,
    zIndex: 0,
  },
  iconContainer: {
    width: CIRCLE, height: CIRCLE, borderRadius: CIRCLE / 2,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 1,
  },
  icon:  { width: 48, height: 48 },
  label: { marginTop: 7, fontSize: 12, letterSpacing: 1, zIndex: 1, textAlign: 'center' },
});

export default TractionPicker;
