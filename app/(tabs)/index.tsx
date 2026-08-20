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
import * as ImagePicker from 'expo-image-picker'; // 📸 이미지 피커 라이브러리
import { MOCK_MATERIALS, MOCK_ELIXIRS, ElixirCardData } from '../../src/mockData';
import { getMaterialImage } from '../../constants/materialImages';
import ElixirDetailModal from '../../src/components/ElixirDetailModal';

const INITIAL_TODAY_SUPPLEMENTS = [
  { id: 's1', name: '비타민 C & 글루타치온 복합제', time: '오전 08:30 인증', photoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200' },
  { id: 's2', name: '저분자 콜라겐 젤리', time: '오후 12:40 인증', photoUrl: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=200' },
];

export default function HomeScreen() {
  const [questOpen, setQuestOpen] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [ocrOpen, setOcrOpen] = useState(false);
  const [attendanceChecked, setAttendanceChecked] = useState(false);

  const [brewModalOpen, setBrewModalOpen] = useState(false);
  const [lowerTab, setLowerTab] = useState<'supplements' | 'materials'>('supplements');
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [todaySupplements, setTodaySupplements] = useState(INITIAL_TODAY_SUPPLEMENTS);
  
  const [isBrewing, setIsBrewing] = useState(false);
  const [resultElixir, setResultElixir] = useState<ElixirCardData | null>(null);
  const [showAdvisor, setShowAdvisor] = useState(false);

  // 📸 OCR 영양제 다중 등록 상태 관리
  const [isUploading, setIsUploading] = useState(false);
  const [pendingImages, setPendingImages] = useState<string[]>([]);

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
      setResultElixir(MOCK_ELIXIRS[0]);
      setSelectedMaterials([]);
    }, 2500);
  };

  const handleSaveToCodex = () => {
    Alert.alert('📖 도감 등록', `'${resultElixir?.name}'이(가) 비약 도감에 보관되었습니다!`);
    setResultElixir(null);
    setShowAdvisor(false);
  };

  // -------------------------------------------------------------
  // 📸 카메라/갤러리 열기 함수 (다중 선택 또는 하나씩 추가/다시 찍기)
  // -------------------------------------------------------------
  const openImagePicker = async (indexToReplace?: number) => {
    // 카메라/앨범 선택 옵션 Alert 띄우기
    Alert.alert(
      '영양제 사진 업로드',
      '사진을 가져올 방식을 선택해주세요.',
      [
        {
          text: '카메라로 촬영',
          onPress: async () => {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (permission.granted) {
              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });
              handlePickerResult(result, indexToReplace);
            }
          },
        },
        {
          text: '앨범에서 선택',
          onPress: async () => {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (permission.granted) {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });
              handlePickerResult(result, indexToReplace);
            }
          },
        },
        { text: '취소', style: 'cancel' },
      ]
    );
  };

  const handlePickerResult = (result: ImagePicker.ImagePickerResult, indexToReplace?: number) => {
    if (result.canceled) return;
    const newUri = result.assets[0].uri;

    if (indexToReplace !== undefined) {
      // 기존 썸네일 다시 찍기
      const updatedImages = [...pendingImages];
      updatedImages[indexToReplace] = newUri;
      setPendingImages(updatedImages);
    } else {
      // 새로운 사진 추가하기
      setPendingImages((prev) => [...prev, newUri]);
    }
  };

  // -------------------------------------------------------------
  // 🚀 백엔드로 이미지 전송 & OCR 인증 로직
  // -------------------------------------------------------------
  const handleVerifySupplements = async () => {
    if (pendingImages.length === 0) {
      Alert.alert('알림', '등록할 영양제 사진을 최소 1장 이상 추가해 주세요.');
      return;
    }

    setIsUploading(true);

    try {
      // [TODO] 백엔드 연결 시 아래 주석 해제 후 사용
      /*
      for (const uri of pendingImages) {
        const formData = new FormData();
        formData.append('image', {
          uri: uri,
          name: `supplement_${Date.now()}.jpg`,
          type: 'image/jpeg',
        } as any);

        const res = await fetch('http://백엔드IP:8080/api/supplements/verify', {
          method: 'POST',
          headers: { Authorization: `Bearer ${userToken}` },
          body: formData,
        });
        
        const data = await res.json();
        // data.isVerified, data.productName 등을 활용하여 리스트 갱신
      }
      */

      // ⏳ 테스트용 2.5초 딜레이
      setTimeout(() => {
        setIsUploading(false);
        setOcrOpen(false);

        // 테스트: 성공 처리 및 홈 [오늘 인증] 목록에 추가
        const newSupplements = pendingImages.map((uri, idx) => ({
          id: `new_s_${Date.now()}_${idx}`,
          name: `AI 인식 완료 (영양제 ${idx + 1})`,
          time: '방금 전 인증 완료',
          photoUrl: uri,
        }));

        setTodaySupplements((prev) => [...newSupplements, ...prev]);
        setPendingImages([]); // 초기화

        Alert.alert('✅ 인증 성공!', 'GPT-4o Vision이 영양제를 확인하고 가마솥에 담았습니다.');
      }, 2500);

    } catch (error) {
      setIsUploading(false);
      Alert.alert('인증 실패', '서버와 통신 중 문제가 발생했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.contentWrapper}>
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

          {/* 2. 우측 사이드 플로팅 바 */}
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

            {/* 영양제 등록 버튼 ➔ OCR 팝업 띄우기 */}
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

            <TouchableOpacity onPress={() => setBrewModalOpen(true)} activeOpacity={0.8}>
              <Image source={require('../../assets/images/home_brew.png')} style={styles.actionBtnImg} />
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>

      {/* 🔮 가마솥 챔버 모달 (원래 코드 그대로 유지) */}
      <Modal visible={brewModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.brewModalContainer}>
            <TouchableOpacity style={styles.modalCloseIcon} onPress={() => setBrewModalOpen(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>

            <View style={styles.topFlaskBox}>
              <Text style={styles.boxLabel}>연성 챔버</Text>
              <View style={styles.flaskVisual}>
                <Image
                  source={require('../../assets/images/brew.png')}
                  style={styles.chamberCauldronImg}
                  resizeMode="contain"
                />
                <Text style={styles.flaskStatusText}>
                  {selectedMaterials.length > 0
                    ? `재료 ${selectedMaterials.length}개 추가`
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
                    오늘 인증 ({todaySupplements.length})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.subTabBtn, lowerTab === 'materials' && styles.activeSubTab]}
                  onPress={() => setLowerTab('materials')}
                >
                  <Text style={[styles.subTabText, lowerTab === 'materials' && styles.activeSubTabText]}>
                    재료 카드
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

      {/* 연성 로딩 */}
      <Modal visible={isBrewing} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#E056FD" />
          <Text style={styles.loadingText}>가마솥에서 연금술이 일어나는 중...</Text>
        </View>
      </Modal>

      {/* 결과 카드 팝업 */}
      <Modal visible={!!resultElixir} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.fullscreenCardWrapper}>
            {resultElixir && (
              <View style={styles.hugeCardContainer}>
                <ScrollView
                  style={styles.cardScrollView}
                  contentContainerStyle={styles.cardScrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.cardTopHeader}>
                    <View style={styles.cardGradeTag}>
                      <Text style={styles.cardGradeText}>[{resultElixir.grade}]</Text>
                    </View>
                    <Text style={styles.cardThemeText}>{resultElixir.themeCategory}</Text>
                  </View>

                  <Text style={styles.cardTitle}>{resultElixir.name}</Text>

                  <View style={styles.largeArtFrame}>
                    <Image source={resultElixir.imageSource} style={styles.largePotionImage} resizeMode="cover" />
                  </View>

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

                  <View style={styles.synergyCardBox}>
                    <Text style={styles.synergyTitle}>🏺 가마솥 연성 시너지</Text>
                    <Text style={styles.synergyContent}>{resultElixir.brewingLore}</Text>
                  </View>

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

                {showAdvisor && (
                  <View style={styles.advisorFloatingTooltip}>
                    <Text style={styles.advisorSpeaker}>늘해랑</Text>
                    <Text style={styles.advisorSayText}>"{resultElixir.adviserComment}"</Text>
                  </View>
                )}

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

      {/* 일일 퀘스트 모달 */}
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

      {/* 출석체크 모달 */}
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
              <Text style={styles.checkInActionText}>{attendanceChecked ? '오늘 출석 완료' : '오늘 출석체크 하기'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ═════════════════════════════════════════════════════════
          📸 OCR 다중 영양제 촬영 모달 (완벽 업그레이드)
          ═════════════════════════════════════════════════════════ */}
      <Modal visible={ocrOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.ocrPopupModalCard}>
            <View style={styles.popupHeader}>
              <Text style={styles.popupTitle}>📸 영양제 촬영 등록</Text>
              <TouchableOpacity onPress={() => setOcrOpen(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.ocrDescBox}>
              <Text style={styles.ocrDescText}>
                오늘 드신 영양제 라벨을 찍어주세요!{'\n'}GPT-4o Vision이 제품명을 자동으로 인식합니다.
              </Text>
            </View>

            {/* 추가된 이미지들 가로 스크롤 영역 */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ocrImageScroll}>
              {pendingImages.map((uri, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.ocrThumbBox}
                  onPress={() => openImagePicker(index)} // 누르면 해당 인덱스 사진 교체
                  activeOpacity={0.8}
                >
                  <Image source={{ uri }} style={styles.ocrThumbImg} />
                  <View style={styles.ocrRetakeBadge}>
                    <Text style={styles.ocrRetakeText}>↻ 다시 찍기</Text>
                  </View>
                </TouchableOpacity>
              ))}

              {/* + 더 등록하기 빈 칸 버튼 */}
              <TouchableOpacity style={styles.ocrAddBox} onPress={() => openImagePicker()} activeOpacity={0.8}>
                <Text style={styles.ocrAddIcon}>+</Text>
                <Text style={styles.ocrAddText}>사진 추가</Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.ocrSubmitActionBtn,
                pendingImages.length === 0 && { backgroundColor: '#3E3960' }
              ]}
              onPress={handleVerifySupplements}
              disabled={pendingImages.length === 0 || isUploading}
              activeOpacity={0.8}
            >
              {isUploading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={[styles.checkInActionText, pendingImages.length === 0 && { color: '#8A7A9E' }]}>
                  {pendingImages.length > 0
                    ? `📷 ${pendingImages.length}개 제품 AI 분석 시작`
                    : '사진을 먼저 추가해 주세요'}
                </Text>
              )}
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

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', justifyContent: 'center', alignItems: 'center' },
  modalCloseIcon: { position: 'absolute', top: 12, right: 14, zIndex: 10, padding: 6 },
  modalCloseText: { color: '#AAA', fontSize: 18, fontWeight: 'bold' },

  brewModalContainer: { maxWidth:560, width: '92%', height: '82%', backgroundColor: '#242038', borderRadius: 20, padding: 16, borderWidth: 1.5, borderColor: '#6C5CE7' },
  topFlaskBox: { flex: 0.2, backgroundColor: '#1B1728', borderRadius: 14, padding: 2, justifyContent: 'space-between', marginBottom: 12 },
  boxLabel: { color: '#8A879E', fontSize: 11, fontWeight: 'bold' },
  flaskVisual: { alignItems: 'center', justifyContent: 'center' },
  chamberCauldronImg: { width: '90%', height: '90%', marginBottom: 4},
  flaskStatusText: { color: '#DDD', fontSize: 12, textAlign: 'center' },
  flaskStatusTextActive: { color: '#FFF', fontSize: 14, textAlign: 'center', fontWeight: 'bold' },
  highlightCount: { color: '#FFD700', fontSize: 15, fontWeight: '900' },
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
  emptySupplementBox: { backgroundColor: '#1B1728', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 10 },
  emptyTitle: { color: '#FFD700', fontSize: 12.5, fontWeight: 'bold', marginBottom: 4 },
  emptySub: { color: '#8A7A9E', fontSize: 11, textAlign: 'center' },
  matGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  matCard: { width: '31%', backgroundColor: '#1B1728', borderRadius: 10, padding: 8, alignItems: 'center', borderWidth: 1, borderColor: '#3E3960' },
  matCardSelected: { borderColor: '#E056FD', backgroundColor: '#3E244D' },
  matGradeBadge: { position: 'absolute', top: 4, left: 4, color: '#FFD700', fontSize: 9, fontWeight: 'bold' },
  matCardIconImg: { width: 28, height: 28, marginVertical: 3 },
  matIcon: { fontSize: 22, marginVertical: 3 },
  matName: { color: '#FFF', fontSize: 10, textAlign: 'center' },
  matCountText: { color: '#FFD700', fontSize: 10, fontWeight: 'bold', marginTop: 2 },

  loadingOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#E056FD', marginTop: 16, fontSize: 16, fontWeight: 'bold' },

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

  // 📸 OCR 팝업 전용 스타일
  ocrPopupModalCard: { width: '90%', backgroundColor: '#242038', borderRadius: 20, padding: 20, borderWidth: 1.5, borderColor: '#6C5CE7' },
  ocrDescBox: { marginBottom: 16 },
  ocrDescText: { color: '#A29BFE', fontSize: 12.5, lineHeight: 18, textAlign: 'center' },
  ocrImageScroll: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 20 },
  ocrThumbBox: { width: 100, height: 100, borderRadius: 12, borderWidth: 1.5, borderColor: '#E056FD', overflow: 'hidden', position: 'relative' },
  ocrThumbImg: { width: '100%', height: '100%' },
  ocrRetakeBadge: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 4, alignItems: 'center' },
  ocrRetakeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  ocrAddBox: { width: 100, height: 100, borderRadius: 12, borderWidth: 1.5, borderColor: '#483566', borderStyle: 'dashed', backgroundColor: '#1B1728', justifyContent: 'center', alignItems: 'center' },
  ocrAddIcon: { color: '#8A7A9E', fontSize: 28, marginBottom: 4 },
  ocrAddText: { color: '#8A7A9E', fontSize: 11, fontWeight: 'bold' },
  ocrSubmitActionBtn: { backgroundColor: '#E056FD', paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
});