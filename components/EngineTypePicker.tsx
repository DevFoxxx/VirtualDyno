import React from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

// ─── Types ────────────────────────────────────────────────────────────────────
export type EngineType     = 'petrol' | 'diesel' | 'electric';
export type AspirationMode = 'natural' | 'turbo' | 'supercharger' | 'biturbo';

export interface EngineConfig {
  engineType:  EngineType;
  aspiration:  AspirationMode;
}

// ─── Physics defaults per engine ─────────────────────────────────────────────
export const ENGINE_DEFAULTS: Record<EngineType, {
  efficienza: string; cd: string; cr: string; areaFrontale: string; minRPM: string;
}> = {
  petrol:   { efficienza: '0.85', cd: '0.30', cr: '0.015', areaFrontale: '2.0', minRPM: '500'  },
  diesel:   { efficienza: '0.88', cd: '0.32', cr: '0.015', areaFrontale: '2.2', minRPM: '700'  },
  electric: { efficienza: '0.92', cd: '0.24', cr: '0.010', areaFrontale: '2.0', minRPM: '0'    },
};

// ─── Aspiration multipliers ───────────────────────────────────────────────────
export const ASPIRATION_MODIFIERS: Record<AspirationMode, {
  t100Mult: number; t200Mult: number; torqueMult: number; rpmPeakShift: number;
}> = {
  natural:     { t100Mult: 1.00, t200Mult: 1.00, torqueMult: 1.00, rpmPeakShift:     0 },
  turbo:       { t100Mult: 0.91, t200Mult: 0.89, torqueMult: 1.18, rpmPeakShift:  -400 },
  supercharger:{ t100Mult: 0.94, t200Mult: 0.93, torqueMult: 1.12, rpmPeakShift:  -200 },
  biturbo:     { t100Mult: 0.84, t200Mult: 0.82, torqueMult: 1.30, rpmPeakShift:  -600 },
};

// ─── Single accent color (blue brand palette) ────────────────────────────────
const ACCENT = '#004aad';

// ─── Icons ───────────────────────────────────────────────────────────────────
const engineIcons: Record<EngineType, any> = {
  petrol:   require('../assets/images/petrol.png'),
  diesel:   require('../assets/images/diesel.png'),
  electric: require('../assets/images/electric.png'),
};
const aspirationIcons: Record<AspirationMode, any> = {
  natural:      require('../assets/images/natural.png'),
  turbo:        require('../assets/images/turbo.png'),
  supercharger: require('../assets/images/supercharger.png'),
  biturbo:      require('../assets/images/biturbo.png'),
};

const ENGINE_OPTIONS:     EngineType[]     = ['petrol', 'diesel', 'electric'];
const ASPIRATION_OPTIONS: AspirationMode[] = ['natural', 'turbo', 'supercharger', 'biturbo'];

// ─── Component ───────────────────────────────────────────────────────────────
interface EngineTypePickerProps {
  config:    EngineConfig;
  setConfig: (c: EngineConfig) => void;
  currentTheme: { text: string; background: string };
}

function isDark(hex: string): boolean {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0,2), 16);
  const g = parseInt(h.substring(2,4), 16);
  const b = parseInt(h.substring(4,6), 16);
  return 0.299*r + 0.587*g + 0.114*b < 80;
}

const EngineTypePicker: React.FC<EngineTypePickerProps> = ({ config, setConfig, currentTheme }) => {
  const dark = isDark(currentTheme.background);
  const { t } = useTranslation();

  const renderOption = (
    key: string,
    icon: any,
    label: string,
    isActive: boolean,
    onPress: () => void,
  ) => {
    const accentColor = ACCENT;
    return (
    <View key={key} style={styles.itemContainer}>
      {/* Outer glow halo — visible only when active */}
      {isActive && (
        <View style={[
          styles.haloOuter,
          { backgroundColor: accentColor + '18', borderColor: accentColor + '40' }
        ]} />
      )}
      {isActive && (
        <View style={[
          styles.haloInner,
          { backgroundColor: accentColor + '28' }
        ]} />
      )}

      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.75}
        style={[
          styles.iconContainer,
          {
            borderWidth:  isActive ? 2   : 1,
            borderColor:  isActive ? accentColor : (dark ? '#2a3a55' : '#d0d8e8'),
            backgroundColor: isActive
              ? accentColor + '22'
              : (dark ? '#111a2a' : '#f5f7fc'),
            // subtle inner shadow via shadow props
            shadowColor:  isActive ? accentColor : 'transparent',
            shadowOpacity: isActive ? 0.6 : 0,
            shadowRadius:  isActive ? 10  : 0,
            shadowOffset:  { width: 0, height: 0 },
            elevation:     isActive ? 8   : 1,
          },
        ]}
      >
        <Image
          source={icon}
          style={[
            styles.icon,
            { tintColor: dark ? '#ffffff' : ACCENT },
          ]}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <Text style={[
        styles.label,
        {
          color: isActive ? (dark ? '#ffffff' : ACCENT) : (dark ? '#445577' : '#aab8cc'),
          fontWeight: isActive ? '700' : '400',
          textAlign: 'center',
        }
      ]}>
        {label}
      </Text>
    </View>
    );
  };

  return (
    <View>
      {/* Engine row */}
      <Text style={[styles.sectionLabel, { color: dark ? '#4466aa' : '#8899bb' }]}>
        {t('engine_type') ?? 'ENGINE'}
      </Text>
      <View style={styles.row}>
        {ENGINE_OPTIONS.map((type) =>
          renderOption(
            type,
            engineIcons[type],
            t(`engine_${type}`) ?? type.toUpperCase(),
            config.engineType === type,
            () => { Haptics.selectionAsync(); setConfig({ ...config, engineType: type }); },
          )
        )}
      </View>

      {/* Aspiration row — hidden for electric */}
      {config.engineType !== 'electric' && (
        <>
          <Text style={[styles.sectionLabel, { color: dark ? '#4466aa' : '#8899bb', marginTop: 12 }]}>
            {t('aspiration') ?? 'ASPIRATION'}
          </Text>
          <View style={styles.row}>
            {ASPIRATION_OPTIONS.map((mode) =>
              renderOption(
                mode,
                aspirationIcons[mode],
                t(`aspiration_${mode}`) ?? mode.toUpperCase(),
                config.aspiration === mode,
                () => { Haptics.selectionAsync(); setConfig({ ...config, aspiration: mode }); },
              )
            )}
          </View>
        </>
      )}
    </View>
  );
};

const CIRCLE = 62;
const HALO_OUTER = CIRCLE + 20;
const HALO_INNER = CIRCLE + 10;

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 12, letterSpacing: 2, fontWeight: '700',
    marginBottom: 18, textAlign: 'center',
  },
  row: {
    flexDirection: 'row', justifyContent: 'space-around',
  },
  itemContainer: {
    alignItems: 'center', position: 'relative', width: HALO_OUTER + 4,
    paddingTop: 12,
  },
  // Glow halos — absolutely positioned behind the circle
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
  icon:  { width: 32, height: 32 },
  label: { fontSize: 11, marginTop: 11, letterSpacing: 1, zIndex: 1, textAlign: 'center' },
});

export default EngineTypePicker;
