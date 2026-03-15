import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import * as Haptics from 'expo-haptics';
import { GarageSet } from './useGarage';
import { shareSocial, shareCode, shareJSON, getDisplayCode, encodeSet } from './shareUtils';

interface ShareModalProps {
  visible:      boolean;
  set:          GarageSet;
  currentTheme: { background: string; text: string };
  onClose:      () => void;
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

type ShareOption = 'social' | 'code' | 'json';

const OPTIONS: { key: ShareOption; icon: string; title: string; subtitle: string }[] = [
  {
    key:      'social',
    icon:     'share-2',
    title:    'Social Share',
    subtitle: 'Send results via WhatsApp, Telegram, Instagram…',
  },
  {
    key:      'code',
    icon:     'key',
    title:    'Share Code',
    subtitle: 'Generate a VD-XXXXXX code — importable by any VirtualDyno user',
  },
  {
    key:      'json',
    icon:     'file-text',
    title:    'Export JSON',
    subtitle: 'Full config file — open & import in VirtualDyno',
  },
];

export const ShareModal: React.FC<ShareModalProps> = ({
  visible, set, currentTheme, onClose,
}) => {
  const dark    = isDarkBg(currentTheme.background);
  const modalBg = dark ? '#0d1825' : '#ffffff';
  const borderC = dark ? '#1a2e4a' : '#e8eef8';

  const [loading, setLoading]     = useState<ShareOption | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);

  const displayCode = getDisplayCode(encodeSet(set));

  const handleOption = async (key: ShareOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(key);
    try {
      if (key === 'social') await shareSocial(set, set.isImperial);
      if (key === 'code')   {
        await shareCode(set);
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2500);
      }
      if (key === 'json')   await shareJSON(set);
    } catch (e) {
      console.warn('ShareModal error:', e);
    } finally {
      setLoading(null);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={[styles.sheet, { backgroundColor: modalBg }]}>
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: dark ? '#1e2e45' : '#dce4f5' }]} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={[styles.sheetTitle, { color: currentTheme.text }]}>Share Set</Text>
              <Text style={[styles.sheetSub, { color: dark ? '#4a6890' : '#8899bb' }]}>
                {set.brand} {set.model} — {set.title}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => { Haptics.selectionAsync(); onClose(); }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="x" size={20} color={dark ? '#4a6890' : '#8899bb'} />
            </TouchableOpacity>
          </View>

          {/* Options */}
          {OPTIONS.map((opt, i) => {
            const isLoading = loading === opt.key;
            const showCopied = opt.key === 'code' && codeCopied;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.optionRow,
                  {
                    borderColor: borderC,
                    borderTopWidth: i === 0 ? 1 : 0,
                    borderBottomWidth: 1,
                    backgroundColor: isLoading
                      ? (dark ? '#111c2e' : '#f0f4ff')
                      : 'transparent',
                  },
                ]}
                onPress={() => handleOption(opt.key)}
                activeOpacity={0.7}
                disabled={loading !== null}
              >
                {/* Icon bubble */}
                <View style={[styles.iconBubble, { backgroundColor: ACCENT + '18', borderColor: ACCENT + '40' }]}>
                  {isLoading
                    ? <ActivityIndicator size="small" color={ACCENT} />
                    : <Feather name={opt.icon as any} size={18} color={ACCENT} />
                  }
                </View>

                {/* Text */}
                <View style={styles.optionText}>
                  <Text style={[styles.optionTitle, { color: currentTheme.text }]}>
                    {showCopied ? '✓ Copied to clipboard!' : opt.title}
                  </Text>
                  <Text style={[styles.optionSubtitle, { color: dark ? '#4a6890' : '#8899bb' }]}>
                    {opt.key === 'code' && !showCopied
                      ? `Code: ${displayCode} · Also copied`
                      : opt.subtitle}
                  </Text>
                </View>

                <Feather
                  name="chevron-right"
                  size={16}
                  color={dark ? '#2a3e58' : '#c0cce0'}
                />
              </TouchableOpacity>
            );
          })}

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
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  sheetSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 12,
  },
});
