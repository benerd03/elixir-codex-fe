// app/(tabs)/materials.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { MOCK_MATERIALS, MaterialData } from '../../src/mockData';
import { getMaterialImage } from '../../constants/materialImages';

// 재료별 실제 성분 및 효능 매핑 데이터
const MATERIAL_DETAIL_MAP: Record<string, { original: string; desc: string }> = {
  m1: { original: '히알루론산', desc: '피부 속 깊은 보습 및 수분막 형성' },
  m2: { original: '콜라겐 펩타이드', desc: '피부 탄력 복구 및 조직 결속력 강화' },
  m3: { original: '비타민 C', desc: '맑고 산뜻한 항산화 및 유해 활성산소 중화' },
  m4: { original: '글루타치온', desc: '잡티 없이 맑은 안색 및 투명도 개선' },
  m5: { original: '비타민 B군 복합체', desc: '신진대사 촉진 및 즉각적인 기력 회복' },
  m6: { original: '코엔자임Q10', desc: '체내 세포 미토콘드리아 ATP 에너지 생성' },
  m7: { original: 'L-아르기닌', desc: '혈류 순환 촉진 및 폭발적 스태미나 부스팅' },
  m8: { original: '홍삼 / 인삼', desc: '면역력 증진 및 근본적인 생명력 보강' },
  m9: { original: '가르시니아 HCA', desc: '탄수화물 지방 합성 억제 및 체지방 감소' },
  m10: { original: '카테킨 (녹차)', desc: '체지방 연소열 촉진 및 노폐물 배출' },
  m11: { original: '차전자피 식이섬유', desc: '수분을 흡수해 가짜 허기 및 폭식 차단' },
  m12: { original: '바나바잎 코로솔산', desc: '식후 급격한 당 스파이크 조율 및 안정화' },
  m13: { original: 'L-테아닌', desc: '뇌파 안정, 스트레스 완화 및 알파파 방출' },
  m14: { original: '마그네슘', desc: '근육 이완, 신경계 평정 및 깊은 숙면 유도' },
  m15: { original: '밀크씨슬 (실리마린)', desc: '간 피로 해소 및 체내 독소 정화' },
};

export default function MaterialsScreen() {
  const [selectedMat, setSelectedMat] = useState<MaterialData>(MOCK_MATERIALS[0]);
  const detail = MATERIAL_DETAIL_MAP[selectedMat.id] || { original: '천연 성분', desc: '신비로운 연금술 재료' };
  const selectedImage = getMaterialImage(selectedMat.id);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentWrapper}>
        {/* 1. 상단 헤더 */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>🌿 재료 도감</Text>
        </View>

        {/* 2. 🏛️ 상단 선택 재료 인스펙터 */}
        <View style={styles.matShowcaseBox}>
          <View style={styles.matShowcaseTop}>
            <View style={styles.matLargeIconFrame}>
              {selectedImage ? (
                <Image source={selectedImage} style={styles.matLargeImage} resizeMode="contain" />
              ) : (
                <Text style={styles.matLargeIcon}>{selectedMat.icon}</Text>
              )}
            </View>

            <View style={styles.matMetaColumn}>
              <View style={styles.matGradeTag}>
                <Text style={styles.matGradeText}>[{selectedMat.grade}]</Text>
              </View>
              <Text style={styles.matShowcaseName}>{selectedMat.name}</Text>
              <Text style={styles.matOriginalName}>실제 성분: {detail.original}</Text>
            </View>
          </View>

          <View style={styles.matDescBox}>
            <Text style={styles.matDescLabel}>효능 & 역할</Text>
            <Text style={styles.matDescText}>{detail.desc}</Text>
          </View>
        </View>

        {/* 3. 🗃️ 하단 15종 재료 인벤토리 그리드 (4열) */}
        <Text style={styles.gridSectionHeading}>보유 재료 목록</Text>
        <ScrollView contentContainerStyle={styles.matGridScroll} showsVerticalScrollIndicator={false}>
          {MOCK_MATERIALS.map((item) => {
            const isSelected = selectedMat.id === item.id;
            const matImage = getMaterialImage(item.id);

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.matCardSlot, isSelected && styles.matCardSlotSelected]}
                onPress={() => setSelectedMat(item)}
                activeOpacity={0.8}
              >
                {/* 📌 우측 상단 수량 뱃지 */}
                <View style={styles.matCountBadge}>
                  <Text style={styles.matCountText}>x{item.count}</Text>
                </View>

                {/* 🖼️ 중앙 대형 도트 이미지 영역 */}
                <View style={styles.matImageCenterArea}>
                  {matImage ? (
                    <Image source={matImage} style={styles.matSlotImage} resizeMode="contain" />
                  ) : (
                    <Text style={styles.matSlotIcon}>{item.icon}</Text>
                  )}
                </View>

                {/* 🏷️ 하단 재료명 */}
                <View style={styles.matNameBottomBar}>
                  <Text style={styles.matSlotName} numberOfLines={1}>
                    {item.name}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#130E1F',
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 14,
    maxWidth: 600,
    width: '100%',
    marginHorizontal: 'auto',
  },
  headerRow: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // 🏛️ 상단 인스펙터
  matShowcaseBox: {
    backgroundColor: '#1C142A',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#594483',
    padding: 14,
    marginBottom: 14,
  },
  matShowcaseTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 10,
  },
  matLargeIconFrame: {
    width: 84,
    height: 84,
    backgroundColor: '#0D0818',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#7E61B9',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  matLargeImage: {
    width: 72,
    height: 72,
  },
  matLargeIcon: {
    fontSize: 42,
  },
  matMetaColumn: {
    flex: 1,
  },
  matGradeTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#3B235E',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  matGradeText: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: 'bold',
  },
  matShowcaseName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  matOriginalName: {
    color: '#A29BFE',
    fontSize: 12,
  },

  matDescBox: {
    backgroundColor: '#140D20',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#34264E',
  },
  matDescLabel: {
    color: '#C5A059',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  matDescText: {
    color: '#DDD',
    fontSize: 12,
    lineHeight: 17,
  },

  // 🗃️ 하단 4열 그리드
  gridSectionHeading: {
    color: '#E056FD',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  matGridScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 24,
  },
  matCardSlot: {
    width: '22.8%',
    aspectRatio: 0.82,
    backgroundColor: '#1C142A',
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#483566',
    paddingHorizontal: 4,
    paddingTop: 8,
    paddingBottom: 6,
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  matCardSlotSelected: {
    borderColor: '#E056FD',
    backgroundColor: '#341E4E',
  },

  // 📌 우측 상단 수량 뱃지
  matCountBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(14, 8, 24, 0.85)',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 5,
    borderWidth: 0.8,
    borderColor: '#483566',
    zIndex: 5,
  },
  matCountText: {
    color: '#FFD700',
    fontSize: 9.5,
    fontWeight: 'bold',
  },

  // 🖼️ 중앙 대형 이미지
  matImageCenterArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 6,
  },
  matSlotImage: {
    width: '78%',
    height: '78%',
  },
  matSlotIcon: {
    fontSize: 32,
  },

  // 🏷️ 하단 재료명
  matNameBottomBar: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 2,
  },
  matSlotName: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});