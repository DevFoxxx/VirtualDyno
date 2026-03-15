import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import * as Haptics from 'expo-haptics';
import { GarageSet } from './useGarage';

interface GarageCardProps {
  set:          GarageSet;
  currentTheme: { background: string; text: string };
  isImperial:   boolean;
  onEdit:       (set: GarageSet) => void;
  onDelete:     (id: string)     => void;
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

const weatherLabel = (set: GarageSet): string => {
  const parts: string[] = [set.terrain.charAt(0).toUpperCase() + set.terrain.slice(1)];
  const temp = set.isImperial
    ? `${Math.round(set.temperature * 9 / 5 + 32)}°F`
    : `${set.temperature}°C`;
  parts.push(temp);
  if (set.windSpeed > 0) {
    const w = set.isImperial
      ? `${Math.round(set.windSpeed * 0.621371)} mph`
      : `${set.windSpeed} km/h`;
    parts.push(`💨 ${w}`);
  }
  if (set.rain) parts.push('🌧');
  return parts.join('  ·  ');
};

export const GarageCard: React.FC<GarageCardProps> = ({
  set, currentTheme, isImperial, onEdit, onDelete,
}) => {
  const dark    = isDarkBg(currentTheme.background);
  const cardBg  = dark ? '#0f1b2d' : '#f4f7ff';
  const borderC = dark ? '#1a2e4a' : '#dce4f5';

  const speedUnit  = isImperial ? 'mph'  : 'km/h';
  const weightUnit = isImperial ? 'lbs'  : 'kg';
  const powerUnit  = isImperial ? 'HP'   : 'CV';

  const displayWeight = isImperial
    ? Math.round(parseFloat(set.kg) * 2.20462)
    : set.kg;
  const displayPower = isImperial
    ? Math.round(parseFloat(set.cv) * 1.01387)
    : set.cv;
  const displayTopSpeed = isImperial
    ? (parseFloat(set.topSpeed) * 0.621371).toFixed(1)
    : parseFloat(set.topSpeed).toFixed(1);

  const savedDate = new Date(set.savedAt).toLocaleDateString(undefined, {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Delete Set',
      `Delete "${set.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onDelete(set.id);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor: borderC }]}>
      {/* ── Top row: title + actions ── */}
      <View style={styles.topRow}>
        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: currentTheme.text }]} numberOfLines={1}>
            {set.title}
          </Text>
          <Text style={[styles.brandModel, { color: dark ? '#4a6890' : '#8899bb' }]} numberOfLines={1}>
            {set.brand}  ·  {set.model}
          </Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => { Haptics.selectionAsync(); onEdit(set); }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="edit-2" size={16} color={dark ? '#4a6890' : '#8899bb'} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="trash-2" size={16} color="#c0392b" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Divider ── */}
      <View style={[styles.divider, { backgroundColor: ACCENT }]} />

      {/* ── Stats row ── */}
      <View style={styles.statsRow}>
        <View style={styles.statBlock}>
          <Text style={[styles.statValue, { color: ACCENT }]}>{set.time0to100}s</Text>
          <Text style={[styles.statLabel, { color: dark ? '#3a5070' : '#b0bdd0' }]}>
            {isImperial ? '0–62' : '0–100'} {speedUnit}
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: dark ? '#1a2e4a' : '#dce4f5' }]} />
        <View style={styles.statBlock}>
          <Text style={[styles.statValue, { color: ACCENT }]}>{displayTopSpeed}</Text>
          <Text style={[styles.statLabel, { color: dark ? '#3a5070' : '#b0bdd0' }]}>
            Top {speedUnit}
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: dark ? '#1a2e4a' : '#dce4f5' }]} />
        <View style={styles.statBlock}>
          <Text style={[styles.statValue, { color: ACCENT }]}>{displayPower}</Text>
          <Text style={[styles.statLabel, { color: dark ? '#3a5070' : '#b0bdd0' }]}>
            {powerUnit}
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: dark ? '#1a2e4a' : '#dce4f5' }]} />
        <View style={styles.statBlock}>
          <Text style={[styles.statValue, { color: ACCENT }]}>{displayWeight}</Text>
          <Text style={[styles.statLabel, { color: dark ? '#3a5070' : '#b0bdd0' }]}>
            {weightUnit}
          </Text>
        </View>
      </View>

      {/* ── Engine + traction pills ── */}
      <View style={styles.pillsRow}>
        <View style={[styles.pill, { backgroundColor: ACCENT + '18', borderColor: ACCENT + '40' }]}>
          <Text style={[styles.pillText, { color: dark ? '#7aaee8' : ACCENT }]}>
            {engineLabel(set.engineType, set.aspiration)}
          </Text>
        </View>
        <View style={[styles.pill, { backgroundColor: ACCENT + '18', borderColor: ACCENT + '40' }]}>
          <Text style={[styles.pillText, { color: dark ? '#7aaee8' : ACCENT }]}>
            {set.trazione}
          </Text>
        </View>
        {/* Compact weather pill */}
        <View style={[styles.pill, { backgroundColor: ACCENT + '10', borderColor: ACCENT + '25' }]}>
          <Text style={[styles.pillText, { color: dark ? '#4a6890' : '#8899bb' }]} numberOfLines={1}>
            {weatherLabel(set)}
          </Text>
        </View>
      </View>

      {/* ── Footer: date + edited badge ── */}
      <View style={styles.footer}>
        <Text style={[styles.footerDate, { color: dark ? '#2a3e58' : '#c0cce0' }]}>
          {savedDate}
        </Text>
        {set.editedAt && (
          <Text style={[styles.editedBadge, { color: dark ? '#2a3e58' : '#b0bdd0' }]}>
            edited
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleBlock: { flex: 1, marginRight: 12 },
  title: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  brandModel: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  actions: {
    flexDirection: 'row',
    gap: 14,
    paddingTop: 2,
  },
  divider: {
    height: 1,
    opacity: 0.15,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  statDivider: {
    width: 1,
    height: 28,
    opacity: 0.5,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerDate: {
    fontSize: 10,
    fontWeight: '500',
  },
  editedBadge: {
    fontSize: 10,
    fontStyle: 'italic',
    fontWeight: '500',
  },
});
