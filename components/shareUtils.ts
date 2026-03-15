import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { Share } from 'react-native';
import { GarageSet } from './useGarage';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Minimal payload stored in the share code — no graph data */
export interface SharePayload {
  v:   number;   // version, for future compat
  cv:  string;
  kg:  string;
  tr:  string;   // trazione
  et:  string;   // engineType
  asp: string;   // aspiration
  mn:  string;   // minRPM
  mx:  string;   // maxRPM
  ter: string;   // terrain
  tmp: number;   // temperature °C
  wnd: number;   // windSpeed km/h
  rn:  boolean;  // rain
  imp: boolean;  // isImperial
  t1:  string;   // time0to100
  t2:  string;   // time0to200
  ts:  string;   // topSpeed
  ttl: string;   // title
  br:  string;   // brand
  md:  string;   // model
}

// ─── Encode / Decode ──────────────────────────────────────────────────────────

export function encodeSet(set: GarageSet): string {
  const payload: SharePayload = {
    v: 1,
    cv: set.cv, kg: set.kg, tr: set.trazione,
    et: set.engineType, asp: set.aspiration,
    mn: set.minRPM, mx: set.maxRPM,
    ter: set.terrain, tmp: set.temperature,
    wnd: set.windSpeed, rn: set.rain, imp: set.isImperial,
    t1: set.time0to100, t2: set.time0to200, ts: set.topSpeed,
    ttl: set.title, br: set.brand, md: set.model,
  };
  const json    = JSON.stringify(payload);
  const b64     = btoa(unescape(encodeURIComponent(json)));
  // Take first 6 chars of a simple hash for the short code suffix
  let hash = 0;
  for (let i = 0; i < b64.length; i++) hash = (hash * 31 + b64.charCodeAt(i)) >>> 0;
  const suffix  = hash.toString(36).toUpperCase().padStart(6, '0').slice(0, 6);
  // Embed full payload after prefix — suffix is just for display/UX
  return `VD-${suffix}-${b64}`;
}

export function decodeSet(code: string): Omit<GarageSet, 'id' | 'savedAt'> | null {
  try {
    const clean = code.trim().toUpperCase().startsWith('VD-') ? code.trim() : null;
    if (!clean) return null;
    // Strip VD-XXXXXX- prefix (10 chars: "VD-" + 6 + "-")
    const b64  = clean.slice(10);
    const json = decodeURIComponent(escape(atob(b64)));
    const p: SharePayload = JSON.parse(json);
    if (!p || p.v !== 1) return null;
    return {
      title: p.ttl, brand: p.br, model: p.md,
      cv: p.cv, kg: p.kg, trazione: p.tr,
      engineType: p.et, aspiration: p.asp,
      minRPM: p.mn, maxRPM: p.mx,
      terrain: p.ter, temperature: p.tmp,
      windSpeed: p.wnd, rain: p.rn, isImperial: p.imp,
      time0to100: p.t1, time0to200: p.t2, topSpeed: p.ts,
      // Graph data empty — caller must recalculate
      graphData100: [], graphData200: [],
      coppiaGraphData: [], coppiaMassima: null,
      powerBands: [],
      topSpeedGraphData: { labels: [], datasets: [{ data: [] }] },
    };
  } catch {
    return null;
  }
}

// ─── Short display code (VD-XXXXXX) ──────────────────────────────────────────

export function getDisplayCode(fullCode: string): string {
  // Returns just "VD-XXXXXX" for display purposes
  const parts = fullCode.split('-');
  if (parts.length >= 2) return `${parts[0]}-${parts[1]}`;
  return fullCode;
}

// ─── Share: Social ────────────────────────────────────────────────────────────

export async function shareSocial(set: GarageSet, isImperial: boolean): Promise<void> {
  const speedUnit = isImperial ? 'mph' : 'km/h';
  const weightUnit = isImperial ? 'lbs' : 'kg';

  const topSpeed = isImperial
    ? (parseFloat(set.topSpeed) * 0.621371).toFixed(1)
    : parseFloat(set.topSpeed).toFixed(1);
  const weight = isImperial
    ? Math.round(parseFloat(set.kg) * 2.20462)
    : set.kg;
  const speed100 = isImperial ? '0-62' : '0-100';

  const engineMap: Record<string, string> = {
    petrol: 'Petrol', diesel: 'Diesel', electric: 'Electric',
  };
  const aspMap: Record<string, string> = {
    natural: 'N/A', turbo: 'Turbo', supercharger: 'SC', biturbo: 'Biturbo',
  };
  const engineStr = set.engineType === 'electric'
    ? 'Electric'
    : `${engineMap[set.engineType]} ${aspMap[set.aspiration]}`;

  const code = encodeSet(set);
  const displayCode = getDisplayCode(code);

  const message =
    `🏎  ${set.brand} ${set.model} — ${set.title}\n` +
    `\n` +
    `⚡ ${speed100} ${speedUnit}: ${set.time0to100}s\n` +
    `🏁 Top speed: ${topSpeed} ${speedUnit}\n` +
    `💪 ${set.cv} CV · ${weight} ${weightUnit} · ${engineStr} · ${set.trazione}\n` +
    `\n` +
    `📲 Import on VirtualDyno with code:\n` +
    `${displayCode}`;

  await Share.share({ message });
}

// ─── Share: Code ─────────────────────────────────────────────────────────────

export async function shareCode(set: GarageSet): Promise<string> {
  const code = encodeSet(set);
  const displayCode = getDisplayCode(code);
  await Clipboard.setStringAsync(code);
  await Share.share({
    message:
      `🔑 VirtualDyno set — ${set.brand} ${set.model}\n` +
      `Import code: ${code}\n\n` +
      `Paste this code in VirtualDyno → Garage → Import`,
  });
  return displayCode;
}

// ─── Share: JSON File ─────────────────────────────────────────────────────────

export async function shareJSON(set: GarageSet): Promise<void> {
  const exportable = {
    virtualdyno_version: 1,
    title:      set.title,
    brand:      set.brand,
    model:      set.model,
    savedAt:    set.savedAt,
    inputs: {
      cv: set.cv, kg: set.kg, trazione: set.trazione,
      engineType: set.engineType, aspiration: set.aspiration,
      minRPM: set.minRPM, maxRPM: set.maxRPM,
      isImperial: set.isImperial,
    },
    weather: {
      terrain: set.terrain, temperature: set.temperature,
      windSpeed: set.windSpeed, rain: set.rain,
    },
    results: {
      time0to100: set.time0to100,
      time0to200: set.time0to200,
      topSpeed:   set.topSpeed,
    },
  };

  const fileName = `VirtualDyno_${set.brand}_${set.model}_${set.title}`
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .slice(0, 50) + '.json';

  const path = `${FileSystem.cacheDirectory}${fileName}`;
  await FileSystem.writeAsStringAsync(path, JSON.stringify(exportable, null, 2), {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(path, {
      mimeType: 'application/json',
      dialogTitle: `Share ${set.title}`,
    });
  }
}

// ─── Import: JSON File ────────────────────────────────────────────────────────

import * as DocumentPicker from 'expo-document-picker';

export async function importFromJSON(): Promise<Omit<GarageSet, 'id' | 'savedAt'> | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return null;

    const raw = await FileSystem.readAsStringAsync(result.assets[0].uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    const parsed = JSON.parse(raw);

    // Validate it's a VirtualDyno file
    if (parsed.virtualdyno_version !== 1) return null;

    return {
      title:      parsed.title      ?? '',
      brand:      parsed.brand      ?? '',
      model:      parsed.model      ?? '',
      cv:         parsed.inputs?.cv         ?? '',
      kg:         parsed.inputs?.kg         ?? '',
      trazione:   parsed.inputs?.trazione   ?? '',
      engineType: parsed.inputs?.engineType ?? 'petrol',
      aspiration: parsed.inputs?.aspiration ?? 'natural',
      minRPM:     parsed.inputs?.minRPM     ?? '',
      maxRPM:     parsed.inputs?.maxRPM     ?? '',
      isImperial: parsed.inputs?.isImperial ?? false,
      terrain:    parsed.weather?.terrain     ?? 'asphalt',
      temperature:parsed.weather?.temperature ?? 20,
      windSpeed:  parsed.weather?.windSpeed   ?? 0,
      rain:       parsed.weather?.rain        ?? false,
      time0to100: parsed.results?.time0to100  ?? '',
      time0to200: parsed.results?.time0to200  ?? '',
      topSpeed:   parsed.results?.topSpeed    ?? '',
      graphData100: [], graphData200: [],
      coppiaGraphData: [], coppiaMassima: null,
      powerBands: [],
      topSpeedGraphData: { labels: [], datasets: [{ data: [] }] },
    };
  } catch {
    return null;
  }
}
