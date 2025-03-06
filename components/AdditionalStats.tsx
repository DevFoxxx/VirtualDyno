import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

interface AdditionalStatsProps {
  cv: string;
  kg: number;
  result: { time0to100: string };
  currentTheme: { background: string; text: string };
}

const AdditionalStats: React.FC<AdditionalStatsProps> = ({
  cv,
  kg,
  result,
  currentTheme,
}) => {
  const { t } = useTranslation();

  return (
    <View
      style={[styles.container, { backgroundColor: currentTheme.background }]}
    >
      <Text style={[styles.outputText, { color: currentTheme.text }]}>
        {t('power_kw')}: {(parseFloat(cv) * 0.7355).toFixed(2)} kW
      </Text>
      <Text style={[styles.outputText, { color: currentTheme.text }]}>
        {t('power_kgcv')}: {(kg / parseFloat(cv)).toFixed(2)} CV/Kg
      </Text>
      <Text style={[styles.outputText, { color: currentTheme.text }]}>
        {t('power')}: {(parseFloat(cv) / (kg / 1000)).toFixed(2)} CV/t
      </Text>
      <Text style={[styles.outputText, { color: currentTheme.text }]}>
        {t('acceleration')}:{' '}
        {(27.78 / parseFloat(result.time0to100)).toFixed(2)} m/s²
      </Text>
      <Text style={[styles.outputText, { color: currentTheme.text }]}>
        {t('distance')}:{' '}
        {(
          0.5 *
          (27.78 / parseFloat(result.time0to100)) *
          Math.pow(parseFloat(result.time0to100), 2)
        ).toFixed(2)}{' '}
        meters
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: 10,
    marginBottom: 20,
  },
  outputText: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 5,
  },
});

export default AdditionalStats;
