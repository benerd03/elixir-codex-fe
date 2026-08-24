// app/(tabs)/codex.tsx
import React, { Fragment, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Alert,
} from 'react-native';
import { MOCK_ELIXIRS, ElixirCardData } from '../../src/mockData';
import ElixirDetailModal from '../../src/components/ElixirDetailModal';
import { SafeAreaView } from 'react-native-safe-area-context';

// 5대 카테고리 정의
const CATEGORIES = [
  { id: 'ALL', name: '전체 도감', icon: '✨' },
  { id: '피부/항산화', name: '피부 / 항산화', icon: '🌸' },
  { id: '피로/에너지', name: '피로 / 에너지', icon: '⚡' },
  { id: '혈당/다이어트', name: '혈당 / 다이어트', icon: '🩸' },
  { id: '수면/휴식', name: '수면 / 휴식', icon: '🌙' },
];

const GRADES = ['All', 'Common', 'Rare', 'Epic', 'Prismatic'];

export default function CodexScreen() {
  const [selectedElixir, setSelectedElixir] = useState<ElixirCardData>(MOCK_ELIXIRS[0]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // 카테고리 + 등급 복합 필터링
  const filteredList = MOCK_ELIXIRS.filter((item) => {
    let matchCategory = true;
    if (selectedCategory !== 'ALL') {
      matchCategory = item.themeCategory === selectedCategory;
    }

    let matchGrade = true;
    if (selectedGrade !== 'All') {
      matchGrade = item.grade === selectedGrade;
    }

    return matchCategory && matchGrade;
  });

  const handleSelectCard = (item: ElixirCardData) => {
    if (!item.isUnlocked) {
      Alert.alert('🔒 미해금 비약', '가마솥에서 재료를 조합해 이 비약을 연성해 보세요!');
      return;
    }
    setSelectedElixir(item);
  };

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    setDrawerOpen(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentWrapper}>
        {/* 1. 상단 헤더 */}
        <View style={styles.headerRow}>
          <View>
            <View style={styles.headerTitleBox}>
              <Text style={styles.headerIcon}>🔮</Text>
              <Text style={styles.headerText}>도감 코덱스</Text>
            </View>
            <Text style={styles.categorySubText}>
              현재 테마: <Text style={styles.categoryHighlight}>
                {CATEGORIES.find((c) => c.id === selectedCategory)?.name}
              </Text>
            </Text>
          </View>

          {/* ☰ 카테고리 서랍 버튼 */}
          <TouchableOpacity style={styles.hamburgerBtn} onPress={() => setDrawerOpen(true)} activeOpacity={0.8}>
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
          </TouchableOpacity>
        </View>

        {/* 2. 🏛️ 상단 고정 전시대 (재료 탭 인스펙터 규격 통일) */}
        <TouchableOpacity
          style={styles.showcaseContainer}
          activeOpacity={0.9}
          onPress={() => setDetailModalOpen(true)}
        >
          <View style={styles.showcaseTopRow}>
            <View style={styles.potionStageFrame}>
              <Image
                source={selectedElixir.imageSource}
                style={styles.showcasePotionImage}
                resizeMode="cover"
              />
            </View>

            <View style={styles.showcaseMetaInfo}>
              <View style={styles.gradeBadge}>
                <Text style={styles.gradeBadgeText}>🟣 {selectedElixir.grade}</Text>
              </View>
              <Text style={styles.showcaseTitle}>{selectedElixir.name}</Text>
              <Text style={styles.tapToDetailHint}>👆 탭하여 자세히 보기</Text>
            </View>
          </View>

          <View style={styles.showcaseDetailsTable}>
            <View style={styles.tableRow}>
              <Text style={styles.rowLabel}>재료</Text>
              <Text style={styles.rowValue} numberOfLines={1}>
                {selectedElixir.ingredientSummary}
              </Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.rowLabel}>설명</Text>
              <Text style={styles.rowValueDesc} numberOfLines={2}>
                {selectedElixir.brewingLore}
              </Text>
            </View>

            <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.rowLabel}>스탯</Text>
              <View style={styles.statChipRow}>
                {Object.entries(selectedElixir.stats).map(([statName, val]) => (
                  <Text key={statName} style={styles.statChipText}>
                    {statName}: <Text style={styles.statChipNum}>{val}</Text>
                  </Text>
                ))}
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* 3. 중앙 등급 필터 탭 바 */}
        <View style={styles.gradeFilterTabBar}>
          {GRADES.map((grade) => (
            <TouchableOpacity
              key={grade}
              style={[styles.gradeTabBtn, selectedGrade === grade && styles.gradeTabBtnActive]}
              onPress={() => setSelectedGrade(grade)}
            >
              <Text style={[styles.gradeTabText, selectedGrade === grade && styles.gradeTabTextActive]}>
                {grade}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 4. 🗃️ 하단 4열 도감 포션 그리드 (재료 탭과 1:1 일치) */}
        <ScrollView
          contentContainerStyle={styles.bottomGridContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredList.map((item) => {
            const isSelected = selectedElixir.id === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.gridPotionSlot,
                  isSelected && styles.gridPotionSlotSelected,
                  !item.isUnlocked && styles.gridPotionSlotLocked,
                ]}
                onPress={() => handleSelectCard(item)}
                activeOpacity={0.8}
              >
                {/* 📌 등급/잠금 뱃지 */}
                <View style={styles.slotTopBadge}>
                  <Text style={styles.slotTopBadgeText}>
                    {item.isUnlocked ? item.grade.substring(0, 1) : '🔒'}
                  </Text>
                </View>

                {/* 🖼️ 중앙 이미지/아이콘 영역 */}
                <View style={styles.slotCenterArea}>
                  {item.isUnlocked ? (
                    <Image source={item.imageSource} style={styles.gridPotionThumb} resizeMode="cover" />
                  ) : ( 
                    <Image
                      source={require('../../assets/images/img_locked_large.png')}
                      style={styles.slotLockedThumbImg}
                      resizeMode="contain"
                    />
                  )}
                </View>

              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 5. 📂 우측 슬라이드 5대 카테고리 서랍 */}
      <Modal visible={drawerOpen} transparent animationType="fade">
        <View style={styles.drawerOverlay}>
          <TouchableOpacity style={styles.backdrop} onPress={() => setDrawerOpen(false)} />
          <View style={styles.drawerSidePanel}>
            <Text style={styles.drawerHeaderTitle}>카테고리 선택</Text>
            <View style={styles.divider} />
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.drawerItem, isSelected && styles.drawerItemSelected]}
                  onPress={() => handleSelectCategory(cat.id)}
                >
                  <Text style={styles.drawerItemIcon}>{cat.icon}</Text>
                  <Text style={[styles.drawerItemText, isSelected && styles.drawerItemTextSelected]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>

      {/* 6. 🔬 상세 과학 메커니즘 모달 */}
      <ElixirDetailModal
        visible={detailModalOpen}
        elixir={selectedElixir}
        onClose={() => setDetailModalOpen(false)}
      />
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

  // 헤더
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  headerTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerIcon: { fontSize: 18 },
  headerText: { color: '#FFD700', fontSize: 18, fontWeight: 'bold' },
  categorySubText: { fontSize: 11, color: '#8A7A9E', marginTop: 2 },
  categoryHighlight: { color: '#E056FD', fontWeight: 'bold' },
  hamburgerBtn: {
    width: 36,
    height: 36,
    backgroundColor: '#231A38',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3.5,
    borderWidth: 1.2,
    borderColor: '#4A3B6E',
  },
  hamburgerLine: { width: 16, height: 2, backgroundColor: '#E056FD', borderRadius: 1 },

  // 🏛️ 상단 전시대 (재료 탭과 완전 일치)
  showcaseContainer: {
    backgroundColor: '#1C142A',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#594483',
    padding: 14,
    marginBottom: 12,
  },
  showcaseTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 10,
  },
  potionStageFrame: {
    width: 84,
    height: 84,
    backgroundColor: '#0D0818',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#7E61B9',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  showcasePotionImage: { width: '100%', height: '100%' },
  showcaseMetaInfo: { flex: 1, justifyContent: 'center' },
  gradeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#3B235E',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
    borderWidth: 0.8,
    borderColor: '#9B51E0',
  },
  gradeBadgeText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  showcaseTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 3 },
  tapToDetailHint: { color: '#A29BFE', fontSize: 11, fontStyle: 'italic' },

  showcaseDetailsTable: {
    backgroundColor: '#140D20',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#34264E',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 3.5,
    borderBottomWidth: 0.8,
    borderBottomColor: '#251A38',
  },
  rowLabel: { width: 38, color: '#C5A059', fontSize: 11, fontWeight: 'bold' },
  rowValue: { flex: 1, color: '#DDD', fontSize: 11 },
  rowValueDesc: { flex: 1, color: '#DDD', fontSize: 11, lineHeight: 15 },
  statChipRow: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statChipText: { color: '#AAA', fontSize: 10.5 },
  statChipNum: { color: '#FFD700', fontWeight: 'bold' },

  // 중앙 등급 탭 바
  gradeFilterTabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1C142A',
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: '#382B55',
    marginBottom: 10,
  },
  gradeTabBtn: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6 },
  gradeTabBtnActive: { backgroundColor: '#5D3B8E' },
  gradeTabText: { color: '#8A7A9E', fontSize: 11.5, fontWeight: '600' },
  gradeTabTextActive: { color: '#FFF', fontWeight: 'bold' },

  // 🗃️ 하단 4열 그리드
  bottomGridContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 24,
  },
  gridPotionSlot: {
    width: '31.5%',
    aspectRatio: 0.6,
    backgroundColor: '#1C142A',
    borderRadius:7,
    borderWidth: 1.2,
    borderColor: '#483566',
    paddingHorizontal: 4,
    paddingTop: 8,
    paddingBottom: 6,
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  gridPotionSlotSelected: {
    borderColor: '#ab5734',
    backgroundColor: '#c5c6e5',
  },
  gridPotionSlotLocked: {
    backgroundColor: '#0a080e',
    borderStyle: 'dashed',
    borderColor: '#2E2242',
    opacity: 0.75,
  },
  slotLockedThumbImg: {
    width: '75%',
    height: '75%',
    opacity: 0.75,
  },

  // 우측 상단 뱃지
  slotTopBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(56, 71, 134, 0.85)',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'transparent',
    zIndex: 5,
  },
  slotTopBadgeText: {
    color: '#c5bd8e',
    fontSize: 9.5,
    fontWeight: 'bold',
  },

  // 중앙 포션 일러스트
  slotCenterArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop:0,
  },
  gridPotionThumb: {
    width: '95%',
    height: '98%',
    borderRadius: 4,
  },
  lockIcon: {
    fontSize: 24,
    opacity: 0.5,
  },

  // 하단 텍스트 바
  slotNameBottomBar: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 2,
  },
  gridPotionName: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gridLockedName: {
    color: '#6A5F7D',
    fontSize: 8.5,
  },

  // 우측 서랍
  drawerOverlay: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.6)' },
  backdrop: { flex: 0.55 },
  drawerSidePanel: {
    flex: 0.45,
    backgroundColor: '#201C34',
    paddingTop: 50,
    paddingHorizontal: 14,
    borderLeftWidth: 1.5,
    borderLeftColor: '#6C5CE7',
  },
  drawerHeaderTitle: { color: '#FFF', fontSize: 15, fontWeight: 'bold', marginBottom: 8 },
  divider: { height: 1, backgroundColor: '#3E3960', marginBottom: 12 },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  drawerItemSelected: { backgroundColor: '#352B52', borderWidth: 1, borderColor: '#E056FD' },
  drawerItemIcon: { fontSize: 16, marginRight: 8 },
  drawerItemText: { color: '#AAA', fontSize: 12, fontWeight: '600' },
  drawerItemTextSelected: { color: '#FFF', fontWeight: 'bold' },
});