import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Modal, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import * as Haptics from 'expo-haptics';
import { GarageSet } from './useGarage';

interface SaveSetModalProps {
  visible:      boolean;
  editingSet?:  GarageSet | null;   // null = new save, GarageSet = editing
  currentTheme: { background: string; text: string };
  // Pre-filled data (from current calculation)
  prefill?: Omit<GarageSet, 'id' | 'savedAt' | 'title' | 'brand' | 'model'>;
  onSave:   (title: string, brand: string, model: string) => void;
  onCancel: () => void;
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

export const SaveSetModal: React.FC<SaveSetModalProps> = ({
  visible, editingSet, currentTheme, onSave, onCancel,
}) => {
  const dark    = isDarkBg(currentTheme.background);
  const modalBg = dark ? '#0d1825' : '#ffffff';
  const inputBg = dark ? '#101c2e' : '#f4f7ff';
  const borderC = dark ? '#1e2e45' : '#dce4f5';

  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');

  // Pre-fill when editing
  useEffect(() => {
    if (editingSet) {
      setTitle(editingSet.title);
      setBrand(editingSet.brand);
      setModel(editingSet.model);
    } else {
      setTitle('');
      setBrand('');
      setModel('');
    }
  }, [editingSet, visible]);

  const canSave = title.trim().length > 0 && brand.trim().length > 0 && model.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSave(title.trim(), brand.trim(), model.trim());
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: inputBg, borderColor: borderC, color: currentTheme.text },
  ];
  const labelStyle = [styles.inputLabel, { color: dark ? '#4a6890' : '#8899bb' }];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onCancel} />

        <View style={[styles.sheet, { backgroundColor: modalBg }]}>
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: dark ? '#1e2e45' : '#dce4f5' }]} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: currentTheme.text }]}>
              {editingSet ? 'Edit Set' : 'Save Set'}
            </Text>
            <TouchableOpacity onPress={() => { Haptics.selectionAsync(); onCancel(); }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="x" size={20} color={dark ? '#4a6890' : '#8899bb'} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Title */}
            <Text style={labelStyle}>TITLE</Text>
            <View style={[styles.inputCard, { backgroundColor: inputBg, borderColor: title ? ACCENT : borderC }]}>
              <TextInput
                style={[styles.inputField, { color: currentTheme.text }]}
                placeholder="e.g. Track day setup"
                placeholderTextColor={dark ? '#2a3e58' : '#c0cce0'}
                value={title}
                onChangeText={setTitle}
                maxLength={40}
                returnKeyType="next"
              />
            </View>

            {/* Brand */}
            <Text style={[labelStyle, { marginTop: 14 }]}>MANUFACTURER</Text>
            <View style={[styles.inputCard, { backgroundColor: inputBg, borderColor: brand ? ACCENT : borderC }]}>
              <TextInput
                style={[styles.inputField, { color: currentTheme.text }]}
                placeholder="e.g. Ferrari"
                placeholderTextColor={dark ? '#2a3e58' : '#c0cce0'}
                value={brand}
                onChangeText={setBrand}
                maxLength={30}
                returnKeyType="next"
              />
            </View>

            {/* Model */}
            <Text style={[labelStyle, { marginTop: 14 }]}>MODEL</Text>
            <View style={[styles.inputCard, { backgroundColor: inputBg, borderColor: model ? ACCENT : borderC }]}>
              <TextInput
                style={[styles.inputField, { color: currentTheme.text }]}
                placeholder="e.g. 488 GTB"
                placeholderTextColor={dark ? '#2a3e58' : '#c0cce0'}
                value={model}
                onChangeText={setModel}
                maxLength={30}
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
            </View>

            {/* Save button */}
            <TouchableOpacity
              style={[
                styles.saveBtn,
                { backgroundColor: canSave ? ACCENT : (dark ? '#1a2e4a' : '#e4e8f0') },
                canSave && styles.saveBtnActive,
              ]}
              onPress={handleSave}
              disabled={!canSave}
              activeOpacity={0.85}
            >
              <Feather
                name={editingSet ? 'check' : 'bookmark'}
                size={16}
                color={canSave ? '#fff' : (dark ? '#2a3e58' : '#b0bdd0')}
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.saveBtnText, { color: canSave ? '#fff' : (dark ? '#2a3e58' : '#b0bdd0') }]}>
                {editingSet ? 'Update Set' : 'Save Set'}
              </Text>
            </TouchableOpacity>

            <View style={{ height: 20 }} />
          </ScrollView>
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
    paddingBottom: 0,
    maxHeight: '80%',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    alignSelf: 'center', marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
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
    paddingVertical: 12,
  },
  inputField: {
    fontSize: 16,
    fontWeight: '500',
    padding: 0,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  saveBtn: {
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  saveBtnActive: {
    shadowColor: ACCENT,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
