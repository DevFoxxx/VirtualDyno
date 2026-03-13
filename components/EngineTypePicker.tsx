import React from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type EngineType       = 'petrol' | 'diesel' | 'electric';
export type AspirationMode   = 'natural' | 'turbo' | 'supercharger' | 'biturbo';

export interface EngineConfig {
  engineType:  EngineType;
  aspiration:  AspirationMode;
}

// ---------------------------------------------------------------------------
// Empirical modifiers (calibrated on zperfs / real dyno data)
// ---------------------------------------------------------------------------

/**
 * Per-engine default overrides applied when user changes engine type.
 * η, Cd, Cr, frontal area are pre-filled so physics stays realistic.
 *
 * Sources:
 *  - Petrol:   typical ICE η ≈ 0.85, Cd 0.30, Cr 0.015
 *  - Diesel:   slightly better η 0.88 (higher compression), heavier/boxier → Cd 0.32, Cr 0.015
 *  - Electric: η 0.92 (inverter+motor), slippery bodies → Cd 0.24, low-resistance tyres Cr 0.010
 */
export const ENGINE_DEFAULTS: Record<EngineType, {
  efficienza: string;
  cd: string;
  cr: string;
  areaFrontale: string;
  minRPM: string;
}> = {
  petrol:   { efficienza: '0.85', cd: '0.30', cr: '0.015', areaFrontale: '2.0',  minRPM: '500'  },
  diesel:   { efficienza: '0.88', cd: '0.32', cr: '0.015', areaFrontale: '2.2',  minRPM: '600'  },
  electric: { efficienza: '0.92', cd: '0.24', cr: '0.010', areaFrontale: '2.0',  minRPM: '0'    },
};

/**
 * Aspiration multipliers applied on top of base physics.
 *
 * torqueMult   → scales coppiaMax
 * rpmPeakShift → shifts rpmCoppiaMax (RPM offset)
 * t100Mult     → post-multiplier on 0-100 time
 * t200Mult     → post-multiplier on 0-200 time
 *
 * Sources: zperfs dyno comparisons aspirated vs turbocharged same-displacement
 * engines (e.g. BMW N52 vs N54, Porsche 911 GT3 vs 911 Turbo, Ford EcoBoost comparisons).
 */
export const ASPIRATION_MODIFIERS: Record<AspirationMode, {
  torqueMult:   number;
  rpmPeakShift: number;
  t100Mult:     number;
  t200Mult:     number;
}> = {
  natural:     { torqueMult: 1.00, rpmPeakShift:     0, t100Mult: 1.00, t200Mult: 1.00 },
  turbo:       { torqueMult: 1.18, rpmPeakShift:  +800, t100Mult: 0.91, t200Mult: 0.89 },
  supercharger:{ torqueMult: 1.12, rpmPeakShift:  -400, t100Mult: 0.94, t200Mult: 0.93 },
  biturbo:     { torqueMult: 1.32, rpmPeakShift: +1200, t100Mult: 0.84, t200Mult: 0.82 },
};

// ---------------------------------------------------------------------------
// Icon map — add these PNGs to assets/images/
// Engine: petrol.png, diesel.png, electric.png
// Aspiration: natural.png, turbo.png, supercharger.png, biturbo.png
// ---------------------------------------------------------------------------
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

// Detects dark mode from theme background color.
// Covers all common dark backgrounds used by expo-router / Colors.ts defaults.
const isDark = (bg: string): boolean => {
  const b = bg.toLowerCase().replace(/\s/g, '');
  if (['#000', '#000000', '#151718', '#1c1c1e', '#121212', '#0d0d0d'].includes(b)) return true;
  // Parse hex to luminance for any other dark color
  const hex = b.startsWith('#') ? b.slice(1) : b;
  if (hex.length === 6) {
    const r = parseInt(hex.slice(0,2),16);
    const g = parseInt(hex.slice(2,4),16);
    const bb2 = parseInt(hex.slice(4,6),16);
    return (0.299*r + 0.587*g + 0.114*bb2) < 80;
  }
  return false;
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface EngineTypePickerProps {
  config:      EngineConfig;
  setConfig:   (c: EngineConfig) => void;
  currentTheme: { text: string; background: string };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const ENGINE_OPTIONS:      EngineType[]     = ['petrol', 'diesel', 'electric'];
const ASPIRATION_OPTIONS:  AspirationMode[] = ['natural', 'turbo', 'supercharger', 'biturbo'];

const EngineTypePicker: React.FC<EngineTypePickerProps> = ({
  config,
  setConfig,
  currentTheme,
}) => {
  const { t } = useTranslation();

  const setEngine = (engineType: EngineType) => {
    // Reset aspiration to natural when switching to electric
    const aspiration = engineType === 'electric' ? 'natural' : config.aspiration;
    setConfig({ engineType, aspiration });
  };

  const setAspiration = (aspiration: AspirationMode) => {
    setConfig({ ...config, aspiration });
  };

  return (
    <View style={styles.wrapper}>
      {/* Engine type row */}
      <Text style={[styles.sectionLabel, { color: currentTheme.text }]}>
        {t('engine_type')}
      </Text>
      <View style={styles.row}>
        {ENGINE_OPTIONS.map((type) => {
          const isActive = config.engineType === type;
          return (
            <View key={type} style={styles.itemContainer}>
              <TouchableOpacity
                onPress={() => setEngine(type)}
                style={[
                  styles.iconContainer,
                  {
                    borderWidth:  isActive ? 3 : 1,
                    borderColor:  isActive ? '#004aad' : currentTheme.text,
                  },
                ]}
              >
                <Image
                  source={engineIcons[type]}
                  style={[styles.icon, isDark(currentTheme.background) && styles.iconDark]}
                  resizeMode='contain'
                />
              </TouchableOpacity>
              <Text
                style={[
                  styles.label,
                  {
                    color:      currentTheme.text,
                    fontWeight: isActive ? 'bold' : '300',
                  },
                ]}
              >
                {t(`engine_${type}`)}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Aspiration row — hidden for electric */}
      {config.engineType !== 'electric' && (
        <>
          <Text style={[styles.sectionLabel, { color: currentTheme.text }]}>
            {t('aspiration')}
          </Text>
          <View style={styles.row}>
            {ASPIRATION_OPTIONS.map((mode) => {
              const isActive = config.aspiration === mode;
              return (
                <View key={mode} style={styles.itemContainer}>
                  <TouchableOpacity
                    onPress={() => setAspiration(mode)}
                    style={[
                      styles.iconContainer,
                      {
                        borderWidth:  isActive ? 3 : 1,
                        borderColor:  isActive ? '#004aad' : currentTheme.text,
                      },
                    ]}
                  >
                    <Image
                      source={aspirationIcons[mode]}
                      style={[styles.icon, isDark(currentTheme.background) && styles.iconDark]}
                      resizeMode='contain'
                    />
                  </TouchableOpacity>
                  <Text
                    style={[
                      styles.label,
                      {
                        color:      currentTheme.text,
                        fontWeight: isActive ? 'bold' : '300',
                      },
                    ]}
                  >
                    {t(`aspiration_${mode}`)}
                  </Text>
                </View>
              );
            })}
          </View>
        </>
      )}
    </View>
  );
};

// ---------------------------------------------------------------------------
// Styles — mirrors TractionPicker exactly
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 15,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  itemContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  icon: {
    width: 52,
    height: 52,
  },
  iconDark: {
    tintColor: '#ffffff',
  },
  label: {
    marginTop: 6,
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 72,
  },
});

export default EngineTypePicker;
