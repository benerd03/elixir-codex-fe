// src/components/ElixirDetailModal.tsx
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { ElixirCardData } from '../mockData';

interface Props {
  visible: boolean;
  elixir: ElixirCardData | null;
  onClose: () => void;
}

export default function ElixirDetailModal({ visible, elixir, onClose }: Props) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAdvisor, setShowAdvisor] = useState(false);

  if (!elixir) return null;

  const handleCloseModal = () => {
    setIsFlipped(false);
    setShowAdvisor(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.fullscreenCardWrapper}>
          <View style={styles.hugeCardContainer}>
            
            {/* 닫기 X 버튼 */}
            <TouchableOpacity style={styles.modalCloseIcon} onPress={handleCloseModal}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>

            {!isFlipped ? (
              /* 🎴 [앞면] */
              <ScrollView
                style={styles.cardScrollView}
                contentContainerStyle={styles.cardScrollContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.cardTopHeader}>
                  <View style={styles.cardGradeTag}>
                    <Text style={styles.cardGradeText}>[{elixir.grade}]</Text>
                  </View>
                  <Text style={styles.cardThemeText}>{elixir.themeCategory}</Text>
                </View>

                <Text style={styles.cardTitle}>{elixir.name}</Text>

                {/* 대형 포션 일러스트 */}
                <View style={styles.largeArtFrame}>
                  <Image source={elixir.imageSource} style={styles.largePotionImage} resizeMode="cover" />
                </View>

                {/* 비약 스탯 */}
                <View style={styles.cardStatsBox}>
                  <Text style={styles.sectionHeaderLabel}>비약 스탯</Text>
                  {Object.entries(elixir.stats).map(([statName, val]) => (
                    <View key={statName} style={styles.statGaugeRow}>
                      <Text style={styles.statGaugeLabel}>{statName}</Text>
                      <View style={styles.statGaugeTrack}>
                        <View style={[styles.statGaugeBar, { width: `${val}%` }]} />
                      </View>
                      <Text style={styles.statGaugeNum}>{val}</Text>
                    </View>
                  ))}
                </View>

                {/* 카드 설명 (시너지) */}
                <View style={styles.synergyCardBox}>
                  <Text style={styles.synergyTitle}>🏺 카드 설명</Text>
                  <Text style={styles.synergyContent}>{elixir.brewingLore}</Text>
                </View>

                {/* 드래그 시 보이는 핵심 성분 & 재료 */}
                <View style={styles.coreSectionBox}>
                  <Text style={styles.sectionHeaderLabel}>핵심 성분</Text>
                  <Text style={styles.coreIngredientsText}>{elixir.supplementSummary}</Text>
                </View>

                <View style={styles.materialsSectionBox}>
                  <Text style={styles.sectionHeaderLabel}>투입 재료</Text>
                  <Text style={styles.ingredientSummaryText}>{elixir.ingredientSummary}</Text>
                </View>

                <View style={{ height: 20 }} />
              </ScrollView>
            ) : (
              /* 📜 [뒷면] 과학적 설명 */
              <ScrollView
                style={styles.cardScrollView}
                contentContainerStyle={styles.cardScrollContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.cardTopHeader}>
                  <View style={styles.backBadgeTag}>
                    <Text style={styles.backBadgeText}>CARD BACK</Text>
                  </View>
                  <Text style={styles.cardThemeText}>🔬 과학적 설명 (도감)</Text>
                </View>

                <Text style={styles.backCardTitle}>{elixir.name}의 성분 분석서</Text>

                <View style={styles.backSectionHeader}>
                  <Text style={styles.backSectionTitle}>🌿 투입 성분 1:1 상호작용</Text>
                </View>

                {/* 2단 분할 성분 카드 */}
                {elixir.ingredientScienceList && elixir.ingredientScienceList.length > 0 ? (
                  elixir.ingredientScienceList.map((item, idx) => (
                    <View key={idx} style={styles.ingredientScienceCard2Col}>
                      <View style={styles.ingredientLeftSlot}>
                        <Text style={styles.ingredientSlotIcon}>{item.icon}</Text>
                      </View>
                      <View style={styles.ingredientRightInfo}>
                        <View style={styles.ingredientHeaderRow}>
                          <Text style={styles.ingredientFantasyName}>{item.name}</Text>
                          <View style={styles.originalBadge}>
                            <Text style={styles.originalBadgeText}>{item.original}</Text>
                          </View>
                        </View>
                        <Text style={styles.ingredientEffectBody}>{item.effect}</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.ingredientScienceCard2Col}>
                    <Text style={styles.ingredientEffectBody}>기본 성분의 반응 기전이 기록되어 있습니다.</Text>
                  </View>
                )}

                {/* 종합 생화학 메커니즘 */}
                <View style={styles.overallScienceBox}>
                  <Text style={styles.overallScienceTitle}>🧬 종합 생화학적 메커니즘</Text>
                  <Text style={styles.overallScienceBody}>{elixir.scienceDesc}</Text>
                </View>

                <View style={{ height: 20 }} />
              </ScrollView>
            )}

            {/* 늘해랑 조언 툴팁 */}
            {showAdvisor && (
              <View style={styles.advisorFloatingTooltip}>
                <Text style={styles.advisorSpeaker}>늘해랑의 조언</Text>
                <Text style={styles.advisorSayText}>"{elixir.recipeHint || elixir.adviserComment}"</Text>
              </View>
            )}

            {/* 하단 액션 바 */}
            <View style={styles.bottomActionBar}>
              <TouchableOpacity
                style={styles.ovalAdvisorBtn}
                onPressIn={() => setShowAdvisor(true)}
                onPressOut={() => setShowAdvisor(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.ovalAdvisorText}>...</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.flipActionBtn, isFlipped && styles.flipActionBtnActive]}
                onPress={() => setIsFlipped(!isFlipped)}
                activeOpacity={0.8}
              >
                <Text style={styles.flipActionBtnText}>
                  {isFlipped ? '앞면 보기' : '뒷면보기'}
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.92)', justifyContent: 'center', alignItems: 'center' },
  fullscreenCardWrapper: { width: '92%', height: '90%', justifyContent: 'center', alignItems: 'center' },
  hugeCardContainer: { width: '100%', height: '100%', backgroundColor: '#201C34', borderRadius: 22, borderWidth: 2.2, borderColor: '#F0932B', overflow: 'hidden', position: 'relative' },
  modalCloseIcon: { position: 'absolute', top: 10, right: 12, zIndex: 30, padding: 6 },
  modalCloseText: { color: '#AAA', fontSize: 18, fontWeight: 'bold' },
  cardScrollView: { flex: 1 },
  cardScrollContent: { padding: 14 },
  cardTopHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6, paddingRight: 30 },
  cardGradeTag: { backgroundColor: '#F0932B', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  cardGradeText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  cardThemeText: { color: '#A29BFE', fontSize: 12, fontWeight: '700' },
  cardTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  largeArtFrame: { width: '100%', height: 440, borderRadius: 16, overflow: 'hidden', backgroundColor: '#141222', borderWidth: 1.5, borderColor: '#3E3960', marginBottom: 14 },
  largePotionImage: { width: '100%', height: '100%' },
  sectionHeaderLabel: { color: '#E056FD', fontSize: 11, fontWeight: 'bold', marginBottom: 6 },
  cardStatsBox: { backgroundColor: '#161326', borderRadius: 10, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: '#2F2B4A' },
  statGaugeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  statGaugeLabel: { width: 80, color: '#CCC', fontSize: 11, fontWeight: '600' },
  statGaugeTrack: { flex: 1, height: 12, backgroundColor: '#2E2B44', borderRadius: 6, overflow: 'hidden' },
  statGaugeBar: { height: '100%', backgroundColor: '#F0932B', borderRadius: 6 },
  statGaugeNum: { width: 28, textAlign: 'right', color: '#FFD700', fontSize: 11, fontWeight: 'bold' },
  synergyCardBox: { backgroundColor: '#161326', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#F0932B', marginBottom: 10 },
  synergyTitle: { color: '#F0932B', fontSize: 11, fontWeight: 'bold', marginBottom: 4 },
  synergyContent: { color: '#EEE', fontSize: 11, lineHeight: 16 },
  coreSectionBox: { backgroundColor: '#161326', borderRadius: 10, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: '#2F2B4A' },
  coreIngredientsText: { color: '#EEE', fontSize: 11, lineHeight: 16 },
  materialsSectionBox: { backgroundColor: '#161326', borderRadius: 10, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: '#2F2B4A' },
  ingredientSummaryText: { color: '#DDD', fontSize: 11 },
  backBadgeTag: { backgroundColor: '#6C5CE7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  backBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  backCardTitle: { color: '#FFF', fontSize: 17, fontWeight: 'bold', marginBottom: 14 },
  backSectionHeader: { marginBottom: 8 },
  backSectionTitle: { color: '#E056FD', fontSize: 12, fontWeight: 'bold' },
  ingredientScienceCard2Col: { flexDirection: 'row', backgroundColor: '#161326', borderRadius: 12, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: '#2F2B4A', gap: 10 },
  ingredientLeftSlot: { width: 50, height: 50, backgroundColor: '#231D38', borderRadius: 10, borderWidth: 1.2, borderColor: '#6C5CE7', justifyContent: 'center', alignItems: 'center' },
  ingredientSlotIcon: { fontSize: 24 },
  ingredientRightInfo: { flex: 1 },
  ingredientHeaderRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  ingredientFantasyName: { color: '#FFD700', fontSize: 13, fontWeight: 'bold' },
  originalBadge: { backgroundColor: '#1F1A33', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4, borderWidth: 0.8, borderColor: '#4E4870' },
  originalBadgeText: { color: '#A29BFE', fontSize: 10, fontWeight: '600' },
  ingredientEffectBody: { color: '#DDD', fontSize: 11, lineHeight: 16 },
  overallScienceBox: { backgroundColor: '#161F38', borderRadius: 12, padding: 12, borderWidth: 1.2, borderColor: '#4A69BD', marginTop: 4 },
  overallScienceTitle: { color: '#686DE0', fontSize: 12, fontWeight: 'bold', marginBottom: 6 },
  overallScienceBody: { color: '#DFF9FB', fontSize: 11, lineHeight: 17 },
  advisorFloatingTooltip: { position: 'absolute', bottom: 60, left: 12, right: 12, backgroundColor: '#2E1E4D', borderRadius: 14, padding: 12, borderWidth: 1.5, borderColor: '#E056FD', zIndex: 40 },
  advisorSpeaker: { color: '#E056FD', fontSize: 12, fontWeight: 'bold', marginBottom: 2 },
  advisorSayText: { color: '#FFF', fontSize: 12, fontStyle: 'italic', lineHeight: 16 },
  bottomActionBar: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#1B172C', borderTopWidth: 1, borderTopColor: '#2F2B4A' },
  ovalAdvisorBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#352D54', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#E056FD' },
  ovalAdvisorText: { color: '#E056FD', fontSize: 16, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
  flipActionBtn: { paddingHorizontal: 16, height: 40, borderRadius: 20, backgroundColor: '#6C5CE7', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#A29BFE' },
  flipActionBtnActive: { backgroundColor: '#2F2B4A', borderColor: '#6C5CE7' },
  flipActionBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
});