import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import * as Haptics from 'expo-haptics';
import { GarageSet } from './useGarage';
import ZeroTo100Chart from '@/components/ZeroTo100Chart';
import ZeroTo200Chart from '@/components/ZeroTo200Chart';
import TheoreticalTopSpeed from '@/components/TheoreticalTopSpeed';
import PowerDistributionChart from '@/components/PowerDistributionChart';
import MaxTorqueChart from '@/components/MaxTorqueChart';
import AdditionalStats from '@/components/AdditionalStats';

interface GarageDetailScreenProps {
  set:          GarageSet;
  currentTheme: { background: string; text: string; placeHolderColor?: string };
  onBack:       () => void;
}

const ACCENT = '#004aad';

function isDarkBg(hex: string): boolean {
  const h = hex.replace('#', '');
  if (h.length < 6) return false;
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b < 80;
}

const engineLabel = (type: string, asp: string): string => {
  const typeMap: Record<string, string> = {
    petrol: 'Petrol', diesel: 'Diesel', electric: 'Electric',
  };
  const aspMap: Record<string, string> = {
    natural: 'N/A', turbo: 'Turbo', supercharger: 'SC', biturbo: 'Biturbo',
  };
  if (type === 'electric') return 'Electric';
  return `${typeMap[type] ?? type} · ${aspMap[asp] ?? asp}`;
};

export default function GarageDetailScreen({ set, currentTheme, onBack }: GarageDetailScreenProps) {
  const dark = isDarkBg(currentTheme.background);
  const isImperial = set.isImperial;

  const speedUnit    = isImperial ? 'mph'   : 'km/h';
  const weightUnit   = isImperial ? 'lbs'   : 'kg';
  const powerUnit    = isImperial ? 'hp'    : 'kW';
  const distUnit     = isImperial ? 'ft'    : 'm';
  const accelUnit    = isImperial ? 'ft/s²' : 'm/s²';
  const speed100Label= isImperial ? '0-62'  : '0-100';
  const speed200Label= isImperial ? '0-124' : '0-200';

  const toDisplayPower = (kw: number) => isImperial ? +(kw * 1.341).toFixed(1) : kw;
  const toDisplayDist  = (m: number)  => isImperial ? +(m * 3.28084).toFixed(1) : m;
  const toDisplayAccel = (ms2: number)=> isImperial ? +(ms2 * 3.28084).toFixed(2) : ms2;
  const toDisplaySpeed = (kmh: number)=> isImperial ? +(kmh * 0.621371).toFixed(1) : kmh;

  const savedDate = new Date(set.savedAt).toLocaleDateString(undefined, {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  const weatherSummary = () => {
    const temp = isImperial
      ? `${Math.round(set.temperature * 9 / 5 + 32)}°F`
      : `${set.temperature}°C`;
    const wind = isImperial
      ? `${Math.round(set.windSpeed * 0.621371)} mph`
      : `${set.windSpeed} km/h`;
    const parts = [
      set.terrain.charAt(0).toUpperCase() + set.terrain.slice(1),
      temp,
      set.windSpeed > 0 ? `💨 ${wind}` : null,
      set.rain ? '🌧 Rain' : null,
    ].filter(Boolean);
    return parts.join('  ·  ');
  };

  const cardBg    = dark ? '#0f1b2d' : '#f4f7ff';
  const borderCol = dark ? '#1a2e4a' : '#dce4f5';
  const labelColor = dark ? '#4a6890' : '#8899bb';

  // Theme object compatible with chart components
  const chartTheme = {
    background: currentTheme.background,
    text: currentTheme.text,
    placeHolderColor: currentTheme.placeHolderColor,
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      {/* ── Header ── */}
      <View style={[styles.header, { borderBottomColor: dark ? '#1a2e4a' : '#e8eef8' }]}>
        <TouchableOpacity
          onPress={() => { Haptics.selectionAsync(); onBack(); }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.backBtn}
        >
          <Feather name="arrow-left" size={22} color={ACCENT} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: currentTheme.text }]} numberOfLines={1}>
            {set.title}
          </Text>
          <Text style={[styles.headerSub, { color: labelColor }]}>
            {set.brand}  ·  {set.model}
          </Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Summary card ── */}
        <View style={[styles.summaryCard, { backgroundColor: cardBg, borderColor: borderCol }]}>

          {/* Top stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Text style={[styles.statValue, { color: ACCENT }]}>{set.time0to100}s</Text>
              <Text style={[styles.statLabel, { color: labelColor }]}>
                {speed100Label} {speedUnit}
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: borderCol }]} />
            <View style={styles.statBlock}>
              <Text style={[styles.statValue, { color: ACCENT }]}>{set.time0to200}s</Text>
              <Text style={[styles.statLabel, { color: labelColor }]}>
                {speed200Label} {speedUnit}
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: borderCol }]} />
            <View style={styles.statBlock}>
              <Text style={[styles.statValue, { color: ACCENT }]}>
                {toDisplaySpeed(parseFloat(set.topSpeed)).toFixed(0)}
              </Text>
              <Text style={[styles.statLabel, { color: labelColor }]}>
                Top {speedUnit}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: ACCENT }]} />

          {/* Input row */}
          <View style={styles.inputsRow}>
            <View style={styles.inputChip}>
              <Text style={[styles.inputChipLabel, { color: labelColor }]}>POWER</Text>
              <Text style={[styles.inputChipValue, { color: currentTheme.text }]}>
                {set.cv} CV
              </Text>
            </View>
            <View style={styles.inputChip}>
              <Text style={[styles.inputChipLabel, { color: labelColor }]}>WEIGHT</Text>
              <Text style={[styles.inputChipValue, { color: currentTheme.text }]}>
                {isImperial ? Math.round(parseFloat(set.kg) * 2.20462) : set.kg} {weightUnit}
              </Text>
            </View>
            <View style={styles.inputChip}>
              <Text style={[styles.inputChipLabel, { color: labelColor }]}>DRIVE</Text>
              <Text style={[styles.inputChipValue, { color: currentTheme.text }]}>
                {set.trazione}
              </Text>
            </View>
            {set.engineType !== 'electric' && (
              <View style={styles.inputChip}>
                <Text style={[styles.inputChipLabel, { color: labelColor }]}>RPM</Text>
                <Text style={[styles.inputChipValue, { color: currentTheme.text }]}>
                  {set.minRPM}–{set.maxRPM}
                </Text>
              </View>
            )}
          </View>

          {/* Pills row */}
          <View style={styles.pillsRow}>
            <View style={[styles.pill, { backgroundColor: ACCENT + '18', borderColor: ACCENT + '40' }]}>
              <Text style={[styles.pillText, { color: dark ? '#7aaee8' : ACCENT }]}>
                {engineLabel(set.engineType, set.aspiration)}
              </Text>
            </View>
            <View style={[styles.pill, { backgroundColor: ACCENT + '10', borderColor: ACCENT + '28' }]}>
              <Text style={[styles.pillText, { color: labelColor }]}>
                {weatherSummary()}
              </Text>
            </View>
          </View>

          {/* Footer date */}
          <View style={styles.footerRow}>
            <Text style={[styles.footerDate, { color: dark ? '#2a3e58' : '#c0cce0' }]}>
              Saved {savedDate}
            </Text>
            {set.editedAt && (
              <Text style={[styles.editedBadge, { color: dark ? '#2a3e58' : '#b0bdd0' }]}>
                edited
              </Text>
            )}
          </View>
        </View>

        {/* ── Charts ── */}
        <View style={styles.chartsSection}>

          {/* 0-100 chart */}
          {set.graphData100?.length > 0 && (
            <ZeroTo100Chart
              graphData={set.graphData100}
              currentTheme={chartTheme}
              title={`${speed100Label} ${speedUnit}: ${set.time0to100}s`}
              description=""
              legendTitle={`Time to ${speed100Label} ${speedUnit}`}
              isImperial={isImperial}
            />
          )}

          {/* 0-200 chart */}
          {set.graphData200?.length > 0 && (
            <ZeroTo200Chart
              graphData={set.graphData200}
              currentTheme={chartTheme}
              title={`${speed200Label} ${speedUnit}: ${set.time0to200}s`}
              description=""
              legendTitle={`Time to ${speed200Label} ${speedUnit}`}
              isImperial={isImperial}
            />
          )}

          {/* Top speed chart */}
          {set.topSpeed && set.topSpeedGraphData?.datasets?.[0]?.data?.length > 0 && (
            <TheoreticalTopSpeed
              topSpeedGraphData={set.topSpeedGraphData}
              currentTheme={chartTheme}
              title={`Top Speed: ${toDisplaySpeed(parseFloat(set.topSpeed)).toFixed(1)} ${speedUnit}`}
              legendTitle={`Available power (${speedUnit})`}
              description=""
              isImperial={isImperial}
            />
          )}

          {/* Power distribution chart */}
          {set.powerBands?.length > 0 && (
            <PowerDistributionChart
              bands={set.powerBands}
              currentTheme={chartTheme}
              title="Power Distribution"
              description=""
              isImperial={isImperial}
            />
          )}

          {/* Torque chart */}
          {set.coppiaGraphData?.length > 0 && (
            <MaxTorqueChart
              coppiaGraphData={set.coppiaGraphData}
              currentTheme={chartTheme}
              title={`Max Torque: ${
                isImperial
                  ? (set.coppiaMassima! * 0.7376).toFixed(2) + ' lb·ft'
                  : set.coppiaMassima!.toFixed(2) + ' Nm'
              }`}
              legendTitle="Torque curve"
              description=""
              isImperial={isImperial}
            />
          )}

          {/* Additional stats */}
          {set.time0to100 && (
            <AdditionalStats
              cv={set.cv}
              kg={parseFloat(set.kg)}
              result={{ time0to100: set.time0to100 }}
              currentTheme={currentTheme}
              isImperial={isImperial}
              speed100Label={speed100Label}
              speed200Label={speed200Label}
              speedUnit={speedUnit}
              powerUnit={powerUnit}
              distUnit={distUnit}
              accelUnit={accelUnit}
              toDisplayPower={toDisplayPower}
              toDisplayDist={toDisplayDist}
              toDisplayAccel={toDisplayAccel}
            />
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backBtn: { width: 32 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.3,
    marginTop: 1,
  },

  scroll: { padding: 16 },

  // ── Summary card ─────────────────────────────────────────────────────────
  summaryCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statBlock: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  statLabel: { fontSize: 10, fontWeight: '500', marginTop: 3, letterSpacing: 0.3, textAlign: 'center' },
  statDivider: { width: 1, height: 32, opacity: 0.4 },
  divider: { height: 1, opacity: 0.15, marginBottom: 12 },

  inputsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  inputChip: {
    alignItems: 'center',
    minWidth: 64,
  },
  inputChipLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  inputChipValue: {
    fontSize: 14,
    fontWeight: '600',
  },

  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  pill: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
  },

  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerDate: { fontSize: 10, fontWeight: '500' },
  editedBadge: { fontSize: 10, fontStyle: 'italic', fontWeight: '500' },

  // ── Charts section ────────────────────────────────────────────────────────
  chartsSection: { gap: 4 },
});
