import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GarageSet {
  id:         string;
  title:      string;
  brand:      string;
  model:      string;
  savedAt:    string;   // ISO date
  editedAt?:  string;   // ISO date — present only if edited after save

  // Vehicle inputs
  cv:         string;
  kg:         string;
  trazione:   string;
  engineType: string;
  aspiration: string;
  minRPM:     string;
  maxRPM:     string;

  // Weather
  terrain:     string;
  temperature: number;
  windSpeed:   number;
  rain:        boolean;
  isImperial:  boolean;

  // Results
  time0to100:  string;
  time0to200:  string;
  topSpeed:    string;

  // Graph data
  graphData100:      { speed: number; time: number }[];
  graphData200:      { speed: number; time: number }[];
  coppiaGraphData:   { rpm: number; coppia: number }[];
  coppiaMassima:     number | null;
  powerBands:        any[];
  topSpeedGraphData: { labels: string[]; datasets: { data: number[] }[] };
}

const STORAGE_KEY = '@virtualdyno_garage_v1';

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGarage() {
  const [sets, setSets] = useState<GarageSet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setSets(JSON.parse(raw));
      } catch (e) {
        console.warn('useGarage: failed to load', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (next: GarageSet[]) => {
    setSets(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn('useGarage: failed to save', e);
    }
  }, []);

  const saveSet = useCallback(async (data: Omit<GarageSet, 'id' | 'savedAt'>) => {
    const entry: GarageSet = {
      ...data,
      id:      Date.now().toString(),
      savedAt: new Date().toISOString(),
    };
    await persist([entry, ...sets]);
    return entry;
  }, [sets, persist]);

  const editSet = useCallback(async (id: string, data: Partial<Omit<GarageSet, 'id' | 'savedAt'>>) => {
    const next = sets.map(s =>
      s.id === id ? { ...s, ...data, editedAt: new Date().toISOString() } : s
    );
    await persist(next);
  }, [sets, persist]);

  const deleteSet = useCallback(async (id: string) => {
    await persist(sets.filter(s => s.id !== id));
  }, [sets, persist]);

  return { sets, loading, saveSet, editSet, deleteSet };
}
