import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

interface AdditionalStatsProps {
  cv: string;
  kg: number;
  result: { time0to100: string };
  currentTheme: { background: string; text: string; cardBackground?: string };
  isImperial: boolean;
  speed100Label: string;
  speed200Label: string;
  speedUnit: string;
  powerUnit: string;
  distUnit: string;
  accelUnit: string;
  toDisplayPower: (kw: number) => number;
  toDisplayDist:  (m: number)  => number;
  toDisplayAccel: (ms2: number)=> number;
}

const AdditionalStats: React.FC<AdditionalStatsProps> = ({
  cv,
  kg,
  result,
  currentTheme,
  isImperial,
  speed100Label,
  powerUnit,
  distUnit,
  accelUnit,
  toDisplayPower,
  toDisplayDist,
  toDisplayAccel,
}) => {
  const { t } = useTranslation();

  const cvNum   = parseFloat(cv);
  const t100    = parseFloat(result.time0to100);
  const accelMs2= 27.78 / t100;
  const distM   = 0.5 * accelMs2 * Math.pow(t100, 2);
  const kw      = cvNum * 0.7355;

  // Detect dark background for card styling
  const isDark = (() => {
    const b = currentTheme.background.toLowerCase().replace(/\s/g, '');
    if (['#000','#000000','#151718','#1c1c1e','#121212','#0d0d0d'].includes(b)) return true;
    const hex = b.startsWith('#') ? b.slice(1) : b;
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0,2),16);
      const g = parseInt(hex.slice(2,4),16);
      const bv= parseInt(hex.slice(4,6),16);
      return (0.299*r + 0.587*g + 0.114*bv) < 80;
    }
    return false;
  })();

  const cardBg     = isDark ? '#1a2a40' : '#e8f0fb';
  const borderColor= '#004aad';
  const labelColor = isDark ? '#7aaee8' : '#004aad';

  const stats = [
    {
      label: t('power_kw'),
      value: `${toDisplayPower(kw).toFixed(2)} ${powerUnit}`,
    },
    {
      label: t('power_kgcv'),
      value: isImperial
        ? `${(kg * 2.20462 / cvNum).toFixed(2)} lbs/HP`
        : `${(kg / cvNum).toFixed(2)} kg/CV`,
    },
    {
      label: t('power'),
      value: isImperial
        ? `${(cvNum / (kg * 2.20462 / 2000)).toFixed(2)} HP/t`
        : `${(cvNum / (kg / 1000)).toFixed(2)} CV/t`,
    },
    {
      label: t('acceleration'),
      value: `${toDisplayAccel(accelMs2).toFixed(2)} ${accelUnit}`,
    },
    {
      label: t('distance'),
      value: `${toDisplayDist(distM).toFixed(2)} ${distUnit}`,
    },
  ];

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
      <Text style={[styles.cardTitle, { color: borderColor }]}>
        {t('stats_title') ?? `${speed100Label} km/h stats`}
      </Text>
      <View style={styles.divider} />
      {stats.map((s, i) => (
        <View key={i} style={styles.row}>
          <Text style={[styles.label, { color: labelColor }]}>{s.label}</Text>
          <Text style={[styles.value, { color: currentTheme.text }]}>{s.value}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 10,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  divider: {
    height: 1,
    backgroundColor: '#004aad',
    opacity: 0.25,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,74,173,0.12)',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
  },
});

export default AdditionalStats;
