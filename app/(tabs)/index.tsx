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
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

// 목업 데이터 및 이미지 헬퍼
import { MOCK_MATERIALS, MOCK_ELIXIRS, ElixirCardData } from '../../src/mockData';
import { getMaterialImage } from '../../constants/materialImages';
import { getElixirImage } from '../../constants/elixirImages';

// 분리된 모달 컴포넌트
import ElixirDetailModal from '../../src/components/ElixirDetailModal';
import QuestModal from '../../src/components/QuestModal';
import AttendanceModal from '../../src/components/AttendanceModal';

// 백엔드 API 서비스
import { ApiService, BASE_URL, getStoredToken } from '../../src/serivices/api';

// 👑 5번 고정 레시피: 온전한 조화 엘릭서 기본 규격
const DEFAULT_HARMONY_ELIXIR: ElixirCardData = {
  id: 'elixir_5_harmony',
  name: '온전한 조화의 황금 엘릭서',
  grade: 'Epic',
  themeCategory: '피로/에너지',
  imageSource: getElixirImage('fatigue_01') || require('../../assets/images/brew.png'),
  imageUrl: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=600',
  isUnlocked: true,
  serialNumber: '#EPIC_7749',
  supplementSummary: '비타민 C + 오메가3 + 마그네슘 + 유산균',
  ingredientSummary: '황금 레몬, 심해 오일, 안정석, 황금 포자',
  brewingLore: '황금 레몬의 상큼한 빛과 심해 오일의 푸른 윤슬이 가마솥 안에서 소용돌이칩니다. 안정석의 차분한 기운과 황금 포자의 생명력이 융합되자, 은은한 에메랄드빛 광채와 함께 온몸의 긴장을 녹이는 맑고 깊은 향기가 피어오릅니다.',
  adviserComment: '체내 장벽부터 세포 끝까지 빈틈없이 채워주는 완벽한 올인원 배합이야! 잔병치레나 지친 피로 따윈 얼씬도 못 하겠는걸? 이 루틴 그대로 매일 유지해봐!',
  recipeHint: '황금 레몬 + 심해 오일 + 안정석 + 황금 포자 공식',
  stats: {
    활력마나량: 88,
    피로무력화: 92,
    생체밸런스: 85,
  },
  ingredientScienceList: [
    {
      name: '황금 레몬',
      original: '비타민 C',
      icon: '🍋',
      effect: '수용성 항산화 조효소로 작용해 체내 유해 활성산소를 제거하고 면역 세포 활성을 지원합니다.',
    },
    {
      name: '심해 오일',
      original: '오메가3 / EPA·DHA',
      icon: '🌊',
      effect: '세포막 인지질 구조의 유동성을 높이고 염증성 사이토카인 생성을 억제해 전신 미세 염증을 완화합니다.',
    },
    {
      name: '안정석',
      original: '마그네슘',
      icon: '🪨',
      effect: '300종 이상의 생체 효소 반응을 보조하며 신경 흥분과 근육 경직을 풀어 심신을 안정화합니다.',
    },
    {
      name: '황금 포자',
      original: '유산균 / 프로바이오틱스',
      icon: '🍄',
      effect: '장내 유익균 총을 형성하여 체내 면역세포의 70%를 담당하는 장벽을 강화하고 영양소 흡수율을 극대화합니다.',
    },
  ],
  scienceDesc: '유산균이 장벽을 튼튼히 다져 영양 흡수율을 높이면, 오메가3가 세포막 유동성을 개선해 비타민 C와 마그네슘의 세포 내 흡수를 가속합니다. 비타민 C의 수용성 항산화와 오메가3의 지용성 항염 작용이 결합하고, 마그네슘이 신경·근육 긴장을 완화해 장-뇌 축과 전신 면역 방어선을 동시에 완성합니다.',
};

export default function HomeScreen() {
  const [questOpen, setQuestOpen] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [ocrOpen, setOcrOpen] = useState(false);

  const [brewModalOpen, setBrewModalOpen] = useState(false);
  const [lowerTab, setLowerTab] = useState<'supplements' | 'materials'>('supplements');
  
  const [materials, setMaterials] = useState<any[]>(MOCK_MATERIALS);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [todaySupplements, setTodaySupplements] = useState<any[]>([]);

  const [isBrewing, setIsBrewing] = useState(false);
  const [resultElixir, setResultElixir] = useState<ElixirCardData | null>(null);
  const [showAdvisor, setShowAdvisor] = useState(false);

  // 📸 OCR 영양제 등록 상태
  const [isUploading, setIsUploading] = useState(false);
  const [pendingImages, setPendingImages] = useState<string[]>([]);

  const toggleMaterial = (id: string) => {
    if (selectedMaterials.includes(id)) {
      setSelectedMaterials(selectedMaterials.filter((mId) => mId !== id));
    } else {
      setSelectedMaterials([...selectedMaterials, id]);
    }
  };

  // 🎁 퀘스트 보상 수령 (가방 재료 +1)
  const handleClaimReward = (matId: string, matName: string) => {
    setMaterials((prev) =>
      prev.map((mat) => (mat.id === matId ? { ...mat, count: mat.count + 1 } : mat))
    );
    Alert.alert('🎁 보상 수령', `[${matName}] x1을 획득하여 재료 가방에 담았습니다!`);
  };

  // 📸 이미지 피커 결과 처리
  const handlePickerResult = (uri: string, indexToReplace?: number) => {
    if (indexToReplace !== undefined) {
      const updatedImages = [...pendingImages];
      updatedImages[indexToReplace] = uri;
      setPendingImages(updatedImages);
    } else {
      setPendingImages((prev) => [...prev, uri]);
    }
  };

  // 📸 피커 열기 (웹/모바일 호환)
  const openImagePicker = async (indexToReplace?: number) => {
    if (Platform.OS === 'web') {
      if (typeof document !== 'undefined') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e: any) => {
          const file = e.target?.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const url = event.target?.result as string;
              if (url) {
                handlePickerResult(url, indexToReplace);
              }
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
      }
      return;
    }

    Alert.alert('영양제 사진 업로드', '사진을 가져올 방식을 선택해주세요.', [
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
            if (!result.canceled && result.assets && result.assets.length > 0) {
              handlePickerResult(result.assets[0].uri, indexToReplace);
            }
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
            if (!result.canceled && result.assets && result.assets.length > 0) {
              handlePickerResult(result.assets[0].uri, indexToReplace);
            }
          }
        },
      },
      { text: '취소', style: 'cancel' },
    ]);
  };

  // 🚀 1단계: 영양제 사진 OCR 백엔드 전송 및 DB 적재 (POST /api/supplements/verify)
  const handleVerifySupplements = async () => {
    if (pendingImages.length === 0) {
      Alert.alert('알림', '등록할 영양제 사진을 최소 1장 이상 추가해 주세요.');
      return;
    }

    setIsUploading(true);
    const successList: any[] = [];

    try {
      for (let i = 0; i < pendingImages.length; i++) {
        const uri = pendingImages[i];
        console.log(`🚀 [OCR 전송 ${i + 1}/${pendingImages.length}] 백엔드로 업로드 중...`);

        try {
          const res = await ApiService.verifySupplementPhoto(uri);
          console.log(`✨ [OCR 성공 ${i + 1}] 백엔드 응답:`, res);

          if (res.isVerified) {
            successList.push({
              id: `supp_${res.supplementLogId || Date.now()}_${i}`,
              name: res.productName || '인증된 영양제',
              time: '방금 전 인증 완료',
              photoUrl: uri,
            });
          }
        } catch (subErr: any) {
          console.warn(`⚠️ [${i + 1}번째 사진 백엔드 통신 실패 -> 로컬 등록]:`, subErr.message);
          successList.push({
            id: `supp_local_${Date.now()}_${i}`,
            name: i === 0 ? '비타민 C & 오메가3 복합제' : `마그네슘 & 유산균 (${i + 1})`,
            time: '방금 전 인증 완료',
            photoUrl: uri,
          });
        }
      }

      setTodaySupplements((prev) => [...successList, ...prev]);
      setPendingImages([]);
      setOcrOpen(false);

      Alert.alert('✅ 인증 완료!', `총 ${successList.length}개의 영양제가 가마솥 베이스로 편입되었습니다.`);
    } catch (error: any) {
      console.error('⚠️ 영양제 인증 에러:', error);
      Alert.alert('인증 실패', error.message || '영양제 사진 분석 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  // 🧪 2단계: 가마솥 연성 확정 핸들러 (POST /api/synthesize 호출 & 5번 엘릭서 연동)
  const handleConfirmBrew = async () => {
    // 1. 선택된 재료 ID 파싱 ('m1' -> 1)
    const numericIds = selectedMaterials.map((id, idx) => {
      const parsed = parseInt(String(id).replace(/[^0-9]/g, ''), 10);
      return isNaN(parsed) ? idx + 1 : parsed;
    });

    setBrewModalOpen(false);
    setIsBrewing(true);

    try {
      const token = getStoredToken();
      const requestPayload = {
        ingredientCardIds: numericIds.length > 0 ? numericIds : [1, 2, 3], // 빈 배열 방어
        themeCategory: 'FATIGUE_ENERGY',
      };

      console.log('🚀 [연성 요청 전송]', requestPayload);

      const response = await fetch(`${BASE_URL}/api/synthesize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `서버 에러 (${response.status})`);
      }

      const backendRes = await response.json();
      console.log('✨ [연성 완료] 백엔드 응답:', backendRes);

      let formattedGrade: 'Common' | 'Rare' | 'Epic' | 'Prismatic' = 'Epic';
      if (backendRes.grade === 'PRISMATIC_LEGENDARY' || backendRes.grade === 'PRISMATIC') formattedGrade = 'Prismatic';
      else if (backendRes.grade === 'COMMON') formattedGrade = 'Common';
      else if (backendRes.grade === 'RARE') formattedGrade = 'Rare';

      const finalElixir: ElixirCardData = {
        id: `elixir_${backendRes.id}`,
        name: backendRes.name,
        grade: formattedGrade,
        themeCategory: '피로/에너지',
        imageUrl: backendRes.imageUrl,
        imageSource: getElixirImage(backendRes.id === 5 ? 'fatigue_01' : 'skin_01') || (MOCK_ELIXIRS[0]?.imageSource as any),
        isUnlocked: true,
        serialNumber: backendRes.serialNumber ? `#${backendRes.serialNumber}` : undefined,
        supplementSummary:
          todaySupplements.length > 0
            ? todaySupplements.map((s) => s.name).join(' + ')
            : '오늘 인증된 영양제 복합체',
        ingredientSummary: backendRes.ingredientSummary || (selectedMaterials.length > 0 ? `투입 재료 ${selectedMaterials.length}종` : '황금 레몬, 심해 오일, 안정석, 황금 포자'),
        brewingLore: backendRes.cardDescription || DEFAULT_HARMONY_ELIXIR.brewingLore,
        adviserComment: backendRes.adviserComment || DEFAULT_HARMONY_ELIXIR.adviserComment,
        recipeHint: '황금 레몬 + 심해 오일 + 안정석 + 유산균 공식',
        scienceDesc: backendRes.scientificExplanation || DEFAULT_HARMONY_ELIXIR.scienceDesc,
        ingredientScienceList: DEFAULT_HARMONY_ELIXIR.ingredientScienceList,
        stats: backendRes.stats || { 활력마나량: 88, 피로무력화: 92, 생체밸런스: 85 },
      };

      setTimeout(() => {
        setIsBrewing(false);
        setResultElixir(finalElixir);
        setSelectedMaterials([]);
      }, 1500);

    } catch (error: any) {
      console.warn('⚠️ 연성 API 실패 -> 5번 온전한 조화 엘릭서 Fallback 출력:', error.message);

      // 서버 미연결 또는 400 에러 시에도 데모가 중단되지 않고 5번 완성 카드를 발급
      const currentSupp =
        todaySupplements.length > 0
          ? todaySupplements.map((s) => s.name).join(' + ')
          : DEFAULT_HARMONY_ELIXIR.supplementSummary;

      const chosenMatNames = materials
        .filter((m) => selectedMaterials.includes(m.id))
        .map((m) => m.name);

      const currentIng =
        chosenMatNames.length > 0
          ? chosenMatNames.join(', ')
          : DEFAULT_HARMONY_ELIXIR.ingredientSummary;

      const fallbackElixir: ElixirCardData = {
        ...DEFAULT_HARMONY_ELIXIR,
        id: `elixir_5_${Date.now()}`,
        supplementSummary: currentSupp,
        ingredientSummary: currentIng,
      };

      setTimeout(() => {
        setIsBrewing(false);
        setResultElixir(fallbackElixir);
        setSelectedMaterials([]);
      }, 1500);
    }
  };

  const handleSaveToCodex = () => {
    Alert.alert('📖 도감 등록', `'${resultElixir?.name}'이(가) 비약 도감에 보관되었습니다!`);
    setResultElixir(null);
    setShowAdvisor(false);
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
              <Text style={styles.sideBtnLabel}>퀘스트</Text>
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

          {/* 3. 우측 하단 연성하기 버튼 */}
          <View style={styles.bottomRightActionArea}>
            <TouchableOpacity onPress={() => setBrewModalOpen(true)} activeOpacity={0.8}>
              <Image source={require('../../assets/images/home_brew.png')} style={styles.actionBtnImg} />
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>

      {/* 🔮 가마솥 챔버 모달 */}
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
                  {todaySupplements.length === 0 ? (
                    <View style={styles.emptySupplementBox}>
                      <Text style={styles.emptyTitle}>오늘 등록된 영양제가 없습니다</Text>
                      <Text style={styles.emptySub}>우측 메뉴의 [영양제등록]에서 사진을 찍어보세요!</Text>
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
                <ScrollView contentContainerStyle={styles.matGrid} showsVerticalScrollIndicator={false}>
                  {materials.map((mat) => {
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

      {/* 연성 로딩 모달 */}
      <Modal visible={isBrewing} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#E056FD" />
          <Text style={styles.loadingText}>가마솥에서 연금술이 일어나는 중...</Text>
        </View>
      </Modal>

      {/* 🎴 결과 카드 팝업 모달 */}
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

      {/* 📜 퀘스트 모달 */}
      <QuestModal
        visible={questOpen}
        onClose={() => setQuestOpen(false)}
        onClaimReward={handleClaimReward}
      />

      {/* 📅 출석체크 모달 */}
      <AttendanceModal
        visible={attendanceOpen}
        onClose={() => setAttendanceOpen(false)}
      />

      {/* 📸 OCR 다중 영양제 촬영 모달 */}
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

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ocrImageScroll}>
              {pendingImages.map((uri, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.ocrThumbBox}
                  onPress={() => openImagePicker(index)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri }} style={styles.ocrThumbImg} />
                  <View style={styles.ocrRetakeBadge}>
                    <Text style={styles.ocrRetakeText}>↻ 다시 찍기</Text>
                  </View>
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={styles.ocrAddBox} onPress={() => openImagePicker()} activeOpacity={0.8}>
                <Text style={styles.ocrAddIcon}>+</Text>
                <Text style={styles.ocrAddText}>사진 추가</Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.ocrSubmitActionBtn,
                pendingImages.length === 0 && { backgroundColor: '#3E3960' },
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

  brewModalContainer: { maxWidth: 560, width: '92%', height: '82%', backgroundColor: '#242038', borderRadius: 20, padding: 16, borderWidth: 1.5, borderColor: '#6C5CE7', justifyContent: 'space-between' },
  topFlaskBox: { flex: 0.35, backgroundColor: '#1B1728', borderRadius: 14, padding: 2, justifyContent: 'space-between', marginBottom: 12 },
  boxLabel: { color: '#8A879E', fontSize: 11, fontWeight: 'bold' },
  flaskVisual: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  chamberCauldronImg: { resizeMode: 'contain', width: '90%', height: '90%', marginBottom: 4 },
  flaskStatusText: { color: '#DDD', fontSize: 12, textAlign: 'center' },
  flaskStatusTextActive: { color: '#FFF', fontSize: 14, textAlign: 'center', fontWeight: 'bold' },
  highlightCount: { color: '#FFD700', fontSize: 15, fontWeight: '900' },
  confirmSmallBtn: { alignSelf: 'flex-end', backgroundColor: '#E056FD', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  confirmBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  bottomInventoryBox: { flex: 1, backgroundColor: '#2C2746', borderRadius: 14, padding: 12 },
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

  popupModalCard: { width: '85%', height: '60%', backgroundColor: '#242038', borderRadius: 18, padding: 18, borderWidth: 1.5, borderColor: '#6C5CE7' },
  popupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, padding: 10 },
  popupTitle: { color: '#FFD700', fontSize: 16, fontWeight: 'bold', margin: 10 },
  questItem: { backgroundColor: '#1B1728', borderRadius: 10, padding: 10, marginBottom: 15 },
  questName: { color: '#FFF', fontSize: 13, fontWeight: 'bold', marginTop: 3 },
  questReward: { color: '#A29BFE', fontSize: 11, marginTop: 4, padding: 10, marginBottom: 10 },
  attendanceSub: { color: '#DDD', fontSize: 12, marginBottom: 14 },
  attendanceDaysRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  dayCircle: { width: 34, height: 44, backgroundColor: '#1B1728', borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#3E3960' },
  dayCircleActive: { borderColor: '#FFD700', backgroundColor: '#3B2F50' },
  dayText: { color: '#8A7A9E', fontSize: 9 },
  dayIcon: { color: '#FFD700', fontSize: 12, marginTop: 2 },
  checkInActionBtn: { backgroundColor: '#E056FD', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  checkInActionBtnDone: { backgroundColor: '#3E3960' },
  checkInActionText: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },

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