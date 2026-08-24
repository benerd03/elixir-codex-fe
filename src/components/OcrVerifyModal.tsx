import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface Props {
  visible: boolean;
  onClose: () => void;
  appendPhoto: (uri: string) => void; // 💡 부모 컴포넌트에서 받아올 함수
}

export default function OcrVerifyModal({ visible, onClose, appendPhoto }: Props) {
  
  // 📷 유저 작성 코드: 카메라 촬영
  const handleAddFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '카메라 촬영을 위해 권한 허용이 필요합니다.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      appendPhoto(result.assets[0].uri);
      onClose(); // (선택) 사진 등록 후 모달 닫기
    }
  };

  // 🖼️ 유저 작성 코드: 갤러리 선택
  const handleAddFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      appendPhoto(result.assets[0].uri);
      onClose(); // (선택) 사진 등록 후 모달 닫기
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.title}>💊 영양제 사진 인증 (OCR)</Text>
          <Text style={styles.desc}>영양제 사진을 촬영하거나 갤러리에서 선택해 주세요.</Text>
          
          <TouchableOpacity style={styles.actionBtn} onPress={handleAddFromCamera}>
            <Text style={styles.actionBtnText}>📷 사진 촬영하기</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#4C2870' }]} onPress={handleAddFromGallery}>
            <Text style={styles.actionBtnText}>🖼️ 갤러리에서 선택</Text>
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
  closeBtn: { paddingVertical: 8, marginTop: 10 },
  btnText: { color: '#888' },
});