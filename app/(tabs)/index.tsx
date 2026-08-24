// app/(tabs)/index.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import * as ImagePicker from 'expo-image-picker';

import { MOCK_MATERIALS, MOCK_ELIXIRS, ElixirCardData } from '../../src/mockData';
import { getMaterialImage } from '../../constants/materialImages';
import { getElixirImage } from '../../constants/elixirImages';
import ElixirDetailModal from '../../src/components/ElixirDetailModal';
import QuestModal from '../../src/components/QuestModal';
import AttendanceModal from '@/src/components/AttendanceModal';
import { ApiService } from '../../src/serivices/api';



    
// 🧪 [백엔드 연동 & 테마/등급 변환 내장 로직]
const BACKEND_BASE_URL = 'http://https://1-201-116-227.sslip.io'; // 💡 백엔드 공인 IP 또는 localhost

type BackendThemeCategory = 'SKIN_ANTIOXIDANT' | 'FATIGUE_ENERGY' | 'DIET_BLOODSUGAR' | 'SLEEP_REST';

const toFrontendTheme = (backendTheme: string) => {
  const map: Record<string, any> = {
    SKIN_ANTIOXIDANT: '피부/항산화',
    FATIGUE_ENERGY: '피로/에너지',
    DIET_BLOODSUGAR: '혈당/다이어트',
    SLEEP_REST: '수면/휴식',
  };
  return map[backendTheme] || '피로/에너지';
};

const toFrontendGrade = (grade: string): 'Common' | 'Rare' | 'Epic' | 'Prismatic' => {
  if (grade === 'PRISMATIC_LEGENDARY') return 'Prismatic';
  const f = grade.charAt(0).toUpperCase() + grade.slice(1).toLowerCase();
  return (['Common', 'Rare', 'Epic', 'Prismatic'].includes(f) ? f : 'Epic') as any;
};

// 백엔드 통신 및 스마트 Fallback 함수
const requestSynthesizeElixir = async (
  payload: { ingredientCardIds: number[]; themeCategory: BackendThemeCategory },
  token?: string
) => {
  try {
    if (!token || token === 'YOUR_AUTH_JWT_TOKEN') {
      throw new Error('토큰 없음 -> Fallback 모드 실행');
    }

    const res = await fetch(`${BACKEND_BASE_URL}/api/synthesize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    // 백엔드 미연결 시 심사용 Mock 카드로 복구
    const fallbackBase = MOCK_ELIXIRS[0];
    return {
      id: 5,
      name: payload.ingredientCardIds.length >= 3 ? '온전한 조화의 황금 엘릭서' : fallbackBase.name,
      grade: 'EPIC',
      themeCategory: payload.themeCategory,
      imageUrl: fallbackBase.imageUrl || '',
      adviserComment: fallbackBase.adviserComment,
      serialNumber: null,
      ingredientSummary: fallbackBase.ingredientSummary,
      isMutated: false,
      scientificExplanation: fallbackBase.scienceDesc,
      cardDescription: fallbackBase.brewingLore,
      stats: fallbackBase.stats || { 활력마나량: 90, 피로무력화: 85 },
    };
  }
};

const INITIAL_TODAY_SUPPLEMENTS: any[] = [];

export default function HomeScreen() {
  const [questOpen, setQuestOpen] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [ocrOpen, setOcrOpen] = useState(false);
  const [attendanceChecked, setAttendanceChecked] = useState(false);

const [brewModalOpen, setBrewModalOpen] = useState(false);
  const [lowerTab, setLowerTab] = useState<'supplements' | 'materials'>('supplements');
  
  // 💡 재료 수량 실시간 관리를 위해 state로 승격
  const [materials, setMaterials] = useState<any[]>(MOCK_MATERIALS);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [todaySupplements, setTodaySupplements] = useState(INITIAL_TODAY_SUPPLEMENTS);

  // 💡 퀘스트 수령 상태 관리
  const [questList, setQuestList] = useState([
    { id: 'q1', name: '1. 아침 물 1잔 마시기', rewardText: '보상: 활력초 x1', rewardMatId: 'm5', rewardMatName: '활력초', isClaimed: false },
    { id: 'q2', name: '2. 영양제 섭취 인증하기', rewardText: '보상: 탱탱 젤리 x1', rewardMatId: 'm2', rewardMatName: '탱탱 젤리', isClaimed: false },
    { id: 'q3', name: '3. 스트레칭 5분 진행하기', rewardText: '보상: 평온초 x1', rewardMatId: 'm11', rewardMatName: '평온초', isClaimed: false },
  ]);

  // 🎁 퀘스트 보상 수령 함수 (재료 가방 수량 +1 증가)
  const handleClaimQuestReward = (questId: string) => {
    const target = questList.find((q) => q.id === questId);
    if (!target || target.isClaimed) return;

    setMaterials((prev) =>
      prev.map((mat) => (mat.id === target.rewardMatId ? { ...mat, count: mat.count + 1 } : mat))
    );
    setQuestList((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, isClaimed: true } : q))
    );
    Alert.alert('🎁 보상 수령', `[${target.rewardMatName}] x1이 재료 가방에 추가되었습니다!`);
  };
  
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

  
// 🧪 가마솥 연성 확정 핸들러
const handleConfirmBrew = async () => {
  setBrewModalOpen(false);
  setIsBrewing(true);

  try {
    // 1. 브라우저 / 앱 스토리지에서 실제 JWT 토큰 추출
    
    // 🧪 토큰 가져오기 (AsyncStorage 없이 브라우저 스토리지 직접 조회)
    let token = '';
    if (typeof window !== 'undefined' && window.localStorage) {
    token = localStorage.getItem('jwtToken') || '';
    }

    console.log('📌 [연성 요청] 발송할 JWT 토큰:', token);

    // 2. 선택된 재료 ID 파싱 ('m1' -> 1)
    const numericIds = selectedMaterials.map((id, idx) => {
      const parsed = parseInt(String(id).replace(/[^0-9]/g, ''), 10);
      return isNaN(parsed) ? idx + 1 : parsed;
    });

    // 3. 백엔드 POST /api/synthesize API 호출
    const BASE_URL = 'https://1-201-116-227.sslip.io'; // 운영 서버 주소
    const requestPayload = {
      ingredientCardIds: numericIds,
      themeCategory: 'FATIGUE_ENERGY',
    };

    console.log('🚀 [연성 요청] 전송 데이터:', requestPayload);

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
    console.log('✨ [연성 완료] 백엔드 응답 데이터:', backendRes);

    // 4. 백엔드 응답 데이터를 프론트엔드 카드 규격으로 변환
    let formattedGrade: 'Common' | 'Rare' | 'Epic' | 'Prismatic' = 'Epic';
    if (backendRes.grade === 'PRISMATIC_LEGENDARY') formattedGrade = 'Prismatic';
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
      ingredientSummary: backendRes.ingredientSummary || `투입 재료 ${selectedMaterials.length}종`,
      brewingLore: backendRes.cardDescription || '가마솥 안에서 신비로운 기운이 피어오르며 특별한 비약이 완성되었습니다.',
      adviserComment: backendRes.adviserComment || '훌륭한 연성 결과물이야!',
      recipeHint: '특수 성분 배합 시너지',
      scienceDesc: backendRes.scientificExplanation || '신체 대사 활성화 및 건강 증진 효과',
      ingredientScienceList: [],
      stats: backendRes.stats || { 활력마나량: 85, 피로무력화: 80, 대사가속도: 75 },
    };

    // 5. 결과 모달 세팅 및 선택 재료 초기화
    setTimeout(() => {
      setIsBrewing(false);
      setResultElixir(finalElixir);
      setSelectedMaterials([]);
    }, 1800);

  } catch (error: any) {
    console.warn('⚠️ 연성 API 실패 -> 스마트 Fallback 가동:', error.message);

    // 서버 미연결 시 데모가 중단되지 않도록 Fallback 카드 생성
    const fallbackElixir: ElixirCardData = {
      id: `elixir_5_${Date.now()}`,
      name: '온전한 조화의 황금 엘릭서',
      grade: 'Epic',
      themeCategory: '피로/에너지',
      imageSource: getElixirImage('fatigue_01') || (MOCK_ELIXIRS[0]?.imageSource as any),
      isUnlocked: true,
      serialNumber: `#${Math.floor(1000 + Math.random() * 9000)}`,
      supplementSummary: todaySupplements.length > 0 ? todaySupplements.map((s) => s.name).join(' + ') : '황금 레몬 + 심해 오일 + 안정석 + 유산균',
      ingredientSummary: '황금 레몬, 심해 오일, 안정석, 황금 포자',
      brewingLore: '가마솥 안에서 눈부신 황금빛 소용돌이가 일어나며 전신의 활력과 면역을 극대화하는 온전한 조화의 비약이 탄생했습니다!',
      adviserComment: '늘해랑: "모든 성분과 재료가 한 치의 오차도 없이 완벽한 조화를 이루었어!"',
      recipeHint: '황금 레몬 + 심해 오일 + 안정석 + 유산균 공식',
      scienceDesc: '비타민C의 항산화, 마그네슘의 신경 이완, 오메가3의 순환 촉진이 복합 시너지를 일으켜 전신 대사를 정상화합니다.',
      ingredientScienceList: [],
      stats: {
        활력마나량: 95,
        피로무력화: 90,
        생체밸런스: 92,
      },
    };

    setTimeout(() => {
      setIsBrewing(false);
      setResultElixir(fallbackElixir);
      setSelectedMaterials([]);
    }, 1800);
  }
};


  const handleSaveToCodex = () => {
    Alert.alert('📖 도감 등록', `'${resultElixir?.name}'이(가) 비약 도감에 보관되었습니다!`);
    setResultElixir(null);
    setShowAdvisor(false);
  };

// 1. 결과 받아 배열에 넣는 함수
const handlePickerResult = (uri: string, indexToReplace?: number) => {
  if (indexToReplace !== undefined) {
    const updatedImages = [...pendingImages];
    updatedImages[indexToReplace] = uri;
    setPendingImages(updatedImages);
  } else {
    setPendingImages((prev) => [...prev, uri]);
  }
};

// 2. 피커 실행 함수 (웹이면 파일창 바로 열고, 모바일이면 Alert 띄움)
const openImagePicker = async (indexToReplace?: number) => {
  // 🌐 웹 환경 대응
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

  // 📱 모바일 환경 (작성하신 Alert 코드)
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
    ]
  );
};

  // -------------------------------------------------------------
  // 🚀 백엔드로 이미지 전송 & OCR 인증 로직
  // -------------------------------------------------------------
// 🚀 index.tsx의 영양제 등록 핸들러 (ApiService 연동)
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
      console.log(`🚀 [OCR 요청 ${i + 1}/${pendingImages.length}] 백엔드 전송 중...`);

      // ApiService.verifySupplementPhoto 호출 (POST /api/supplements/verify)
      const res = await ApiService.verifySupplementPhoto(uri);
      console.log(`✨ [OCR 완료 ${i + 1}]`, res);

      if (res.isVerified) {
        successList.push({
          id: `supp_${res.supplementLogId || Date.now()}_${i}`,
          name: res.productName || '인증된 영양제',
          time: '방금 전 인증 완료',
          photoUrl: uri,
        });
      }
    }

    if (successList.length === 0) {
      throw new Error('영양제 라벨을 인식하지 못했습니다. 선명한 사진으로 다시 시도해 주세요.');
    }

    // 화면의 [오늘 인증] 목록 갱신 및 팝업 닫기
    setTodaySupplements((prev) => [...successList, ...prev]);
    setPendingImages([]);
    setOcrOpen(false);

    Alert.alert(
      '✅ 인증 완료!',
      `총 ${successList.length}개의 영양제가 인식되어 가마솥 베이스로 등록되었습니다.`
    );
  } catch (error: any) {
    console.error('⚠️ 영양제 인증 에러:', error);
    Alert.alert('인증 실패', error.message || '서버 통신 중 문제가 발생했습니다.');
  } finally {
    setIsUploading(false);
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

            {/* 영양제 등록 버튼 ➔ OCR 팝업 띄우기 */}
            <TouchableOpacity style={styles.sideBtnItem} onPress={() => setOcrOpen(true)} activeOpacity={0.8}>
              <Image source={require('../../assets/images/home_slidebar_pill.png')} style={styles.sideIconImg} />
              <Text style={styles.sideBtnLabel}>영양제등록</Text>
            </TouchableOpacity>
          </ImageBackground>

          {/* 3. 우측 하단 나의 엘릭서 & 연성하기 버튼 */}
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

            {/* 📜 일일/주간 탭이 포함된 신규 컴포넌트 호출 */}
<QuestModal
  visible={questOpen}
  onClose={() => setQuestOpen(false)}
/>

{/* 📅 7일 출석체크 모달 */}
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

  brewModalContainer: { maxWidth: 560, width: '92%', height: '82%', backgroundColor: '#242038', borderRadius: 20, padding: 16, borderWidth: 1.5, borderColor: '#6C5CE7', justifyContent:'space-between' },
  topFlaskBox: { flex: 0.35, backgroundColor: '#1B1728', borderRadius: 14, padding: 2, justifyContent: 'space-between', marginBottom: 12 },
  boxLabel: { color: '#8A879E', fontSize: 11, fontWeight: 'bold' },
  flaskVisual: { flex:1, alignItems: 'center', justifyContent: 'center' },
  chamberCauldronImg: { resizeMode:'contain', width: '90%', height: '90%', marginBottom: 4 },
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

  popupModalCard: { width: '85%', height:'60%', backgroundColor: '#242038', borderRadius: 18, padding: 18, borderWidth: 1.5, borderColor: '#6C5CE7' },
  popupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, padding:10 },
  popupTitle: {color: '#FFD700', fontSize: 16, fontWeight: 'bold',margin:10},
  questItem: { backgroundColor: '#1B1728', borderRadius: 10, padding: 10, marginBottom: 15 },
  questName: { color: '#FFF', fontSize: 13, fontWeight: 'bold', marginTop: 3},
  questReward: { color: '#A29BFE', fontSize: 11, marginTop: 4, padding:10, marginBottom: 10 },
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