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
  ImageBackground,
} from 'react-native';
import { ElixirCardData } from '../mockData';

// 🎨 디자이너 에셋 불러오기
const CARD_FRAME_BG = require('../../assets/images/card_frame.png');
const CORE_ING_BG = require('../../assets/images/core_ingredient.png');
const CORE_ING_ICON = require('../../assets/images/core_ingredient_icon.png');
const INPUT_MAT_BG = require('../../assets/images/input_materials_section.png');
const INPUT_MAT_ICON = require('../../assets/images/input_materials_icon.png');
const SOFT_SYN_BG = require('../../assets/images/soft_synergy.png');
const SOFT_SYN_ICON = require('../../assets/images/soft_synergy_icon.png');
const ITEM_BOX_BG = require('../../assets/images/input_materials_item_box.png');

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

  // 등급별 컬러
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'Prismatic':
        return '#E056FD';
      case 'Epic':
        return '#F0932B';
      case 'Rare':
        return '#686DE0';
      default:
        return '#95AFC0';
    }
  };

  const gradeColor = getGradeColor(elixir.grade);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.fullscreenCardWrapper}>
          {/* 🎴 카드 외곽 전체 프레임 (Card Frame) */}
          <ImageBackground
            source={CARD_FRAME_BG}
            style={[styles.hugeCardContainer, { borderColor: gradeColor }]}
            imageStyle={styles.cardFrameBgImg}
          >
            {/* ✕ 닫기 버튼 */}
            <TouchableOpacity style={styles.modalCloseIcon} onPress={handleCloseModal}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>

            {!isFlipped ? (
              /* ═════════════════════════════════════════════════════════
                 🎴 앞면: 기본 정보, 투입 재료, 로어, 스탯
                 ═════════════════════════════════════════════════════════ */
              <ScrollView
                style={styles.cardScrollView}
                contentContainerStyle={styles.scrollInnerContent}
                showsVerticalScrollIndicator={false}
              >
                {/* 1. 상단 등급 & 카테고리 & 시리얼 넘버 */}
                <View style={styles.headerInfoRow}>
                  <View style={[styles.gradeBadge, { backgroundColor: gradeColor }]}>
                    <Text style={styles.gradeBadgeText}>{elixir.grade.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.themeCategoryText}>[{elixir.themeCategory}]</Text>
                  {elixir.serialNumber ? (
                    <Text style={styles.serialNumberText}>No.{elixir.serialNumber}</Text>
                  ) : null}
                </View>

                {/* 2. 엘릭서 타이틀 */}
                <Text style={styles.elixirNameText}>{elixir.name}</Text>

                {/* 3. 메인 포션 일러스트 */}
                <View style={styles.illustrationFrame}>
                  {elixir.imageSource ? (
                    <Image
                      source={elixir.imageSource}
                      style={styles.potionMainImg}
                      resizeMode="contain"
                    />
                  ) : elixir.imageUrl ? (
                    <Image
                      source={{ uri: elixir.imageUrl }}
                      style={styles.potionMainImg}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={{ fontSize: 50 }}>🧪</Text>
                  )}
                </View>

                {/* 4. [섹션 1] 투입 영양제 / 핵심 성분 (Core Ingredient) */}
                <ImageBackground
                  source={CORE_ING_BG}
                  style={styles.sectionAssetBox}
                  imageStyle={styles.sectionAssetImg}
                >
                  <View style={styles.sectionHeaderRow}>
                    <Image source={CORE_ING_ICON} style={styles.sectionIcon} resizeMode="contain" />
                    <Text style={styles.sectionTitleText}>섭취한 영양제 및 보조식품</Text>
                  </View>
                  <Text style={styles.sectionBodyText}>
                    {elixir.supplementSummary || '기본 정제수 베이스'}
                  </Text>
                </ImageBackground>

                {/* 5. [섹션 2] 투입된 비전 재료 (Input Materials) */}
                <ImageBackground
                  source={INPUT_MAT_BG}
                  style={styles.sectionAssetBox}
                  imageStyle={styles.sectionAssetImg}
                >
                  <View style={styles.sectionHeaderRow}>
                    <Image source={INPUT_MAT_ICON} style={styles.sectionIcon} resizeMode="contain" />
                    <Text style={styles.sectionTitleText}>투입된 마법 재료</Text>
                  </View>
                  <Text style={styles.sectionBodyText}>
                    {elixir.ingredientSummary || '순수 영양 농축액'}
                  </Text>
                </ImageBackground>

                {/* 6. 연성 로어 및 발현 설명 */}
                <View style={styles.loreBox}>
                  <Text style={styles.loreTitle}>📖 연금술 발현 기록</Text>
                  <Text style={styles.loreBody}>{elixir.brewingLore}</Text>
                </View>

                {/* 7. 수치형 3대 잠재력 스탯 */}
                {elixir.stats && (
                  <View style={styles.statsPanel}>
                    <Text style={styles.statsPanelTitle}>✨ 비약 잠재력 스탯</Text>
                    <View style={styles.statsGrid}>
                      {Object.entries(elixir.stats).map(([statKey, statVal]) => (
                        <View key={statKey} style={styles.statRow}>
                          <Text style={styles.statNameLabel}>{statKey}</Text>
                          <View style={styles.statGaugeTrack}>
                            <View
                              style={[
                                styles.statGaugeFill,
                                {
                                  width: `${Math.min(statVal, 100)}%`,
                                  backgroundColor: gradeColor,
                                },
                              ]}
                            />
                          </View>
                          <Text style={styles.statValueNumber}>{statVal}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </ScrollView>
            ) : (
              /* ═════════════════════════════════════════════════════════
                 🧪 뒷면: 성분별 과학적 효능 분석 & 종합 시너지
                 ═════════════════════════════════════════════════════════ */
              <ScrollView
                style={styles.cardScrollView}
                contentContainerStyle={styles.scrollInnerContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.backHeaderBar}>
                  <Text style={styles.backHeaderTitle}>🧪 연금술 과학 분석표 (뒷면)</Text>
                  <Text style={styles.backHeaderSub}>
                    {elixir.name}에 깃든 영양학적 기전입니다.
                  </Text>
                </View>

                {/* 1. 성분별 과학 효능 리스트 */}
                <View style={styles.scienceListSection}>
                  <Text style={styles.scienceSectionTitle}>🔬 투입 성분별 기전 분석</Text>
                  {elixir.ingredientScienceList && elixir.ingredientScienceList.length > 0 ? (
                    elixir.ingredientScienceList.map((ing, idx) => (
                      <ImageBackground
                        key={idx}
                        source={ITEM_BOX_BG}
                        style={styles.scienceItemCard}
                        imageStyle={styles.itemBoxBgImg}
                      >
                        <View style={styles.scienceItemHeader}>
                          <Text style={styles.scienceItemIcon}>{ing.icon}</Text>
                          <View style={styles.scienceItemTitles}>
                            <Text style={styles.scienceItemFantasyName}>{ing.name}</Text>
                            <Text style={styles.scienceItemRealName}>({ing.original})</Text>
                          </View>
                        </View>
                        <Text style={styles.scienceItemEffectText}>{ing.effect}</Text>
                      </ImageBackground>
                    ))
                  ) : (
                    <View style={styles.emptyScienceBox}>
                      <Text style={styles.emptyScienceText}>
                        등록된 영양소와 재료의 상호 보완 작용이 활발하게 일어납니다.
                      </Text>
                    </View>
                  )}
                </View>

                {/* 2. 종합 성분 시너지 효과 (Soft synergy) */}
                <ImageBackground
                  source={SOFT_SYN_BG}
                  style={styles.synergyAssetSection}
                  imageStyle={styles.synergyAssetImg}
                >
                  <View style={styles.synergyHeaderRow}>
                    <Image source={SOFT_SYN_ICON} style={styles.sectionIcon} resizeMode="contain" />
                    <Text style={styles.synergyTitleText}>종합 성분 시너지 효과 (Synergy)</Text>
                  </View>
                  <Text style={styles.synergyBodyText}>
                    {elixir.scienceDesc ||
                      '투입된 영양소들의 생체 이용률이 상승하여 체내 흡수 및 작용을 극대화합니다.'}
                  </Text>
                </ImageBackground>
              </ScrollView>
            )}

            {/* 💬 늘해랑 조언 말풍선 (툴팁 토글) */}
            {showAdvisor && (
              <View style={styles.advisorFloatingTooltip}>
                <Text style={styles.advisorSpeaker}>연금술사 늘해랑의 한마디:</Text>
                <Text style={styles.advisorSayText}>"{elixir.adviserComment}"</Text>
              </View>
            )}

            {/* 🌟 하단 고정 액션 바 */}
            <View style={styles.bottomActionBar}>
              {!isFlipped ? (
                <>
                  <TouchableOpacity
                    style={styles.ovalAdvisorBtn}
                    onPress={() => setShowAdvisor((prev) => !prev)}
                  >
                    <Text style={styles.ovalAdvisorText}>{showAdvisor ? '✕' : '🧙'}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.flipActionButton, { backgroundColor: gradeColor }]}
                    onPress={() => {
                      setShowAdvisor(false);
                      setIsFlipped(true);
                    }}
                  >
                    <Text style={styles.flipActionBtnText}>🔄 과학 분석표(뒷면) 보기</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={[styles.flipActionButton, { backgroundColor: '#4C2870', width: '100%' }]}
                  onPress={() => setIsFlipped(false)}
                >
                  <Text style={styles.flipActionBtnText}>🔄 카드 앞면 보기</Text>
                </TouchableOpacity>
              )}
            </View>
          </ImageBackground>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 3, 10, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  fullscreenCardWrapper: {
    width: '94%',
    maxWidth: 480,
    height: '92%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 🎴 전체 카드 프레임
  hugeCardContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1A1329',
    borderRadius: 22,
    borderWidth: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  cardFrameBgImg: {
    resizeMode: 'cover',
    borderRadius: 22,
    opacity: 0.18,
  },
  modalCloseIcon: {
    position: 'absolute',
    top: 10,
    right: 12,
    zIndex: 50,
    backgroundColor: '#2A1C3F',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  modalCloseText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },

  cardScrollView: {
    flex: 1,
  },
  scrollInnerContent: {
    padding: 16,
    paddingBottom: 72,
  },

  // 🏷️ 상단 정보
  headerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  gradeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  gradeBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  themeCategoryText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
  serialNumberText: {
    color: '#8A7A9E',
    fontSize: 11,
    marginLeft: 'auto',
    marginRight: 28,
  },
  elixirNameText: {
    color: '#FFF',
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  // 🖼️ 포션 일러스트 프레임
  illustrationFrame: {
    width: '100%',
    height: 400,
    backgroundColor: '#120C1F',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#3D2D56',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  potionMainImg: {
    width: '100%',
    height: '170%',
  },

  // 📦 개별 섹션 박스 (Core / Input 에셋 적용)
  sectionAssetBox: {
    width: '100%',
    backgroundColor: '#1F1730',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#43315C',
    padding: 11,
    marginBottom: 8,
    overflow: 'hidden',
  },
  sectionAssetImg: {
    resizeMode: 'stretch',
    opacity: 0.22,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sectionIcon: {
    width: 15,
    height: 15,
  },
  sectionTitleText: {
    color: '#FFD700',
    fontSize: 11.5,
    fontWeight: 'bold',
  },
  sectionBodyText: {
    color: '#DDD',
    fontSize: 12,
    lineHeight: 16,
  },

  // 📖 로어 박스
  loreBox: {
    backgroundColor: '#171124',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#36264F',
    padding: 11,
    marginBottom: 10,
  },
  loreTitle: {
    color: '#C5A059',
    fontSize: 11.5,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  loreBody: {
    color: '#DDD',
    fontSize: 11.5,
    lineHeight: 16.5,
  },

  // 📊 스탯 패널
  statsPanel: {
    backgroundColor: '#140D20',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2F2046',
    padding: 12,
  },
  statsPanelTitle: {
    color: '#DDD',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statsGrid: {
    gap: 7,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statNameLabel: {
    color: '#AAA',
    fontSize: 11,
    width: 75,
  },
  statGaugeTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#271B3D',
    borderRadius: 3,
    overflow: 'hidden',
  },
  statGaugeFill: {
    height: '100%',
    borderRadius: 3,
  },
  statValueNumber: {
    color: '#FFF',
    fontSize: 11.5,
    fontWeight: 'bold',
    width: 25,
    textAlign: 'right',
  },

  // 🧪 뒷면 스타일
  backHeaderBar: {
    marginBottom: 12,
  },
  backHeaderTitle: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backHeaderSub: {
    color: '#8A7A9E',
    fontSize: 11,
    marginTop: 2,
  },
  scienceListSection: {
    marginBottom: 12,
  },
  scienceSectionTitle: {
    color: '#DDD',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  scienceItemCard: {
    backgroundColor: '#1C152B',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3D2C56',
    padding: 10,
    marginBottom: 8,
    overflow: 'hidden',
  },
  itemBoxBgImg: {
    resizeMode: 'stretch',
    opacity: 0.18,
  },
  scienceItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  scienceItemIcon: {
    fontSize: 18,
  },
  scienceItemTitles: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scienceItemFantasyName: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scienceItemRealName: {
    color: '#A29BFE',
    fontSize: 11,
  },
  scienceItemEffectText: {
    color: '#CCC',
    fontSize: 11,
    lineHeight: 15,
  },
  emptyScienceBox: {
    backgroundColor: '#191226',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  emptyScienceText: {
    color: '#8A7A9E',
    fontSize: 11.5,
    textAlign: 'center',
  },

  // ⚡ 뒷면 시너지 박스
  synergyAssetSection: {
    backgroundColor: '#1D1430',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4A3366',
    padding: 12,
    overflow: 'hidden',
  },
  synergyAssetImg: {
    resizeMode: 'stretch',
    opacity: 0.22,
  },
  synergyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  synergyTitleText: {
    color: '#E056FD',
    fontSize: 12,
    fontWeight: 'bold',
  },
  synergyBodyText: {
    color: '#E2D9F3',
    fontSize: 11.5,
    lineHeight: 16.5,
  },

  // 💬 늘해랑 조언 툴팁
  advisorFloatingTooltip: {
    position: 'absolute',
    bottom: 64,
    left: 14,
    right: 14,
    backgroundColor: '#2B1444',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.2,
    borderColor: '#E056FD',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
  },
  advisorSpeaker: {
    color: '#E056FD',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  advisorSayText: {
    color: '#FFF',
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 16,
  },

  // 🌟 하단 액션 바
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#130E1F',
    borderTopWidth: 1,
    borderTopColor: '#2C1D42',
    gap: 8,
    alignItems: 'center',
  },
  ovalAdvisorBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#291C3E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: '#E056FD',
  },
  ovalAdvisorText: {
    fontSize: 16,
    color: '#FFF',
  },
  flipActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipActionBtnText: {
    color: '#FFF',
    fontSize: 12.5,
    fontWeight: 'bold',
  },
});