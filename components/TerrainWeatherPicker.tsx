import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';

export type TerrainType = 'asphalt' | 'wet' | 'snow' | 'mud' | 'sand';

export interface WeatherConditions {
  terrain:     TerrainType;
  temperature: number;   // stored in °C internally
  windSpeed:   number;   // stored in km/h internally
  rain:        boolean;
}

interface TerrainWeatherPickerProps {
  conditions:   WeatherConditions;
  onChange:     (conditions: WeatherConditions) => void;
  currentTheme: { background: string; text: string };
  isImperial:   boolean;
}

const TERRAINS: { key: TerrainType; icon: any }[] = [
  { key: 'asphalt', icon: require('../assets/images/asphalt.png') },
  { key: 'wet',     icon: require('../assets/images/wet.png')     },
  { key: 'snow',    icon: require('../assets/images/snow.png')    },
  { key: 'mud',     icon: require('../assets/images/mud.png')     },
  { key: 'sand',    icon: require('../assets/images/sand.png')    },
];

const ACCENT = '#004aad';

function isDarkBg(hex: string): boolean {
  const h = hex.replace('#', '');
  if (h.length < 6) return false;
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b < 80;
}

const TerrainWeatherPicker: React.FC<TerrainWeatherPickerProps> = ({
  conditions,
  onChange,
  currentTheme,
  isImperial,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const dark = isDarkBg(currentTheme.background);

  const update = (partial: Partial<WeatherConditions>) =>
    onChange({ ...conditions, ...partial });

  const displayTemp = isImperial
    ? Math.round(conditions.temperature * 9 / 5 + 32)
    : conditions.temperature;
  const displayWind = isImperial
    ? Math.round(conditions.windSpeed * 0.621371)
    : conditions.windSpeed;
  const tempUnit = isImperial ? '°F' : '°C';
  const windUnit = isImperial ? 'mph' : 'km/h';
  const tempMin  = isImperial ? -4  : -20;
  const tempMax  = isImperial ? 122 :  50;
  const windMax  = isImperial ?  75 : 120;

  const handleTempChange = (v: number) => {
    const internal = isImperial ? Math.round((v - 32) * 5 / 9) : v;
    update({ temperature: internal });
  };

  const handleWindChange = (v: number) => {
    const internal = isImperial ? Math.round(v / 0.621371) : v;
    update({ windSpeed: internal });
  };

  const cardBg    = dark ? '#101c2e' : '#f4f7ff';
  const borderCol = dark ? '#1e2e45' : '#dce4f5';
  const labelColor = dark ? '#7aaee8' : ACCENT;

  return (
    <View style={[styles.wrapper, { borderColor: open ? ACCENT : borderCol, backgroundColor: cardBg }]}>

      {/* ── Accordion Header ── */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => { Haptics.selectionAsync(); setOpen(v => !v); }}
        activeOpacity={0.8}
      >
        <View style={styles.headerLeft}>
          <Text style={[styles.sectionLabel, { color: dark ? '#4466aa' : '#8899bb' }]}>
            {t('terrain_weather_title') ?? 'TERRAIN & WEATHER'}
          </Text>
          {/* Active terrain badge shown in header */}
          <View style={[styles.badge, { backgroundColor: ACCENT + '22', borderColor: ACCENT + '55' }]}>
            <Image
              source={TERRAINS.find(ter => ter.key === conditions.terrain)!.icon}
              style={[styles.badgeIcon, { tintColor: dark ? '#fff' : ACCENT }]}
              resizeMode="contain"
            />
            <Text style={[styles.badgeText, { color: labelColor }]}>
              {t(`terrain_${conditions.terrain}`)}
            </Text>
          </View>
        </View>
        <Text style={[styles.chevron, { color: open ? ACCENT : (dark ? '#3a5070' : '#b0bdd0') }]}>
          {open ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>

      {/* ── Expanded Body ── */}
      {open && (
        <View style={styles.body}>
          <View style={[styles.divider, { backgroundColor: ACCENT }]} />

          {/* ── Terrain row ── */}
          <Text style={[styles.rowLabel, { color: dark ? '#4466aa' : '#8899bb' }]}>
            TERRAIN
          </Text>
          <View style={styles.terrainRow}>
            {TERRAINS.map((ter) => {
              const isActive = conditions.terrain === ter.key;
              return (
                <View key={ter.key} style={styles.terrainItemWrap}>
                  {isActive && (
                    <View style={[styles.haloOuter, { backgroundColor: ACCENT + '18', borderColor: ACCENT + '40' }]} />
                  )}
                  {isActive && (
                    <View style={[styles.haloInner, { backgroundColor: ACCENT + '28' }]} />
                  )}
                  <TouchableOpacity
                    onPress={() => { Haptics.selectionAsync(); update({ terrain: ter.key }); }}
                    activeOpacity={0.75}
                    style={[
                      styles.terrainCard,
                      {
                        borderWidth:     isActive ? 2 : 1,
                        borderColor:     isActive ? ACCENT : (dark ? '#2a3a55' : '#d0d8e8'),
                        backgroundColor: isActive ? ACCENT + '22' : (dark ? '#111a2a' : '#f5f7fc'),
                        shadowColor:     isActive ? ACCENT : 'transparent',
                        shadowOpacity:   isActive ? 0.5 : 0,
                        shadowRadius:    isActive ? 8 : 0,
                        shadowOffset:    { width: 0, height: 0 },
                        elevation:       isActive ? 6 : 1,
                      },
                    ]}
                  >
                    <Image
                      source={ter.icon}
                      style={[styles.terrainIcon, { tintColor: dark ? '#ffffff' : ACCENT }]}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                  <Text style={[
                    styles.terrainLabel,
                    {
                      color: isActive ? (dark ? '#fff' : ACCENT) : (dark ? '#445577' : '#aab8cc'),
                      fontWeight: isActive ? '700' : '400',
                    },
                  ]}>
                    {t(`terrain_${ter.key}`)}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* ── Temperature ── */}
          <Text style={[styles.rowLabel, { color: dark ? '#4466aa' : '#8899bb', marginTop: 18 }]}>
            {(t('weather_temperature') ?? 'TEMPERATURE').toUpperCase()}
          </Text>
          <View style={[styles.sliderCard, { backgroundColor: dark ? '#0d1825' : '#eef2fb', borderColor: borderCol }]}>
            <Text style={[styles.sliderValue, { color: ACCENT }]}>{displayTemp}{tempUnit}</Text>
            <Slider
              style={styles.slider}
              minimumValue={tempMin}
              maximumValue={tempMax}
              step={1}
              value={displayTemp}
              onValueChange={handleTempChange}
              minimumTrackTintColor={ACCENT}
              maximumTrackTintColor={dark ? '#1e2e45' : '#ccd6ee'}
              thumbTintColor={ACCENT}
            />
            <View style={styles.sliderEnds}>
              <Text style={[styles.sliderEnd, { color: dark ? '#3a5070' : '#b0bdd0' }]}>{tempMin}{tempUnit}</Text>
              <Text style={[styles.sliderEnd, { color: dark ? '#3a5070' : '#b0bdd0' }]}>{tempMax}{tempUnit}</Text>
            </View>
          </View>

          {/* ── Headwind ── */}
          <Text style={[styles.rowLabel, { color: dark ? '#4466aa' : '#8899bb', marginTop: 18 }]}>
            {(t('weather_headwind') ?? 'HEADWIND').toUpperCase()}
          </Text>
          <View style={[styles.sliderCard, { backgroundColor: dark ? '#0d1825' : '#eef2fb', borderColor: borderCol }]}>
            <Text style={[styles.sliderValue, { color: ACCENT }]}>{displayWind} {windUnit}</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={windMax}
              step={isImperial ? 3 : 5}
              value={displayWind}
              onValueChange={handleWindChange}
              minimumTrackTintColor={ACCENT}
              maximumTrackTintColor={dark ? '#1e2e45' : '#ccd6ee'}
              thumbTintColor={ACCENT}
            />
            <View style={styles.sliderEnds}>
              <Text style={[styles.sliderEnd, { color: dark ? '#3a5070' : '#b0bdd0' }]}>0</Text>
              <Text style={[styles.sliderEnd, { color: dark ? '#3a5070' : '#b0bdd0' }]}>{windMax} {windUnit}</Text>
            </View>
          </View>

          {/* ── Rain Toggle ── */}
          <Text style={[styles.rowLabel, { color: dark ? '#4466aa' : '#8899bb', marginTop: 18 }]}>
            {(t('weather_rain') ?? 'RAIN').toUpperCase()}
          </Text>
          <TouchableOpacity
            style={[
              styles.rainToggle,
              {
                backgroundColor: conditions.rain ? ACCENT : (dark ? '#111a2a' : '#f5f7fc'),
                borderColor:     conditions.rain ? ACCENT : (dark ? '#2a3a55' : '#d0d8e8'),
                shadowColor:     conditions.rain ? ACCENT : 'transparent',
                shadowOpacity:   conditions.rain ? 0.4 : 0,
                shadowRadius:    conditions.rain ? 8 : 0,
                elevation:       conditions.rain ? 4 : 1,
              },
            ]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); update({ rain: !conditions.rain }); }}
            activeOpacity={0.75}
          >
            <Text style={[styles.rainToggleText, { color: conditions.rain ? '#fff' : (dark ? '#445577' : '#aab8cc') }]}>
              {conditions.rain ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const CARD_SIZE  = 52;
const HALO_OUTER = CARD_SIZE + 16;
const HALO_INNER = CARD_SIZE + 8;

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 15,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '700',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeIcon: { width: 14, height: 14 },
  badgeText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  chevron: { fontSize: 12, fontWeight: '700' },

  body: {
    paddingHorizontal: 14,
    paddingBottom: 16,
  },
  divider: {
    height: 1,
    opacity: 0.18,
    marginBottom: 16,
  },
  rowLabel: {
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 14,
  },

  // ── Terrain circles ──────────────────────────────────────────────────────
  terrainRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  terrainItemWrap: {
    alignItems: 'center',
    position: 'relative',
    width: HALO_OUTER + 4,
    paddingTop: 10,
  },
  haloOuter: {
    position: 'absolute',
    top: 10 - (HALO_OUTER - CARD_SIZE) / 2,
    width: HALO_OUTER,
    height: HALO_OUTER,
    borderRadius: HALO_OUTER / 2,
    borderWidth: 1,
    zIndex: 0,
  },
  haloInner: {
    position: 'absolute',
    top: 10 - (HALO_INNER - CARD_SIZE) / 2,
    width: HALO_INNER,
    height: HALO_INNER,
    borderRadius: HALO_INNER / 2,
    zIndex: 0,
  },
  terrainCard: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: CARD_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  terrainIcon: { width: 28, height: 28 },
  terrainLabel: {
    fontSize: 10,
    marginTop: 8,
    letterSpacing: 0.5,
    textAlign: 'center',
    zIndex: 1,
  },

  // ── Slider Card ──────────────────────────────────────────────────────────
  sliderCard: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 4,
  },
  sliderValue: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 2,
  },
  slider: {
    width: '100%',
    height: 36,
  },
  sliderEnds: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -6,
    marginBottom: 4,
  },
  sliderEnd: { fontSize: 10 },

  // ── Rain Toggle ──────────────────────────────────────────────────────────
  rainToggle: {
    borderRadius: 12,
    borderWidth: 1.5,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rainToggleText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
  },
});

export default TerrainWeatherPicker;
