// app/(tabs)/cauldron.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, Modal, Image, ScrollView } from 'react-native';
import { MOCK_MATERIALS, MOCK_ELIXIRS } from '../../src/mockData';

export default function CauldronScreen() {
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [isBrewing, setIsBrewing] = useState(false);
  const [resultElixir, setResultElixir] = useState<any>(null);

  const toggleMaterial = (id: string) => {
    if (selectedMaterials.includes(id)) {
      setSelectedMaterials(selectedMaterials.filter((mId) => mId !== id));
    } else {
      setSelectedMaterials([...selectedMaterials, id]);
    }
  };

  const handleBrew = () => {
    if (selectedMaterials.length === 0) {
      alert('가마솥에 넣을 재료를 최소 1개 이상 선택해 주세요!');
      return;
    }
    setIsBrewing(true);

    setTimeout(() => {
      setIsBrewing(false);
      const randomElixir = MOCK_ELIXIRS[Math.floor(Math.random() * MOCK_ELIXIRS.length)];
      setResultElixir(randomElixir);
      setSelectedMaterials([]);
    }, 2500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cauldronArea}>
        <Text style={styles.cauldronIcon}>🏺</Text>
        <Text style={styles.cauldronTitle}>신비로운 가마솥</Text>
        <Text style={styles.cauldronSub}>
          {selectedMaterials.length > 0 ? `${selectedMaterials.length}개 재료 투입됨` : '재료를 선택해 넣으세요'}
        </Text>
      </View>

      <View style={styles.inventoryArea}>
        <Text style={styles.inventoryTitle}>🎒 나의 재료 가방</Text>
        <ScrollView contentContainerStyle={styles.grid}>
          {MOCK_MATERIALS.map((mat) => {
            const isSelected = selectedMaterials.includes(mat.id);
            return (
              <TouchableOpacity
                key={mat.id}
                style={[styles.matCard, isSelected && styles.selectedMatCard]}
                onPress={() => toggleMaterial(mat.id)}
              >
                <Text style={styles.rewardIcon}>{mat.icon}</Text>
                <Text style={styles.rewardName}>{mat.name}</Text>
                <Text style={styles.rewardCount}>보유: {mat.count}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <TouchableOpacity style={styles.alchemyButton} onPress={handleBrew} disabled={isBrewing}>
        <Text style={styles.alchemyButtonText}>🔥 전설의 비약 연성하기</Text>
      </TouchableOpacity>

      <Modal visible={isBrewing} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#E056FD" />
          <Text style={styles.loadingText}>가마솥에서 연금술이 일어나는 중...</Text>
        </View>
      </Modal>

      <Modal visible={!!resultElixir} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.resultCard}>
            <Text style={styles.resultBadge}>✨ 연성 성공! ✨</Text>
            {resultElixir && (
              <>
                <Image source={{ uri: resultElixir.imageUrl }} style={styles.resultImage} />
                <Text style={styles.resultName}>{resultElixir.name}</Text>
                <Text style={styles.resultComment}>"{resultElixir.adviserComment}"</Text>
              </>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={() => setResultElixir(null)}>
              <Text style={styles.closeButtonText}>도감에 보관하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0808', padding: 16, paddingTop: 30 },
  cauldronArea: { flex: 0.4, backgroundColor: '#1c1618', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  cauldronIcon: { fontSize: 60, marginBottom: 10 },
  cauldronTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  cauldronSub: { color: '#AAA', fontSize: 13, marginTop: 6 },
  inventoryArea: { flex: 0.5, marginBottom: 16 },
  inventoryTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  matCard: { width: '30%', backgroundColor: '#2a2225', padding: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#443338' },
  selectedMatCard: { borderColor: '#E056FD', backgroundColor: '#3e244d' },
  rewardIcon: { fontSize: 24, marginBottom: 4 },
  rewardName: { color: '#FFF', fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
  rewardCount: { color: '#FFD700', fontSize: 11, marginTop: 4 },
  alchemyButton: { backgroundColor: '#E056FD', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  alchemyButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  loadingOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#E056FD', marginTop: 16, fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center' },
  resultCard: { width: '85%', backgroundColor: '#2C2A4A', padding: 24, borderRadius: 20, alignItems: 'center' },
  resultBadge: { color: '#FFD700', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  resultImage: { width: 120, height: 120, borderRadius: 12, marginBottom: 12 },
  resultName: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  resultComment: { color: '#DDD', fontSize: 13, textAlign: 'center', fontStyle: 'italic', marginBottom: 20 },
  closeButton: { backgroundColor: '#6C5CE7', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  closeButtonText: { color: '#FFF', fontWeight: 'bold' },
});