import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function OcrVerifyModal({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.title}>💊 영양제 사진 인증 (OCR)</Text>
          <Text style={styles.desc}>영양제 사진을 촬영하거나 갤러리에서 선택해 주세요.</Text>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>📷 사진 촬영하기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.btnText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: '85%', backgroundColor: '#2C2A4A', padding: 20, borderRadius: 16, alignItems: 'center' },
  title: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  desc: { color: '#AAA', fontSize: 13, textAlign: 'center', marginBottom: 20 },
  actionBtn: { backgroundColor: '#E056FD', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, marginBottom: 10, width: '100%', alignItems: 'center' },
  actionBtnText: { color: '#FFF', fontWeight: 'bold' },
  closeBtn: { paddingVertical: 8 },
  btnText: { color: '#888' },
});