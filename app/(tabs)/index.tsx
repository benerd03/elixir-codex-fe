// app/(tabs)/index.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
  Image,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MOCK_MATERIALS, MOCK_ELIXIRS } from '../../src/mockData';
import QuestModal from '../../src/components/QuestModal';
import AttendanceModal from '../../src/components/AttendanceModal';
import OcrVerifyModal from '../../src/components/OcrVerifyModal';

const INITIAL_TODAY_SUPPLEMENTS = [
  { id: 's1', name: '비타민 C & 글루타치온 복합제', time: '오전 08:30 인증', photoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200' },
  { id: 's2', name: '저분자 콜라겐 젤리', time: '오후 12:40 인증', photoUrl: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=200' },
];

export default function HomeScreen() {
  const [questOpen, setQuestOpen] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [ocrOpen, setOcrOpen] = useState(false);

  // 연성 흐름 상태
  const [brewModalOpen, setBrewModalOpen] = useState(false);
  const [lowerTab, setLowerTab] = useState<'supplements' | 'materials'>('supplements');
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [todaySupplements, setTodaySupplements] = useState(INITIAL_TODAY_SUPPLEMENTS);
  const [isBrewing, setIsBrewing] = useState(false);
  const [resultElixir, setResultElixir] = useState<any>(null);
  const [showAdvisor, setShowAdvisor] = useState(false);

  const toggleMaterial = (id: string) => {
    if (selectedMaterials.includes(id)) {
      setSelectedMaterials(selectedMaterials.filter((mId) => mId !== id));
    } else {
      setSelectedMaterials([...selectedMaterials, id]);
    }
  };

  const handleConfirmBrew = () => {
    setBrewModalOpen(false);
    setIsBrewing(true);

    setTimeout(() => {
      setIsBrewing(false);
      setResultElixir(MOCK_ELIXIRS[0]); // 1번 '탱글한 백옥 엘릭서' 결과 노출
      setSelectedMaterials([]);
    }, 2500);
  };

  const handleSaveToCodex = () => {
    Alert.alert('📖 도감 등록', `'${resultElixir?.name}'이(가) 비약 도감에 보관되었습니다!`);
    setResultElixir(null);
    setShowAdvisor(false);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* 1. 메인 가마솥 풀 배경 */}
      <ImageBackground
        source={require('../../assets/images/bg_home_cauldron.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* 우측 상단 메뉴 */}
        <View style={styles.topRightHeader}>
          <TouchableOpacity onPress={() => Alert.alert('메뉴', '시스템 설정 메뉴입니다.')} activeOpacity={0.8}>
            <Image source={require('../../assets/images/btn_menu.png')} style={styles.menuIconImg} />
          </TouchableOpacity>
        </View>

        {/* 우측 사이드 플로팅 바 */}
        <View style={styles.sideMenuContainer}>
          <TouchableOpacity style={styles.sideBtnItem} onPress={() => setQuestOpen(true)} activeOpacity={0.8}>
            <Image source={require('../../assets/images/icon_quest.png')} style={styles.sideIconImg} />
            <Text style={styles.sideBtnLabel}>일일퀘스트</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sideBtnItem} onPress={() => setAttendanceOpen(true)} activeOpacity={0.8}>
            <Image source={require('../../assets/images/icon_attendance.png')} style={styles.sideIconImg} />
            <Text style={styles.sideBtnLabel}>출석체크</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sideBtnItem} onPress={() => setOcrOpen(true)} activeOpacity={0.8}>
            <Image source={require('../../assets/images/icon_register.png')} style={styles.sideIconImg} />
            <Text style={styles.sideBtnLabel}>영양제등록</Text>
          </TouchableOpacity>
        </View>

        {/* 우측 하단 연성 버튼들 */}
        <View style={styles.bottomRightActionArea}>
          <TouchableOpacity onPress={() => Alert.alert('나의 엘릭서', '내가 보유한 엘릭서 목록입니다.')} activeOpacity={0.8}>
            <Image source={require('../../assets/images/btn_my_elixir.png')} style={styles.actionBtnImg} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setBrewModalOpen(true)} activeOpacity={0.8}>
            <Image source={require('../../assets/images/btn_brew.png')} style={styles.actionBtnImg} />
          </TouchableOpacity>
        </View>
      </ImageBackground>

      {/* 2. 연성 재료 투입 챔버 모달 */}
      <Modal visible={brewModalOpen} transparent animationType="slide">
        <View style={styles.brewModalOverlay}>
          <View style={styles.brewModalContainer}>
            <TouchableOpacity style={styles.modalCloseIcon} onPress={() => setBrewModalOpen(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>

            <View style={styles.topFlaskBox}>
              <Text style={styles.boxLabel}>연성 챔버</Text>
              <View style={styles.flaskVisual}>
                <Text style={styles.flaskIcon}>🧪</Text>
                <Text style={styles.flaskStatusText}>
                  {selectedMaterials.length > 0
                    ? `재료 ${selectedMaterials.length}개 + 영양제 ${todaySupplements.length}개 조합 중`
                    : '하단에서 추가할 재료 카드를 선택하세요'}
                </Text>
              </View>
              <TouchableOpacity style={styles.confirmSmallBtn} onPress={handleConfirmBrew}>
                <Text style={styles.confirmBtnText}>연성 확정 ➔</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bottomInventoryBox}>
              <View style={styles.subTabContainer}>
                <TouchableOpacity
                  style={[styles.subTabBtn, lowerTab === 'supplements' && styles.activeSubTab]}
                  onPress={() => setLowerTab('supplements')}
                >
                  <Text style={[styles.subTabText, lowerTab === 'supplements' && styles.activeSubTabText]}>
                    💊 오늘 인증 ({todaySupplements.length})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.subTabBtn, lowerTab === 'materials' && styles.activeSubTab]}
                  onPress={() => setLowerTab('materials')}
                >
                  <Text style={[styles.subTabText, lowerTab === 'materials' && styles.activeSubTabText]}>
                    🌿 재료 카드
                  </Text>
                </TouchableOpacity>
              </View>

              {lowerTab === 'supplements' ? (
                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                  {todaySupplements.map((item) => (
                    <View key={item.id} style={styles.suppItemRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.suppName}>{item.name}</Text>
                        <Text style={styles.suppTime}>✓ {item.time}</Text>
                      </View>
                      <Image source={{ uri: item.photoUrl }} style={styles.suppThumb} />
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <ScrollView contentContainerStyle={styles.matGrid} showsVerticalScrollIndicator={false}>
                  {MOCK_MATERIALS.map((mat) => {
                    const isSelected = selectedMaterials.includes(mat.id);
                    return (
                      <TouchableOpacity
                        key={mat.id}
                        style={[styles.matCard, isSelected && styles.matCardSelected]}
                        onPress={() => toggleMaterial(mat.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.matGradeBadge}>{mat.grade.substring(0, 1)}</Text>
                        <Text style={styles.matIcon}>{mat.icon}</Text>
                        <Text style={styles.matName} numberOfLines={1}>{mat.name}</Text>
                        <Text style={styles.matCountText}>x{mat.count}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* 3. 연성 로딩 모달 */}
      <Modal visible={isBrewing} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#E056FD" />
          <Text style={styles.loadingText}>가마솥에서 연금술이 일어나는 중...</Text>
        </View>
      </Modal>

      {/* 4. 🎴 [연성 결과 대형 카드 팝업] */}
      <Modal visible={!!resultElixir} transparent animationType="slide">
        <View style={styles.resultModalOverlay}>
          <View style={styles.fullscreenCardWrapper}>
            {resultElixir && (
              <View style={styles.hugeCardContainer}>
                
                {/* 세로 드래그 스크롤 영역 */}
                <ScrollView
                  style={styles.cardScrollView}
                  contentContainerStyle={styles.cardScrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  {/* 등급 & 테마 */}
                  <View style={styles.cardTopHeader}>
                    <View style={styles.cardGradeTag}>
                      <Text style={styles.cardGradeText}>[{resultElixir.grade}]</Text>
                    </View>
                    <Text style={styles.cardThemeText}>{resultElixir.themeCategory}</Text>
                  </View>

                  <Text style={styles.cardTitle}>{resultElixir.name}</Text>

                  {/* 440pt 대형 일러스트 프레임 */}
                  <View style={styles.largeArtFrame}>
                    <Image source={resultElixir.imageSource} style={styles.largePotionImage} resizeMode="cover" />
                  </View>

                  {/* 비약 스탯 */}
                  <View style={styles.cardStatsBox}>
                    <Text style={styles.sectionHeaderLabel}>비약 스탯</Text>
                    {Object.entries(resultElixir.stats).map(([statName, val]: [string, any]) => (
                      <View key={statName} style={styles.statGaugeRow}>
                        <Text style={styles.statGaugeLabel}>{statName}</Text>
                        <View style={styles.statGaugeTrack}>
                          <View style={[styles.statGaugeBar, { width: `${val}%` }]} />
                        </View>
                        <Text style={styles.statGaugeNum}>{val}</Text>
                      </View>
                    ))}
                  </View>

                  {/* 가마솥 연성 시너지 */}
                  <View style={styles.synergyCardBox}>
                    <Text style={styles.synergyTitle}>🏺 가마솥 연성 시너지</Text>
                    <Text style={styles.synergyContent}>{resultElixir.brewingLore}</Text>
                  </View>

                  {/* ▼ 아래로 드래그해야 보이는 영역 ▼ */}
                  <View style={styles.coreSectionBox}>
                    <Text style={styles.sectionHeaderLabel}>핵심 성분</Text>
                    <Text style={styles.coreIngredientsText}>{resultElixir.supplementSummary}</Text>
                  </View>

                  <View style={styles.materialsSectionBox}>
                    <Text style={styles.sectionHeaderLabel}>투입 재료</Text>
                    <Text style={styles.ingredientSummaryText}>{resultElixir.ingredientSummary}</Text>
                  </View>

                  <View style={{ height: 20 }} />
                </ScrollView>

                {/* 늘해랑 조언 말풍선 */}
                {showAdvisor && (
                  <View style={styles.advisorFloatingTooltip}>
                    <Text style={styles.advisorSpeaker}>늘해랑</Text>
                    <Text style={styles.advisorSayText}>"{resultElixir.adviserComment}"</Text>
                  </View>
                )}

                {/* 하단 독립 액션 바 */}
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
                    style={styles.ovalSaveBtn}
                    onPress={handleSaveToCodex}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.ovalSaveText}>저장</Text>
                  </TouchableOpacity>
                </View>

              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* 사이드 모달 3종 */}
      <QuestModal visible={questOpen} onClose={() => setQuestOpen(false)} />
      <AttendanceModal visible={attendanceOpen} onClose={() => setAttendanceOpen(false)} />
      <OcrVerifyModal visible={ocrOpen} onClose={() => setOcrOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#130E1F' },
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  topRightHeader: { position: 'absolute', top: 44, right: 16, zIndex: 20 },
  menuIconImg: { width: 44, height: 44, resizeMode: 'contain' },
  sideMenuContainer: { position: 'absolute', top: 110, right: 14, backgroundColor: 'rgba(28, 20, 42, 0.85)', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 8, borderWidth: 1.5, borderColor: '#6C5CE7', alignItems: 'center', gap: 14, zIndex: 15 },
  sideBtnItem: { alignItems: 'center' },
  sideIconImg: { width: 38, height: 38, resizeMode: 'contain', marginBottom: 4 },
  sideBtnLabel: { color: '#DDD', fontSize: 10, fontWeight: 'bold' },
  bottomRightActionArea: { position: 'absolute', bottom: 24, right: 16, gap: 8, zIndex: 15 },
  actionBtnImg: { width: 120, height: 38, resizeMode: 'contain' },

  // 연성 챔버 모달
  brewModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  brewModalContainer: { width: '92%', height: '82%', backgroundColor: '#242038', borderRadius: 20, padding: 16, borderWidth: 1.5, borderColor: '#6C5CE7' },
  modalCloseIcon: { position: 'absolute', top: 12, right: 14, zIndex: 10, padding: 6 },
  modalCloseText: { color: '#AAA', fontSize: 18, fontWeight: 'bold' },
  topFlaskBox: { flex: 0.42, backgroundColor: '#1B1728', borderRadius: 14, padding: 12, justifyContent: 'space-between', marginBottom: 12 },
  boxLabel: { color: '#8A879E', fontSize: 11, fontWeight: 'bold' },
  flaskVisual: { alignItems: 'center', justifyContent: 'center' },
  flaskIcon: { fontSize: 40, marginBottom: 4 },
  flaskStatusText: { color: '#DDD', fontSize: 12, textAlign: 'center' },
  confirmSmallBtn: { alignSelf: 'flex-end', backgroundColor: '#E056FD', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  confirmBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  bottomInventoryBox: { flex: 0.58, backgroundColor: '#2C2746', borderRadius: 14, padding: 12 },
  subTabContainer: { flexDirection: 'row', backgroundColor: '#1B1728', borderRadius: 8, padding: 3, marginBottom: 10 },
  subTabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  activeSubTab: { backgroundColor: '#6C5CE7' },
  subTabText: { color: '#8A879E', fontSize: 11, fontWeight: '600' },
  activeSubTabText: { color: '#FFF', fontWeight: 'bold' },
  suppItemRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1B1728', padding: 10, borderRadius: 10, marginBottom: 8 },
  suppName: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  suppTime: { color: '#2ECC71', fontSize: 11, marginTop: 2 },
  suppThumb: { width: 40, height: 40, borderRadius: 8 },
  matGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  matCard: { width: '31%', backgroundColor: '#1B1728', borderRadius: 10, padding: 8, alignItems: 'center', borderWidth: 1, borderColor: '#3E3960' },
  matCardSelected: { borderColor: '#E056FD', backgroundColor: '#3E244D' },
  matGradeBadge: { position: 'absolute', top: 4, left: 4, color: '#FFD700', fontSize: 9, fontWeight: 'bold' },
  matIcon: { fontSize: 22, marginVertical: 3 },
  matName: { color: '#FFF', fontSize: 10, textAlign: 'center' },
  matCountText: { color: '#FFD700', fontSize: 10, fontWeight: 'bold', marginTop: 2 },

  loadingOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#E056FD', marginTop: 16, fontSize: 16, fontWeight: 'bold' },

  // 결과 카드 팝업
  resultModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center' },
  fullscreenCardWrapper: { width: '92%', height: '90%', justifyContent: 'center', alignItems: 'center' },
  hugeCardContainer: { width: '100%', height: '100%', backgroundColor: '#201C34', borderRadius: 22, borderWidth: 2.2, borderColor: '#F0932B', overflow: 'hidden' },
  cardScrollView: { flex: 1 },
  cardScrollContent: { padding: 14 },
  cardTopHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardGradeTag: { backgroundColor: '#F0932B', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  cardGradeText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  cardThemeText: { color: '#A29BFE', fontSize: 12, fontWeight: '700' },
  cardTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  largeArtFrame: { width: '100%', height: 440, borderRadius: 16, overflow: 'hidden', backgroundColor: '#141222', borderWidth: 1.5, borderColor: '#3E3960', marginBottom: 14 },
  largePotionImage: { width: '100%', height: '100%' },
  sectionHeaderLabel: { color: '#E056FD', fontSize: 11, fontWeight: 'bold', marginBottom: 6 },
  cardStatsBox: { backgroundColor: '#161326', borderRadius: 10, padding: 10, marginBottom: 10 },
  statGaugeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  statGaugeLabel: { width: 80, color: '#CCC', fontSize: 11, fontWeight: '600' },
  statGaugeTrack: { flex: 1, height: 12, backgroundColor: '#2E2B44', borderRadius: 6, overflow: 'hidden' },
  statGaugeBar: { height: '100%', backgroundColor: '#F0932B', borderRadius: 6 },
  statGaugeNum: { width: 28, textAlign: 'right', color: '#FFD700', fontSize: 11, fontWeight: 'bold' },
  synergyCardBox: { backgroundColor: '#161326', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#F0932B', marginBottom: 10 },
  synergyTitle: { color: '#F0932B', fontSize: 11, fontWeight: 'bold', marginBottom: 4 },
  synergyContent: { color: '#EEE', fontSize: 11, lineHeight: 16 },
  coreSectionBox: { backgroundColor: '#161326', borderRadius: 10, padding: 10, marginBottom: 10 },
  coreIngredientsText: { color: '#EEE', fontSize: 11, lineHeight: 16 },
  materialsSectionBox: { backgroundColor: '#161326', borderRadius: 10, padding: 10, marginBottom: 10 },
  ingredientSummaryText: { color: '#DDD', fontSize: 11 },
  advisorFloatingTooltip: { position: 'absolute', bottom: 60, left: 12, right: 12, backgroundColor: '#2E1E4D', borderRadius: 14, padding: 12, borderWidth: 1.5, borderColor: '#E056FD', zIndex: 40 },
  advisorSpeaker: { color: '#E056FD', fontSize: 12, fontWeight: 'bold', marginBottom: 2 },
  advisorSayText: { color: '#FFF', fontSize: 12, fontStyle: 'italic', lineHeight: 16 },
  bottomActionBar: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#1B172C', borderTopWidth: 1, borderTopColor: '#2F2B4A' },
  ovalAdvisorBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#352D54', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#E056FD' },
  ovalAdvisorText: { color: '#E056FD', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  ovalSaveBtn: { width: 54, height: 40, borderRadius: 20, backgroundColor: '#6C5CE7', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#A29BFE' },
  ovalSaveText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
});