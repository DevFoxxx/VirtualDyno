import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useTranslation } from 'react-i18next';

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

const TERRAINS: { key: TerrainType; initial: string }[] = [
  { key: 'asphalt', initial: 'A'  },
  { key: 'wet',     initial: 'W'  },
  { key: 'snow',    initial: 'S'  },
  { key: 'mud',     initial: 'M'  },
  { key: 'sand',    initial: 'Sa' },
];

const TerrainWeatherPicker: React.FC<TerrainWeatherPickerProps> = ({
  conditions,
  onChange,
  currentTheme,
  isImperial,
}) => {
  const { t } = useTranslation();

  const update = (partial: Partial<WeatherConditions>) =>
    onChange({ ...conditions, ...partial });

  // Display conversions — internal values always metric
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

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
        {t('terrain_weather_title')}
      </Text>

      {/* Terrain picker */}
      <Text style={[styles.label, { color: currentTheme.text }]}>
        {t('terrain_label')}
      </Text>
      <View style={styles.terrainRow}>
        {TERRAINS.map((ter) => {
          const isActive = conditions.terrain === ter.key;
          return (
            <TouchableOpacity
              key={ter.key}
              style={[styles.terrainButton, isActive && styles.terrainButtonActive]}
              onPress={() => update({ terrain: ter.key })}
            >
              <Text style={[styles.terrainInitial, { color: isActive ? '#fff' : '#004aad' }]}>
                {ter.initial}
              </Text>
              <Text style={[styles.terrainLabel, { color: isActive ? '#fff' : currentTheme.text }]}>
                {t(`terrain_${ter.key}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Temperature */}
      <Text style={[styles.label, { color: currentTheme.text }]}>
        {t('weather_temperature')}: {displayTemp}{tempUnit}
      </Text>
      <Slider
        style={styles.slider}
        minimumValue={tempMin}
        maximumValue={tempMax}
        step={1}
        value={displayTemp}
        onValueChange={handleTempChange}
        minimumTrackTintColor='#004aad'
        maximumTrackTintColor='#ccc'
        thumbTintColor='#004aad'
      />
      <View style={styles.sliderLabels}>
        <Text style={[styles.sliderEnd, { color: currentTheme.text }]}>{tempMin}{tempUnit}</Text>
        <Text style={[styles.sliderEnd, { color: currentTheme.text }]}>{tempMax}{tempUnit}</Text>
      </View>

      {/* Headwind */}
      <Text style={[styles.label, { color: currentTheme.text }]}>
        {t('weather_headwind')}: {displayWind} {windUnit}
      </Text>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={windMax}
        step={isImperial ? 3 : 5}
        value={displayWind}
        onValueChange={handleWindChange}
        minimumTrackTintColor='#004aad'
        maximumTrackTintColor='#ccc'
        thumbTintColor='#004aad'
      />
      <View style={styles.sliderLabels}>
        <Text style={[styles.sliderEnd, { color: currentTheme.text }]}>0</Text>
        <Text style={[styles.sliderEnd, { color: currentTheme.text }]}>{windMax} {windUnit}</Text>
      </View>

      {/* Rain toggle */}
      <View style={styles.rainRow}>
        <Text style={[styles.label, { color: currentTheme.text }]}>{t('weather_rain')}</Text>
        <TouchableOpacity
          style={[styles.toggleButton, { backgroundColor: conditions.rain ? '#004aad' : '#ccc' }]}
          onPress={() => update({ rain: !conditions.rain })}
        >
          <Text style={styles.toggleText}>{conditions.rain ? 'ON' : 'OFF'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#004aad',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 8,
  },
  terrainRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  terrainButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#004aad',
    minWidth: 58,
  },
  terrainButtonActive: {
    backgroundColor: '#004aad',
  },
  terrainInitial: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  terrainLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  slider: {
    width: '100%',
    height: 36,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -6,
    marginBottom: 4,
  },
  sliderEnd: {
    fontSize: 10,
    color: '#888',
  },
  rainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  toggleText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});

export default TerrainWeatherPicker;
