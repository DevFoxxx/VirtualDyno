import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert,
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import * as Haptics from 'expo-haptics';
import { decodeSet, importFromJSON } from './shareUtils';
import { GarageSet } from './useGarage';

interface ImportModalProps {
  visible:      boolean;
  currentTheme: { background: string; text: string };
  onImport:     (data: Omit<GarageSet, 'id' | 'savedAt'>) => Promise<void>;
  onClose:      () => void;
}

const ACCENT = '#004aad';
type Tab = 'code' | 'file';

function isDarkBg(hex: string): boolean {
  const h = hex.replace('#', '');
  if (h.length < 6) return false;
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b < 80;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  visible, currentTheme, onImport, onClose,
}) => {
  const dark    = isDarkBg(currentTheme.background);
  const modalBg = dark ? '#0d1825' : '#ffffff';
  const borderC = dark ? '#1e2e45' : '#dce4f5';
  const inputBg = dark ? '#101c2e' : '#f4f7ff';

  const [tab,     setTab]     = useState<Tab>('code');
  const [code,    setCode]    = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const reset = () => {
    setCode('');
    setError('');
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // ── Import via code ────────────────────────────────────────────────────────
  const handleCodeImport = async () => {
    setError('');
    const trimmed = code.trim();
    if (!trimmed) { setError('Please enter a code.'); return; }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    try {
      const data = decodeSet(trimmed);
      if (!data) {
        setError('Invalid code. Make sure you copied the full VD-XXXXXX-… code.');
        return;
      }
      await onImport(data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      handleClose();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Import via JSON ────────────────────────────────────────────────────────
  const handleFileImport = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    setError('');
    try {
      const data = await importFromJSON();
      if (!data) {
        setError('No file selected or invalid VirtualDyno file.');
        return;
      }
      await onImport(data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      handleClose();
    } catch {
      setError('Could not read the file. Make sure it is a valid VirtualDyno JSON.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />

        <View style={[styles.sheet, { backgroundColor: modalBg }]}>
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: dark ? '#1e2e45' : '#dce4f5' }]} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: currentTheme.text }]}>Import Set</Text>
            <TouchableOpacity
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="x" size={20} color={dark ? '#4a6890' : '#8899bb'} />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={[styles.tabBar, { backgroundColor: dark ? '#0a1520' : '#f0f4ff', borderColor: borderC }]}>
            {(['code', 'file'] as Tab[]).map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
                onPress={() => { Haptics.selectionAsync(); setTab(t); setError(''); }}
              >
                <Feather
                  name={t === 'code' ? 'key' : 'file-text'}
                  size={14}
                  color={tab === t ? '#fff' : (dark ? '#4a6890' : '#8899bb')}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                  {t === 'code' ? 'Enter Code' : 'Open File'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Tab: Code ── */}
          {tab === 'code' && (
            <View style={styles.tabContent}>
              <Text style={[styles.inputLabel, { color: dark ? '#4a6890' : '#8899bb' }]}>
                PASTE CODE
              </Text>
              <View style={[
                styles.inputCard,
                { backgroundColor: inputBg, borderColor: code ? ACCENT : borderC },
              ]}>
                <TextInput
                  style={[styles.inputField, { color: currentTheme.text }]}
                  placeholder="VD-A3X9KQ-…"
                  placeholderTextColor={dark ? '#2a3e58' : '#c0cce0'}
                  value={code}
                  onChangeText={t => { setCode(t); setError(''); }}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleCodeImport}
                  multiline
                  numberOfLines={3}
                />
              </View>
              <Text style={[styles.hint, { color: dark ? '#2a3e58' : '#c0cce0' }]}>
                The full code starts with VD- and was shared by another VirtualDyno user.
              </Text>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  { backgroundColor: code.trim() ? ACCENT : (dark ? '#1a2e4a' : '#e4e8f0') },
                  code.trim() && styles.actionBtnActive,
                ]}
                onPress={handleCodeImport}
                disabled={loading || !code.trim()}
                activeOpacity={0.85}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <>
                      <Feather name="download" size={16} color={code.trim() ? '#fff' : (dark ? '#2a3e58' : '#b0bdd0')} style={{ marginRight: 8 }} />
                      <Text style={[styles.actionBtnText, { color: code.trim() ? '#fff' : (dark ? '#2a3e58' : '#b0bdd0') }]}>
                        Import Code
                      </Text>
                    </>
                }
              </TouchableOpacity>
            </View>
          )}

          {/* ── Tab: File ── */}
          {tab === 'file' && (
            <View style={styles.tabContent}>
              <View style={[styles.fileZone, { borderColor: dark ? '#1e2e45' : '#dce4f5', backgroundColor: inputBg }]}>
                <Feather name="file-text" size={32} color={dark ? '#1e2e45' : '#c0cce0'} />
                <Text style={[styles.fileZoneTitle, { color: currentTheme.text }]}>
                  Open a VirtualDyno JSON file
                </Text>
                <Text style={[styles.fileZoneSub, { color: dark ? '#2a3e58' : '#c0cce0' }]}>
                  Select a .json file shared by another user or exported from this app
                </Text>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: ACCENT }, styles.actionBtnActive]}
                onPress={handleFileImport}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <>
                      <Feather name="folder" size={16} color="#fff" style={{ marginRight: 8 }} />
                      <Text style={[styles.actionBtnText, { color: '#fff' }]}>
                        Browse Files
                      </Text>
                    </>
                }
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: Platform.OS === 'ios' ? 32 : 16 }} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    alignSelf: 'center', marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  // ── Tabs ──────────────────────────────────────────────────────────────────
  tabBar: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    marginBottom: 20,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 9,
  },
  tabBtnActive: {
    backgroundColor: ACCENT,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8899bb',
  },
  tabTextActive: {
    color: '#fff',
  },
  // ── Tab content ───────────────────────────────────────────────────────────
  tabContent: {
    gap: 0,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  inputCard: {
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },
  inputField: {
    fontSize: 15,
    fontWeight: '500',
    padding: 0,
    minHeight: 60,
  },
  hint: {
    fontSize: 11,
    marginBottom: 16,
    lineHeight: 16,
  },
  fileZone: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    padding: 28,
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  fileZoneTitle: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  fileZoneSub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  errorText: {
    fontSize: 12,
    color: '#e03030',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  actionBtn: {
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  actionBtnActive: {
    shadowColor: ACCENT,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
