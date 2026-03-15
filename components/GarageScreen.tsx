import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import * as Haptics from 'expo-haptics';
import { useGarage, GarageSet } from './useGarage';
import { GarageCard } from './GarageCard';
import { SaveSetModal } from './SaveSetModal';
import { ImportModal } from './ImportModal';
import GarageDetailScreen from './GarageDetailScreen';

interface GarageScreenProps {
  currentTheme: { background: string; text: string; placeHolderColor?: string };
  isImperial:   boolean;
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

export default function GarageScreen({ currentTheme, isImperial, onBack }: GarageScreenProps) {
  const { sets, loading, saveSet, editSet, deleteSet } = useGarage();
  const dark = isDarkBg(currentTheme.background);

  const [editingSet,   setEditingSet]   = useState<GarageSet | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailSet,    setDetailSet]    = useState<GarageSet | null>(null);
  const [showImport,   setShowImport]   = useState(false);

  const handleImport = async (data: Omit<GarageSet, 'id' | 'savedAt'>) => {
    await saveSet(data);
  };

  // ── Detail navigation ──────────────────────────────────────────────────
  if (detailSet) {
    return (
      <GarageDetailScreen
        set={detailSet}
        currentTheme={currentTheme}
        onBack={() => { Haptics.selectionAsync(); setDetailSet(null); }}
      />
    );
  }

  const handleEdit = (set: GarageSet) => {
    setEditingSet(set);
    setModalVisible(true);
  };

  const handleModalSave = async (title: string, brand: string, model: string) => {
    if (!editingSet) return;
    await editSet(editingSet.id, { title, brand, model });
    setModalVisible(false);
    setEditingSet(null);
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
          <Text style={styles.headerTitle}>Garage</Text>
          <Text style={[styles.headerSub, { color: dark ? '#4a6890' : '#8899bb' }]}>
            {sets.length} {sets.length === 1 ? 'set' : 'sets'} saved
          </Text>
        </View>

        <View style={{ width: 32 }} />
      </View>

      {/* ── Content ── */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={ACCENT} />
        </View>
      ) : sets.length === 0 ? (
        <View style={styles.centered}>
          <Feather name="inbox" size={52} color={dark ? '#1a2e4a' : '#dce4f5'} />
          <Text style={[styles.emptyTitle, { color: dark ? '#2a3e58' : '#c0cce0' }]}>
            No sets saved yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: dark ? '#1e2e45' : '#d0daea' }]}>
            Run a calculation and tap{'\n'}"Save Set" to store it here.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {sets.map(set => (
            <TouchableOpacity
              key={set.id}
              activeOpacity={0.85}
              onPress={() => { Haptics.selectionAsync(); setDetailSet(set); }}
            >
              <GarageCard
                set={set}
                currentTheme={currentTheme}
                isImperial={isImperial}
                onEdit={handleEdit}
                onDelete={deleteSet}
              />
            </TouchableOpacity>
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* ── Edit Modal ── */}
      <SaveSetModal
        visible={modalVisible}
        editingSet={editingSet}
        currentTheme={currentTheme}
        onSave={handleModalSave}
        onCancel={() => { setModalVisible(false); setEditingSet(null); }}
      />

      {/* ── Import Modal ── */}
      <ImportModal
        visible={showImport}
        currentTheme={currentTheme}
        onImport={handleImport}
        onClose={() => setShowImport(false)}
      />

      {/* ── FAB ── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowImport(true); }}
        activeOpacity={0.85}
      >
        <Feather name="download" size={22} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: ACCENT,
  },
  headerSub: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  list: { padding: 16 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ACCENT,
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});
