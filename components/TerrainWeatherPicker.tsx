import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';

export type TerrainType = 'asphalt' | 'wet' | 'snow' | 'mud' | 'sand';

export interface WeatherConditions {
  terrain: TerrainType;
  temperature: number;   // °C, affects air density
  windSpeed: number;     // km/h headwind (positive = headwind)
  rain: boolean;
}

interface TerrainWeatherPickerProps {
  conditions: WeatherConditions;
  onChange: (conditions: WeatherConditions) => void;
  currentTheme: { background: string; text: string };
}

const TERRAINS: { key: TerrainType; label: string; initial: string }[] = [
  { key: 'asphalt', label: 'Asphalt', initial: 'A'  },
  { key: 'wet',     label: 'Wet',     initial: 'W'  },
  { key: 'snow',    label: 'Snow',    initial: 'S'  },
  { key: 'mud',     label: 'Mud',     initial: 'M'  },
  { key: 'sand',    label: 'Sand',    initial: 'Sa' },
];

const TerrainWeatherPicker: React.FC<TerrainWeatherPickerProps> = ({
  conditions,
  onChange,
  currentTheme,
}) => {
  const update = (partial: Partial<WeatherConditions>) =>
    onChange({ ...conditions, ...partial });

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
        Terrain & Weather
      </Text>

      {/* Terrain picker */}
      <Text style={[styles.label, { color: currentTheme.text }]}>Terrain</Text>
      <View style={styles.terrainRow}>
        {TERRAINS.map((t) => {
          const isActive = conditions.terrain === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              style={[
                styles.terrainButton,
                isActive && styles.terrainButtonActive,
              ]}
              onPress={() => update({ terrain: t.key })}
            >
              <Text
                style={[
                  styles.terrainInitial,
                  { color: isActive ? '#fff' : '#004aad' },
                ]}
              >
                {t.initial}
              </Text>
              <Text
                style={[
                  styles.terrainLabel,
                  { color: isActive ? '#fff' : currentTheme.text },
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Temperature slider */}
      <Text style={[styles.label, { color: currentTheme.text }]}>
        Temperature: {conditions.temperature}°C
      </Text>
      <Slider
        style={styles.slider}
        minimumValue={-20}
        maximumValue={50}
        step={1}
        value={conditions.temperature}
        onValueChange={(v) => update({ temperature: v })}
        minimumTrackTintColor='#004aad'
        maximumTrackTintColor='#ccc'
        thumbTintColor='#004aad'
      />
      <View style={styles.sliderLabels}>
        <Text style={[styles.sliderEnd, { color: currentTheme.text }]}>-20°C</Text>
        <Text style={[styles.sliderEnd, { color: currentTheme.text }]}>+50°C</Text>
      </View>

      {/* Wind slider */}
      <Text style={[styles.label, { color: currentTheme.text }]}>
        Headwind: {conditions.windSpeed} km/h
      </Text>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={120}
        step={5}
        value={conditions.windSpeed}
        onValueChange={(v) => update({ windSpeed: v })}
        minimumTrackTintColor='#004aad'
        maximumTrackTintColor='#ccc'
        thumbTintColor='#004aad'
      />
      <View style={styles.sliderLabels}>
        <Text style={[styles.sliderEnd, { color: currentTheme.text }]}>0</Text>
        <Text style={[styles.sliderEnd, { color: currentTheme.text }]}>120 km/h</Text>
      </View>

      {/* Rain toggle */}
      <View style={styles.rainRow}>
        <Text style={[styles.label, { color: currentTheme.text }]}>Rain</Text>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            { backgroundColor: conditions.rain ? '#004aad' : '#ccc' },
          ]}
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
