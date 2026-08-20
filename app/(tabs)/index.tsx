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
import { MOCK_MATERIALS, MOCK_ELIXIRS, ElixirCardData } from '../../src/mockData';
import { getMaterialImage } from '../../constants/materialImages';
import ElixirDetailModal from '../../src/components/ElixirDetailModal';

// 💊 오늘 인증된 영양제 초기 데이터 (당일 자정 리셋 대상)
const INITIAL_TODAY_SUPPLEMENTS = [
  {
    id: 's1',
    name: '비타민 C & 글루타치온 복합제',
    time: '오전 08:30 인증',
    photoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200',
  },
  {
    id: 's2',
    name: '저분자 콜라겐 젤리',
    time: '오후 12:40 인증',
    photoUrl: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=200',
  },
];

export default function HomeScreen() {
  // 1. 사이드 메뉴 모달 상태
  const [questOpen, setQuestOpen] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [ocrOpen, setOcrOpen] = useState(false);
  const [attendanceChecked, setAttendanceChecked] = useState(false);

  // 2. 가마솥 연성 챔버 모달 상태 (home_brew.png 클릭 시 열림)
  const [brewModalOpen, setBrewModalOpen] = useState(false);
  const [lowerTab, setLowerTab] = useState<'supplements' | 'materials'>('supplements');
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [todaySupplements] = useState(INITIAL_TODAY_SUPPLEMENTS);

  // 3. 연성 중 로딩 및 결과 모달 상태
  const [isBrewing, setIsBrewing] = useState(false);
  const [resultElixir, setResultElixir] = useState<ElixirCardData | null>(null);

  // 재료 선택 토글 (0개 선택도 가능)
  const toggleMaterial = (id: string) => {
    if (selectedMaterials.includes(id)) {
      setSelectedMaterials(selectedMaterials.filter((mId) => mId !== id));
    } else {
      setSelectedMaterials([...selectedMaterials, id]);
    }
  };

  // 🔥 연성 확정하기 실행
  const handleConfirmBrew = () => {
    setBrewModalOpen(false); // 연성창 닫기
    setIsBrewing(true);      // 2.2초 마법 연출

    setTimeout(() => {
      setIsBrewing(false);

      // 재료 개수와 등급에 따른 가중치 산정
      const matCount = selectedMaterials.length;
      let calculatedGrade: 'Common' | 'Rare' | 'Epic' | 'Prismatic' = 'Common';
      const roll = Math.random() * 100;

      if (matCount >= 3) {
        if (roll < 20) calculatedGrade = 'Prismatic';
        else if (roll < 65) calculatedGrade = 'Epic';
        else calculatedGrade = 'Rare';
      } else if (matCount >= 1) {
        if (roll < 10) calculatedGrade = 'Prismatic';
        else if (roll < 50) calculatedGrade = 'Epic';
        else if (roll < 85) calculatedGrade = 'Rare';
        else calculatedGrade = 'Common';
      } else {
        // 재료 0개 투입 시
        if (roll < 5) calculatedGrade = 'Epic';
        else if (roll < 45) calculatedGrade = 'Rare';
        else calculatedGrade = 'Common';
      }

      // 기본 엘릭서 선택 후 스탯 및 등급 반영
      const baseElixir = MOCK_ELIXIRS[0];
      const bonus = matCount * 3 + (calculatedGrade === 'Prismatic' ? 12 : calculatedGrade === 'Epic' ? 8 : 4);

      const generatedElixir: ElixirCardData = {
        ...baseElixir,
        grade: calculatedGrade,
        isUnlocked: true,
        stats: {
          '피부 투명도': Math.min(99, 78 + bonus + Math.floor(Math.random() * 6)),
          '장벽 결속력': Math.min(99, 76 + bonus + Math.floor(Math.random() * 5)),
          '항산화 방어': Math.min(99, 75 + bonus + Math.floor(Math.random() * 7)),
        },
        supplementSummary:
          todaySupplements.length > 0
            ? todaySupplements.map((s) => s.name).join(' + ')
            : '정제 마력수 베이스',
        ingredientSummary:
          selectedMaterials.length > 0
            ? `${selectedMaterials.length}종의 마법 재료`
            : '순수 영양 농축액',
        brewingLore: `가마솥에서 은백색 마력이 솟구치며 ${calculatedGrade} 등급의 비약이 연성되었습니다!`,
      };

      setResultElixir(generatedElixir);
      setSelectedMaterials([]);
    }, 2200);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.contentWrapper}>
        {/* 🏠 홈 메인 배경화면 (가마솥 방) */}
        <ImageBackground
          source={require('../../assets/images/bg_home_cauldron.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          {/* 1. 우측 상단 메뉴 버튼 */}
          <View style={styles.topRightHeader}>
            <TouchableOpacity onPress={() => Alert.alert('메뉴', '시스템 설정')} activeOpacity={0.8}>
              <Image source={require('../../assets/images/home_menu.png')} style={styles.menuIconImg} />
            </TouchableOpacity>
          </View>

          {/* 2. 우측 사이드 플로팅 바 (일일퀘스트, 출석체크, 영양제등록) */}
          <ImageBackground
            source={require('../../assets/images/home_slidebar.png')}
            style={styles.sideMenuContainer}
            resizeMode="stretch"
          >
            <TouchableOpacity style={styles.sideBtnItem} onPress={() => setQuestOpen(true)} activeOpacity={0.8}>
              <Image source={require('../../assets/images/home_slidebar_quest.png')} style={styles.sideIconImg} />
              <Text style={styles.sideBtnLabel}>일일퀘스트</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sideBtnItem} onPress={() => setAttendanceOpen(true)} activeOpacity={0.8}>
              <Image source={require('../../assets/images/home_slidebar_attendance.png')} style={styles.sideIconImg} />
              <Text style={styles.sideBtnLabel}>출석체크</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sideBtnItem} onPress={() => setOcrOpen(true)} activeOpacity={0.8}>
              <Image source={require('../../assets/images/home_slidebar_pill.png')} style={styles.sideIconImg} />
              <Text style={styles.sideBtnLabel}>영양제등록</Text>
            </TouchableOpacity>
          </ImageBackground>

          {/* 3. 우측 하단 나의 엘릭서 & 연성하기 버튼 */}
          <View style={styles.bottomRightActionArea}>
            <TouchableOpacity onPress={() => Alert.alert('나의 엘릭서', '보관된 엘릭서 목록')} activeOpacity={0.8}>
              <Image source={require('../../assets/images/home_myelixir.png')} style={styles.actionBtnImg} />
            </TouchableOpacity>

            {/* 🔥 연성하기 버튼 터치 시 연성 챔버 모달 오픈! */}
            <TouchableOpacity onPress={() => setBrewModalOpen(true)} activeOpacity={0.8}>
              <Image source={require('../../assets/images/home_brew.png')} style={styles.actionBtnImg} />
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>

      {/* ═════════════════════════════════════════════════════════
          🏺 연성 챔버 모달 (가마솥 연성창)
          ═════════════════════════════════════════════════════════ */}
      <Modal visible={brewModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.brewModalContainer}>
            {/* ✕ 닫기 버튼 */}
            <TouchableOpacity style={styles.modalCloseIcon} onPress={() => setBrewModalOpen(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>

            {/* 🏺 상단 가마솥 영역 (brew.png) */}
            <View style={styles.topFlaskBox}>
              <Text style={styles.boxLabel}>연성 챔버</Text>
              <View style={styles.flaskVisual}>
                <Image
                  source={require('../../assets/images/brew.png')}
                  style={styles.chamberCauldronImg}
                  resizeMode="contain"
                />

                {/* 💬 동적 안내 문구 (0개일 때 vs N개 추가 중) */}
                {selectedMaterials.length === 0 ? (
                  <Text style={styles.flaskStatusText}>추가할 재료를 선택하세요.</Text>
                ) : (
                  <Text style={styles.flaskStatusTextActive}>
                    재료 <Text style={styles.highlightCount}>{selectedMaterials.length}개</Text> 추가 중
                  </Text>
                )}
              </View>

              {/* 연성 확정 버튼 */}
              <TouchableOpacity
                style={styles.confirmSmallBtn}
                onPress={handleConfirmBrew}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmBtnText}>
                  🔥 {selectedMaterials.length > 0 ? `재료 ${selectedMaterials.length}개로 ` : ''}연성 확정 ➔
                </Text>
              </TouchableOpacity>
            </View>

            {/* 🔀 하단 2분할 탭 및 재료 인벤토리 */}
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
                    🎴 재료 카드 ({selectedMaterials.length}/{MOCK_MATERIALS.length})
                  </Text>
                </TouchableOpacity>
              </View>

              {lowerTab === 'supplements' ? (
                /* 1️⃣ 오늘 먹은 영양제 목록 (자정 리셋) */
                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                  {todaySupplements.length === 0 ? (
                    <View style={styles.emptySupplementBox}>
                      <Text style={styles.emptyTitle}>오늘 섭취한 건강식품을 등록해주세요!</Text>
                      <Text style={styles.emptySub}>
                        영양제를 인증하면 자정까지 가마솥의 기본 베이스로 자동 편입됩니다.
                      </Text>
                    </View>
                  ) : (
                    todaySupplements.map((item) => (
                      <View key={item.id} style={styles.suppItemRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.suppName}>{item.name}</Text>
                          <Text style={styles.suppTime}>✓ {item.time}</Text>
                        </View>
                        <Image source={{ uri: item.photoUrl }} style={styles.suppThumb} />
                      </View>
                    ))
                  )}
                </ScrollView>
              ) : (
                /* 2️⃣ 보유 재료 카드 선택 그리드 */
                <ScrollView contentContainerStyle={styles.matGrid} showsVerticalScrollIndicator={false}>
                  {MOCK_MATERIALS.map((mat) => {
                    const isSelected = selectedMaterials.includes(mat.id);
                    const matImg = getMaterialImage(mat.id);
                    return (
                      <TouchableOpacity
                        key={mat.id}
                        style={[styles.matCard, isSelected && styles.matCardSelected]}
                        onPress={() => toggleMaterial(mat.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.matGradeBadge}>{mat.grade.substring(0, 1)}</Text>
                        {matImg ? (
                          <Image source={matImg} style={styles.matCardIconImg} resizeMode="contain" />
                        ) : (
                          <Text style={styles.matIcon}>{mat.icon}</Text>
                        )}
                        <Text style={styles.matName} numberOfLines={1}>
                          {mat.name}
                        </Text>
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

      {/* ⏳ 연성 중 마법 로딩 오버레이 */}
      <Modal visible={isBrewing} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#E056FD" />
          <Text style={styles.loadingText}>가마솥에서 마력이 소용돌이치는 중...</Text>
        </View>
      </Modal>

      {/* 🎴 연성 결과 카드 모달 (ElixirDetailModal 완벽 연동) */}
      <ElixirDetailModal
        visible={!!resultElixir}
        elixir={resultElixir}
        onClose={() => setResultElixir(null)}
      />

      {/* 📜 사이드 팝업 1: 일일 퀘스트 모달 */}
      <Modal visible={questOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.popupModalCard}>
            <View style={styles.popupHeader}>
              <Text style={styles.popupTitle}>🎯 일일 퀘스트</Text>
              <TouchableOpacity onPress={() => setQuestOpen(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.questItem}>
              <Text style={styles.questName}>1. 아침 물 1잔 마시기</Text>
              <Text style={styles.questReward}>보상: 활력초 x1</Text>
            </View>
            <View style={styles.questItem}>
              <Text style={styles.questName}>2. 영양제 섭취 인증하기</Text>
              <Text style={styles.questReward}>보상: 탱탱 젤리 x1</Text>
            </View>
            <View style={styles.questItem}>
              <Text style={styles.questName}>3. 스트레칭 5분 진행하기</Text>
              <Text style={styles.questReward}>보상: 평온초 x1</Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* 📅 사이드 팝업 2: 7일 출석체크 모달 */}
      <Modal visible={attendanceOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.popupModalCard}>
            <View style={styles.popupHeader}>
              <Text style={styles.popupTitle}>📅 7일 출석체크</Text>
              <TouchableOpacity onPress={() => setAttendanceOpen(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.attendanceSub}>매일 출석하고 7일차에 전설 보상 상자를 받으세요!</Text>
            <View style={styles.attendanceDaysRow}>
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <View key={d} style={[styles.dayCircle, (d <= 3 || attendanceChecked) && styles.dayCircleActive]}>
                  <Text style={styles.dayText}>{d}일</Text>
                  <Text style={styles.dayIcon}>{d <= 3 || (d === 4 && attendanceChecked) ? '✓' : '🎁'}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.checkInActionBtn, attendanceChecked && styles.checkInActionBtnDone]}
              disabled={attendanceChecked}
              onPress={() => {
                setAttendanceChecked(true);
                Alert.alert('출석 완료', '오늘의 출석체크가 완료되었습니다!');
              }}
            >
              <Text style={styles.checkInActionText}>
                {attendanceChecked ? '오늘 출석 완료' : '오늘 출석체크 하기'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 📸 사이드 팝업 3: 영양제 촬영 등록 모달 */}
      <Modal visible={ocrOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.popupModalCard}>
            <View style={styles.popupHeader}>
              <Text style={styles.popupTitle}>📸 영양제 촬영 등록</Text>
              <TouchableOpacity onPress={() => setOcrOpen(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.ocrUploadBox}>
              <Text style={{ fontSize: 36, marginBottom: 8 }}>📷</Text>
              <Text style={{ color: '#DDD', fontSize: 13, fontWeight: 'bold' }}>영양제 라벨 사진을 업로드하세요</Text>
              <Text style={{ color: '#8A7A9E', fontSize: 11, marginTop: 4 }}>GPT-4o Vision이 제품명을 자동 인식합니다</Text>
            </View>
            <TouchableOpacity
              style={styles.checkInActionBtn}
              onPress={() => {
                setOcrOpen(false);
                Alert.alert('인증 완료', '비타민 C & 글루타치온 복합제가 가마솥에 등록되었습니다!');
              }}
            >
              <Text style={styles.checkInActionText}>사진 선택 및 AI 분석 시작</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#130E1F' },
  contentWrapper: { flex: 1, maxWidth: 600, width: '100%', marginHorizontal: 'auto' },
  backgroundImage: { flex: 1, width: '100%', height: '100%' },

  // 👑 홈 메인 UI 위치
  topRightHeader: { position: 'absolute', top: 20, right: 16, zIndex: 20 },
  menuIconImg: { width: 50, height: 50, resizeMode: 'contain' },

  sideMenuContainer: {
    position: 'absolute',
    top: 84,
    right: 14,
    width: 88,
    height: 290,
    paddingVertical: 14,
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 15,
  },
  sideBtnItem: { alignItems: 'center' },
  sideIconImg: { width: 44, height: 44, resizeMode: 'contain', marginBottom: 2 },
  sideBtnLabel: { color: '#FFD700', fontSize: 10.5, fontWeight: 'bold' },

  bottomRightActionArea: { position: 'absolute', bottom: 24, right: 16, gap: 10, zIndex: 15 },
  actionBtnImg: { width: 170, height: 50, resizeMode: 'contain' },

  // 🏺 가마솥 연성 모달 UI
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', justifyContent: 'center', alignItems: 'center' },
  modalCloseIcon: { position: 'absolute', top: 12, right: 14, zIndex: 10, padding: 6 },
  modalCloseText: { color: '#AAA', fontSize: 18, fontWeight: 'bold' },

  brewModalContainer: {
    maxWidth: 560,
    width: '92%',
    height: '84%',
    backgroundColor: '#242038',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#6C5CE7',
  },
  topFlaskBox: {
    flex: 0.44,
    backgroundColor: '#1B1728',
    borderRadius: 14,
    padding: 10,
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  boxLabel: { color: '#8A879E', fontSize: 11, fontWeight: 'bold' },
  flaskVisual: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  chamberCauldronImg: { width: 130, height: 100, marginBottom: 4 },
  flaskStatusText: { color: '#8E7DA8', fontSize: 12, textAlign: 'center', fontWeight: '600' },
  flaskStatusTextActive: { color: '#FFF', fontSize: 14, textAlign: 'center', fontWeight: 'bold' },
  highlightCount: { color: '#FFD700', fontSize: 15, fontWeight: '900' },
  confirmSmallBtn: {
    alignSelf: 'center',
    backgroundColor: '#E056FD',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  confirmBtnText: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },

  bottomInventoryBox: { flex: 0.56, backgroundColor: '#2C2746', borderRadius: 14, padding: 12 },
  subTabContainer: { flexDirection: 'row', backgroundColor: '#1B1728', borderRadius: 8, padding: 3, marginBottom: 10 },
  subTabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  activeSubTab: { backgroundColor: '#6C5CE7' },
  subTabText: { color: '#8A879E', fontSize: 11, fontWeight: '600' },
  activeSubTabText: { color: '#FFF', fontWeight: 'bold' },

  suppItemRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1B1728', padding: 10, borderRadius: 10, marginBottom: 8 },
  suppName: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  suppTime: { color: '#2ECC71', fontSize: 11, marginTop: 2 },
  suppThumb: { width: 40, height: 40, borderRadius: 8 },
  emptySupplementBox: { backgroundColor: '#1B1728', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 10 },
  emptyTitle: { color: '#FFD700', fontSize: 12.5, fontWeight: 'bold', marginBottom: 4 },
  emptySub: { color: '#8A7A9E', fontSize: 11, textAlign: 'center' },

  matGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingBottom: 10 },
  matCard: { width: '31.5%', backgroundColor: '#1B1728', borderRadius: 10, padding: 8, alignItems: 'center', borderWidth: 1, borderColor: '#3E3960' },
  matCardSelected: { borderColor: '#E056FD', backgroundColor: '#3E244D' },
  matGradeBadge: { position: 'absolute', top: 4, left: 4, color: '#FFD700', fontSize: 9, fontWeight: 'bold' },
  matCardIconImg: { width: 30, height: 30, marginVertical: 3 },
  matIcon: { fontSize: 22, marginVertical: 3 },
  matName: { color: '#FFF', fontSize: 10, textAlign: 'center' },
  matCountText: { color: '#FFD700', fontSize: 10, fontWeight: 'bold', marginTop: 2 },

  // ⏳ 로딩 모달
  loadingOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#E056FD', marginTop: 16, fontSize: 16, fontWeight: 'bold' },

  // 📜 사이드 팝업 모달 공통 스타일
  popupModalCard: { width: '85%', backgroundColor: '#242038', borderRadius: 18, padding: 18, borderWidth: 1.5, borderColor: '#6C5CE7' },
  popupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  popupTitle: { color: '#FFD700', fontSize: 16, fontWeight: 'bold' },
  questItem: { backgroundColor: '#1B1728', borderRadius: 10, padding: 12, marginBottom: 8 },
  questName: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
  questReward: { color: '#A29BFE', fontSize: 11, marginTop: 4 },
  attendanceSub: { color: '#DDD', fontSize: 12, marginBottom: 14 },
  attendanceDaysRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  dayCircle: { width: 34, height: 44, backgroundColor: '#1B1728', borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#3E3960' },
  dayCircleActive: { borderColor: '#FFD700', backgroundColor: '#3B2F50' },
  dayText: { color: '#8A7A9E', fontSize: 9 },
  dayIcon: { color: '#FFD700', fontSize: 12, marginTop: 2 },
  checkInActionBtn: { backgroundColor: '#E056FD', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  checkInActionBtnDone: { backgroundColor: '#3E3960' },
  checkInActionText: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
  ocrUploadBox: { backgroundColor: '#1B1728', borderRadius: 12, padding: 24, alignItems: 'center', borderWidth: 1.2, borderColor: '#483566', marginBottom: 14 },
});