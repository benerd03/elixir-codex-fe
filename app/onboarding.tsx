import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Image,
  Alert,
  ScrollView,
  TextInput,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { NPC_IMAGES, NpcEmotion } from '../constants/npcImages';
import { getElixirImage } from '../constants/elixirImages';
import { Platform } from 'react-native'; // 👈 Platform이 임포트되어 있는지 확인!

const { width } = Dimensions.get('window');

// 등록된 영양제 사진 객체 규격
interface SupplementPhotoItem {
  id: string;
  uri: string;
  name: string;
}

// 시그니처 엘릭서 데이터 규격
interface SignatureElixir {
  name: string;
  grade: 'Epic' | 'Prismatic';
  imageSource: any;
  brewingLore: string;
  adviserComment: string;
  scienceDesc: string;
  stats: {
    회복탄력도: number;
    피로저항력: number;
    생체활력도: number;
  };
}

// 대화 단계 규격
interface DialogueItem {
  speakerType: 'player' | 'unknown' | 'neulhaerang';
  speakerName: string;
  text: string;
  emotion?: NpcEmotion;
  showNpc: boolean;
  isInnerThought?: boolean;
  requiresPhotoAction?: boolean;
  requiresTextInput?: boolean; // 💡 건강 고민 직접 입력 단계 여부
}

const RANDOM_ELIXIR_ART_POOL = [
  'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=600',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600',
  'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?w=600',
  'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600',
  'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600',
  'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600',
];

const LOCAL_ELIXIR_KEYS = [
  'energy_01', 'energy_02', 'skin_01', 'skin_02', 'diet_01', 'diet_02', 'sleep_01', 'sleep_02'
];

export default function OnboardingScreen() {
  const router = useRouter();

  const [dialogIndex, setDialogIndex] = useState<number>(0);

  // 📝 유저가 입력한 건강 고민 / 아픈 곳 상태 (freeText)
  const [userPainText, setUserPainText] = useState<string>('');

  // 영양제 사진 목록 상태
  const [photoList, setPhotoList] = useState<SupplementPhotoItem[]>([]);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState<boolean>(false);

  // 컷씬 및 연성 결과 카드 상태
  const [showTowerCutscene, setShowTowerCutscene] = useState<boolean>(false);
  const [isBrewing, setIsBrewing] = useState<boolean>(false);
  const [signatureElixir, setSignatureElixir] = useState<SignatureElixir | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState<boolean>(false);

  // 대화 시퀀스 정의 (건강 고민 입력 단계 추가)
  const dialogues: DialogueItem[] = [
    { speakerType: 'player', speakerName: '용사', text: '윽.. 머리야...', showNpc: false },
    { speakerType: 'player', speakerName: '용사', text: '여기가 어디지...?', showNpc: false },
    { speakerType: 'unknown', speakerName: '???', text: '괜찮으세요...?! 정신이 드시나요?', emotion: 'sad', showNpc: true },
    { speakerType: 'player', speakerName: '용사', text: '누구지...? 온몸이 쑤시고 아파서 말이 잘 안 나온다...', emotion: 'sad', showNpc: true },
    { speakerType: 'neulhaerang', speakerName: '늘해랑', text: '저런! 용사님이 많이 다치신 모양이에요!\n최고의 연금술사 저 늘해랑이 도와드려야겠어요!', emotion: 'happy', showNpc: true },
    { speakerType: 'neulhaerang', speakerName: '늘해랑', text: '어디가 어떻게 아프신지 자세히 알려주시겠어요?', emotion: 'normal', showNpc: true, requiresTextInput: true }, // 💡 직접 입력 단계
    { speakerType: 'neulhaerang', speakerName: '늘해랑', text: '부작용이 나면 안 되니까.. 그동안 용사님이 건강을 위해 드시던 것들을 전부 알려주시겠어요?', emotion: 'normal', showNpc: true, requiresPhotoAction: true },
    { speakerType: 'neulhaerang', speakerName: '늘해랑', text: '아아 이제야 알겠네요... 저를 얼른 따라오세요.\n당장 용사님만을 위한 첫 번째 엘릭서를 만들어 드릴게요!', emotion: 'happy', showNpc: true },
    { speakerType: 'neulhaerang', speakerName: '늘해랑', text: '용사님 상처가 생각보다 심각하군요..\n이 탑에 머물면서 저의 치료를 받으시는 게 낫겠어요!', emotion: 'sad', showNpc: true },
    { speakerType: 'neulhaerang', speakerName: '늘해랑', text: '(후후후.. 신약을 시도해볼 기회다...!)', emotion: 'angry', showNpc: true, isInnerThought: true },
  ];

  const currentDialogue = dialogues[dialogIndex];

  const handleAddFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '카메라 촬영을 위해 권한 허용이 필요합니다.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      appendPhoto(result.assets[0].uri);
    }
  };

  const handleAddFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      appendPhoto(result.assets[0].uri);
    }
  };

  const appendPhoto = (uri: string) => {
    const defaultNames = [
      '멀티비타민 & 미네랄',
      '고함량 글루타치온 복합제',
      '밀크씨슬 & 비타민B군',
      '오메가-3 트리플 파워',
      '마그네슘 & 테아닌 휴식팩',
    ];
    const pickedName = defaultNames[photoList.length % defaultNames.length];
    const newPhoto: SupplementPhotoItem = {
      id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      uri,
      name: `${pickedName} #${photoList.length + 1}`,
    };
    setPhotoList((prev) => [...prev, newPhoto]);
  };

  const handleRemovePhoto = (id: string) => {
    setPhotoList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleConfirmAllPhotos = () => {
    if (photoList.length === 0) {
      Alert.alert('사진 등록 필요', '최소 1장 이상의 영양제 사진을 등록해 주세요!');
      return;
    }
    setIsPhotoModalOpen(false);
    setDialogIndex(7); // 영양제 등록 완료 후 다음 대화("아아 이제야 알겠네요...")로 이동
  };

  // 대화창 터치 핸들러
  const handleAdvanceDialogue = () => {
    // 5번 대사(건강 고민 입력)에서 텍스트가 비어있으면 막기
    if (currentDialogue.requiresTextInput && !userPainText.trim()) {
      Alert.alert('입력 필요', '어디가 아프신지 늘해랑에게 이야기해 주세요!');
      return;
    }

    // 6번 대사(영양제 사진 추가)에서 사진이 없으면 모달 열기
    if (currentDialogue.requiresPhotoAction && photoList.length === 0) {
      setIsPhotoModalOpen(true);
      return;
    }

    // 7번 대사 후 터치 시 암전 & 백엔드 연성 시퀀스 시작
    if (dialogIndex === 7) {
      triggerTowerBrewingSequence();
      return;
    }

    // 마지막 대사 후 온보딩 종료
    if (dialogIndex === dialogues.length - 1) {
      finishOnboarding();
      return;
    }

    setDialogIndex((prev) => prev + 1);
  };

  // 프론트 안전 폴백 생성기
  const generateFallbackElixir = (): SignatureElixir => {
    const prefixes = ['새벽의 맥박을 깨우는', '칠흑의 어둠을 가르는', '용의 숨결을 품은', '태고의 달빛에 물든', '성스러운 에테르의', '황금빛 태양을 삼킨'];
    const roots = ['심연의', '영혼', '생명', '신속', '정화', '혈류', '기적의', '시공간'];
    const types = ['정수', '엘릭서', '비약', '농축액', '앰플', '비전 물약'];
    const randomName = `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${roots[Math.floor(Math.random() * roots.length)]} ${types[Math.floor(Math.random() * types.length)]}`;
    
    let selectedImageSource: any = null;
    if (Math.random() > 0.5 && typeof getElixirImage === 'function') {
      const randomKey = LOCAL_ELIXIR_KEYS[Math.floor(Math.random() * LOCAL_ELIXIR_KEYS.length)];
      selectedImageSource = getElixirImage(randomKey);
    }
    if (!selectedImageSource) {
      const randomUrl = RANDOM_ELIXIR_ART_POOL[Math.floor(Math.random() * RANDOM_ELIXIR_ART_POOL.length)];
      selectedImageSource = { uri: randomUrl };
    }

    return {
      name: randomName,
      grade: Math.random() > 0.3 ? 'Epic' : 'Prismatic',
      imageSource: selectedImageSource,
      brewingLore: `용사님의 고민 [${userPainText}]과 영양제 성분 파동이 늘해랑의 가마솥에서 반응하여 추출되었습니다.`,
      adviserComment: `"상처 입은 몸에 즉각 활력을 불어넣어 줄 거야!"`,
      scienceDesc: `항산화 활성 작용기와 복합 비타민 조효소가 체내 대사 회로를 가동합니다.`,
      stats: {
        회복탄력도: Math.floor(88 + Math.random() * 12),
        피로저항력: Math.floor(85 + Math.random() * 15),
        생체활력도: Math.floor(90 + Math.random() * 10),
      },
    };
  };

// 🌑 컷씬 및 백엔드 API 연동 시퀀스 (이미지 로딩 완벽 방어형)
  const triggerTowerBrewingSequence = async () => {
    setShowTowerCutscene(true);
    setIsBrewing(true);

    // 1. 실제 백엔드 가비아 공인 IP 서버 주소
    const SERVER_URL = 'https://1-201-116-227.sslip.io';

    // 2. 로그인 시 저장된 실제 JWT 토큰 가져오기
 let authToken = '';

if (typeof window !== 'undefined' && window.localStorage) {
  authToken = window.localStorage.getItem('jwtToken') || '';
}

// 🔍 디버깅용: 콘솔에 진짜 토큰이 찍히는지 확인
console.log('📌 백엔드로 전송할 토큰:', authToken);

if (!authToken || authToken.startsWith('test-mock') || authToken.startsWith('mock-jwt')) {
  console.warn('⚠️ 진짜 JWT 토큰이 없습니다. 백엔드 로그인 후 다시 시도해야 합니다.');
}

    try {
      const registeredNames = photoList.map((p) => p.name).join(', ');
      const combinedFreeText = `고민/증상: ${userPainText} / 복용 중인 영양제: ${registeredNames || '없음'}`;

      // 🚀 백엔드 명세서 v1.1 규격: Authorization 헤더 포함 호출
      const response = await fetch(`${SERVER_URL}/api/special-elixirs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ freeText: combinedFreeText }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.message || `서버 응답 오류 (HTTP ${response.status})`);
      }

      const resData = await response.json();
      console.log('📦 백엔드 응답 데이터 원본:', resData);

      // 🔍 백엔드가 반환한 이미지 URL 키값 안전 추출 (imageUrl, image_url, url 등)
      const rawImgUrl = resData.imageUrl || resData.image_url || resData.url || resData.image;

      // 🖼️ AI 생성 이미지 우선, 없거나 유효하지 않으면 로컬 에셋/폴백 풀에서 무조건 연결
      let finalImageSource: any = null;
      if (rawImgUrl && typeof rawImgUrl === 'string' && rawImgUrl.startsWith('http')) {
        finalImageSource = { uri: rawImgUrl };
      } else {
        finalImageSource = getElixirImage('energy_01') || { uri: RANDOM_ELIXIR_ART_POOL[0] };
      }

      setTimeout(() => {
        setShowTowerCutscene(false);
        setIsBrewing(false);

        const serverElixir: SignatureElixir = {
          name: resData.name || '늘해랑의 특제 신비 비약',
          grade: resData.grade === 'PRISMATIC_LEGENDARY' ? 'Prismatic' : 'Epic',
          imageSource: finalImageSource,
          brewingLore: resData.cardDescription || resData.brewingLore || '용사님의 상태를 진단하여 연성된 맞춤형 비약입니다.',
          adviserComment: resData.adviserComment || '"이 포션이 용사님의 아픔을 싹 낫게 해줄 거야!"',
          scienceDesc: resData.scientificExplanation || resData.scienceDesc || '맞춤형 영양 성분이 대사 회로를 활성화합니다.',
          stats: resData.stats || {
            회복탄력도: 95,
            피로저항력: 90,
            생체활력도: 92,
          },
        };

        setSignatureElixir(serverElixir);
        setIsCardModalOpen(true);
      }, 2300);

    } catch (error: any) {
      console.warn('백엔드 API 미연결 또는 응답 오류 발생 -> 안전 폴백 데이터 실행:', error.message);
      setTimeout(() => {
        setShowTowerCutscene(false);
        setIsBrewing(false);
        const fallbackCard = generateFallbackElixir();
        setSignatureElixir(fallbackCard);
        setIsCardModalOpen(true);
      }, 2300);
    }
  };

  const handleCloseCardModal = () => {
    setIsCardModalOpen(false);
    setDialogIndex(8); // 카드 확인 후 마지막 8번 대화로 복귀
  };

// 온보딩 최종 완료 / 모험 시작 함수
const finishOnboarding = () => {
  if (Platform.OS === 'web') {
    // 💡 웹 전용 브라우저 알림 및 강제 라우팅
    window.alert('✨ 연금술사의 탑 도착\n앞으로 늘해랑을 도우며 건강을 회복하자.');
    router.replace('/(tabs)');
  } else {
    // 📱 모바일 전용 네이티브 알림
    Alert.alert(
      '✨ 연금술사의 탑 도착',
      '앞으로 늘해랑을 도우며 건강을 회복하자.',
      [
        {
          text: '모험 시작하기 ➔',
          onPress: () => router.replace('/(tabs)'),
        },
      ]
    );
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundCanvas}>
        <View style={styles.ambientTopGlow} />
      </View>

      <View style={styles.topSceneArea}>
        {dialogIndex <= 1 && (
          <View style={styles.darkIntroCenter}>
            <Text style={styles.darkIntroText}>눈앞이 어두워집니다...</Text>
          </View>
        )}
      </View>

      <View style={styles.bottomDialogueContainer}>
        {currentDialogue.showNpc && currentDialogue.emotion && (
          <View style={styles.npcImageWrapper} pointerEvents="none">
            <Image
              source={NPC_IMAGES[currentDialogue.emotion]}
              style={styles.npcAvatar}
              resizeMode="contain"
            />
          </View>
        )}

        <TouchableOpacity
          activeOpacity={0.88}
          style={[
            styles.dialogueBox,
            currentDialogue.isInnerThought && styles.dialogueBoxInnerThought,
          ]}
          onPress={handleAdvanceDialogue}
        >
          <View
            style={[
              styles.nameTag,
              currentDialogue.speakerType === 'unknown' && styles.nameTagUnknown,
              currentDialogue.speakerType === 'player' && styles.nameTagPlayer,
            ]}
          >
            <Text style={styles.nameTagText}>
              {currentDialogue.isInnerThought ? '늘해랑의 속마음' : currentDialogue.speakerName}
            </Text>
          </View>

          <View style={styles.dialogueContentWrapper}>
            <Text
              style={[
                styles.dialogueText,
                currentDialogue.isInnerThought && styles.innerThoughtText,
              ]}
            >
              {currentDialogue.text}
            </Text>
          </View>

          {/* 📝 건강 고민 직접 입력 영역 */}
          {currentDialogue.requiresTextInput && (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.painTextInput}
                placeholder="예: 요즘 야근이 잦아서 아침에 일어나기 힘들고 온몸이 쑤셔요"
                placeholderTextColor="#6D6882"
                value={userPainText}
                onChangeText={setUserPainText}
                multiline
              />
              <TouchableOpacity
                style={styles.submitPainBtn}
                onPress={handleAdvanceDialogue}
              >
                <Text style={styles.submitPainBtnText}>늘해랑에게 말하기 ➔</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 📸 영양제 사진 추가 버튼 */}
          {currentDialogue.requiresPhotoAction && (
            <TouchableOpacity
              style={styles.photoActionButton}
              onPress={() => setIsPhotoModalOpen(true)}
            >
              <Text style={styles.photoActionButtonText}>
                📸 {photoList.length > 0 ? `영양제 사진 수정 (${photoList.length}개 등록됨)` : '영양제 사진 추가하기'}
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.nextIndicator}>
            <Text style={styles.nextIndicatorText}>▼</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 영양제 다중 등록 모달 */}
      <Modal visible={isPhotoModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.ocrPopupModalCard}>
            <Text style={styles.ocrPopupTitle}>💊 영양제 사진 다중 등록</Text>
            <Text style={styles.ocrDescText}>
              평소 드시던 영양제나 보조제를 직접 촬영하거나 앨범에서 여러 장 등록해 보세요!
            </Text>

            <ScrollView horizontal style={styles.ocrImageScroll} showsHorizontalScrollIndicator={false}>
              {photoList.map((item) => (
                <View key={item.id} style={styles.ocrThumbBox}>
                  <Image source={{ uri: item.uri }} style={styles.ocrThumbImg} resizeMode="cover" />
                  <TouchableOpacity
                    style={styles.ocrDeleteBadge}
                    onPress={() => handleRemovePhoto(item.id)}
                  >
                    <Text style={styles.ocrDeleteText}>✕</Text>
                  </TouchableOpacity>
                  <View style={styles.ocrNameTag}>
                    <Text style={styles.ocrNameTagText} numberOfLines={1}>
                      {item.name}
                    </Text>
                  </View>
                </View>
              ))}

              <View style={styles.addBtnContainer}>
                <TouchableOpacity style={styles.ocrAddBox} onPress={handleAddFromCamera}>
                  <Text style={styles.addIcon}>📸</Text>
                  <Text style={styles.addText}>촬영하기</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.ocrAddBox} onPress={handleAddFromGallery}>
                  <Text style={styles.addIcon}>🖼️</Text>
                  <Text style={styles.addText}>앨범선택</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.confirmAllBtn,
                photoList.length === 0 && styles.confirmAllBtnDisabled,
              ]}
              onPress={handleConfirmAllPhotos}
            >
              <Text style={styles.confirmAllBtnText}>
                ✨ {photoList.length > 0 ? `${photoList.length}개의 영양제 등록 확정` : '사진을 추가해 주세요'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setIsPhotoModalOpen(false)}>
              <Text style={styles.closeBtnText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 컷씬 모달 */}
      <Modal visible={showTowerCutscene} transparent animationType="fade">
        <View style={styles.towerCutsceneContainer}>
          <Text style={styles.towerCutsceneText}>연금술사의 탑...</Text>
        </View>
      </Modal>

      {/* 연성 중 로딩 */}
      <Modal visible={isBrewing} transparent animationType="fade">
        <View style={styles.brewingModalOverlay}>
          <View style={styles.brewingCard}>
            <ActivityIndicator size="large" color="#FFD700" />
            <Text style={styles.brewingTitle}>용사님의 상태를 분석하여 비약을 연성 중입니다...</Text>
            <Text style={styles.brewingSub}>
              고민과 {photoList.length}가지 영양 성분을 융합하고 있습니다.
            </Text>
          </View>
        </View>
      </Modal>

      {/* 랜덤 엘릭서 결과 카드 */}
      <Modal visible={isCardModalOpen && !!signatureElixir} transparent animationType="slide">
        <View style={styles.cardModalOverlay}>
          <View style={styles.signatureCard}>
            <View style={styles.cardBadge}>
              <Text style={styles.cardBadgeText}>✨ SPECIAL ONBOARDING ELIXIR ✨</Text>
            </View>
            <Text style={styles.cardElixirName}>{signatureElixir?.name}</Text>

            <ScrollView style={styles.cardScrollView} showsVerticalScrollIndicator={false}>
{/* 🔮 연성 완료 포션 이미지 렌더링 (웹/네이티브 100% 보장형) */}
              <View style={styles.cardImageFrame}>
                <Image
                  source={
                    signatureElixir?.imageSource
                      ? (typeof signatureElixir.imageSource === 'number'
                          ? signatureElixir.imageSource
                          : signatureElixir.imageSource.uri
                          ? { uri: signatureElixir.imageSource.uri }
                          : typeof signatureElixir.imageSource === 'string'
                          ? { uri: signatureElixir.imageSource }
                          : { uri: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=600' })
                      : { uri: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=600' }
                  }
                  style={{
                    width: 170,
                    height: 170,
                  }}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.cardDetailSection}>
                <Text style={styles.sectionTitle}>💬 늘해랑의 조언</Text>
                <Text style={styles.sectionComment}>{signatureElixir?.adviserComment}</Text>
              </View>

              <View style={styles.cardDetailSection}>
                <Text style={styles.sectionTitle}>📜 비약 탄생 비화</Text>
                <Text style={styles.sectionLore}>{signatureElixir?.brewingLore}</Text>
              </View>

              <View style={styles.cardDetailSection}>
                <Text style={styles.sectionTitle}>🔬 생체 영양 기전</Text>
                <Text style={styles.sectionLore}>{signatureElixir?.scienceDesc}</Text>
              </View>

              <View style={styles.statGrid}>
                <Text style={styles.statBadge}>
                  💖 회복탄력도 <Text style={styles.statVal}>+{signatureElixir?.stats.회복탄력도}</Text>
                </Text>
                <Text style={styles.statBadge}>
                  🛡️ 피로저항력 <Text style={styles.statVal}>+{signatureElixir?.stats.피로저항력}</Text>
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.cardConfirmButton} onPress={handleCloseCardModal}>
              <Text style={styles.cardConfirmButtonText}>비약 확인 완료 ➔</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0711' },
  backgroundCanvas: { ...StyleSheet.absoluteFillObject, backgroundColor: '#0D0914' },
  ambientTopGlow: {
    position: 'absolute', top: -100, alignSelf: 'center',
    width: width * 1.2, height: 350, borderRadius: 200,
    backgroundColor: '#38225E', opacity: 0.35,
  },
  topSceneArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  darkIntroCenter: { paddingHorizontal: 20, paddingVertical: 10 },
  darkIntroText: { color: '#63597A', fontSize: 14, fontStyle: 'italic', letterSpacing: 1 },
  bottomDialogueContainer: {
    width: '100%', maxWidth: 600, alignSelf: 'center',
    paddingHorizontal: 14, paddingBottom: 20, position: 'relative', justifyContent: 'flex-end',
  },
  npcImageWrapper: {
    position: 'absolute', right: 10, bottom: 130, width: 170, height: 190,
    zIndex: 2, justifyContent: 'flex-end', alignItems: 'center',
  },
  npcAvatar: { width: 165, height: 180 },
  dialogueBox: {
    backgroundColor: '#161124EE', borderRadius: 16, borderWidth: 1.5, borderColor: '#7E61B9',
    paddingHorizontal: 16, paddingTop: 18, paddingBottom: 14, minHeight: 115,
    shadowColor: '#7E61B9', shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, zIndex: 1,
  },
  dialogueBoxInnerThought: { borderColor: '#E056FD', backgroundColor: '#200E2BEE' },
  nameTag: {
    position: 'absolute', top: -13, left: 16, backgroundColor: '#2A1D45',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, borderWidth: 1.2, borderColor: '#FFD700',
  },
  nameTagUnknown: { borderColor: '#A29BFE' },
  nameTagPlayer: { borderColor: '#00CEC9' },
  nameTagText: { color: '#FFD700', fontSize: 12, fontWeight: 'bold' },
  dialogueContentWrapper: { paddingRight: 75, marginTop: 2 },
  dialogueText: { color: '#FFFFFF', fontSize: 13.5, lineHeight: 20, fontWeight: '500' },
  innerThoughtText: { color: '#FFB8EB', fontStyle: 'italic' },
  
  // 📝 건강 고민 입력 스타일
  inputContainer: { marginTop: 10 },
  painTextInput: {
    backgroundColor: '#130E1F', borderRadius: 10, borderWidth: 1, borderColor: '#483566',
    padding: 10, color: '#FFF', fontSize: 12.5, minHeight: 60, marginBottom: 8, textAlignVertical: 'top',
  },
  submitPainBtn: {
    backgroundColor: '#E056FD', paddingVertical: 9, paddingHorizontal: 14, borderRadius: 8, alignSelf: 'flex-end',
  },
  submitPainBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },

  photoActionButton: {
    marginTop: 10, backgroundColor: '#E056FD', paddingVertical: 10,
    paddingHorizontal: 16, borderRadius: 10, alignSelf: 'flex-start',
  },
  photoActionButtonText: { color: '#FFF', fontSize: 12.5, fontWeight: 'bold' },
  nextIndicator: { position: 'absolute', right: 14, bottom: 8 },
  nextIndicatorText: { color: '#FFD700', fontSize: 11, opacity: 0.8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  ocrPopupModalCard: {
    width: '100%', maxWidth: 500, backgroundColor: '#242038',
    borderRadius: 20, padding: 20, borderWidth: 1.5, borderColor: '#6C5CE7', alignItems: 'center',
  },
  ocrPopupTitle: { color: '#FFD700', fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  ocrDescText: { color: '#A29BFE', fontSize: 12, lineHeight: 17, textAlign: 'center', marginBottom: 16 },
  ocrImageScroll: { flexDirection: 'row', maxHeight: 130, marginBottom: 16 },
  ocrThumbBox: {
    width: 100, height: 110, borderRadius: 12, borderWidth: 1.5, borderColor: '#E056FD',
    overflow: 'hidden', position: 'relative', marginRight: 10, backgroundColor: '#161124',
  },
  ocrThumbImg: { width: '100%', height: '75%' },
  ocrDeleteBadge: {
    position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(231, 76, 60, 0.9)',
    width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center',
  },
  ocrDeleteText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  ocrNameTag: { height: '25%', backgroundColor: '#1C142A', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  ocrNameTagText: { color: '#DDD', fontSize: 9.5 },
  addBtnContainer: { flexDirection: 'row', gap: 8 },
  ocrAddBox: {
    width: 80, height: 110, borderRadius: 12, borderWidth: 1.5, borderColor: '#483566',
    borderStyle: 'dashed', backgroundColor: '#1B1728', justifyContent: 'center', alignItems: 'center',
  },
  addIcon: { fontSize: 24, marginBottom: 4 },
  addText: { color: '#8A7A9E', fontSize: 11, fontWeight: 'bold' },
  confirmAllBtn: { width: '100%', backgroundColor: '#E056FD', paddingVertical: 13, borderRadius: 10, alignItems: 'center', marginBottom: 6 },
  confirmAllBtnDisabled: { backgroundColor: '#433758', opacity: 0.6 },
  confirmAllBtnText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  closeBtn: { paddingVertical: 6 },
  closeBtnText: { color: '#888', fontSize: 12 },
  towerCutsceneContainer: { flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' },
  towerCutsceneText: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold', letterSpacing: 4, fontStyle: 'italic' },
  brewingModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  brewingCard: {
    backgroundColor: '#1C142A', padding: 24, borderRadius: 16,
    borderWidth: 1.5, borderColor: '#FFD700', alignItems: 'center', gap: 10,
  },
  brewingTitle: { color: '#FFD700', fontSize: 14, fontWeight: 'bold', marginTop: 10 },
  brewingSub: { color: '#BBB', fontSize: 12 },
  cardModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  signatureCard: {
    width: '100%', maxWidth: 480, height: '84%', backgroundColor: '#181226',
    borderRadius: 18, borderWidth: 1.5, borderColor: '#FFD700', padding: 16,
  },
  cardBadge: { alignSelf: 'center', backgroundColor: '#FFD700', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 4, marginBottom: 6 },
  cardBadgeText: { color: '#130E1F', fontSize: 10, fontWeight: 'bold' },
  cardElixirName: { color: '#FFF', fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  cardScrollView: { flex: 1 },
  cardImageFrame: {
    width: '100%', height: 190, borderRadius: 12, overflow: 'hidden',
    backgroundColor: '#0F0B18', borderWidth: 1, borderColor: '#594483', marginBottom: 10,
    justifyContent: 'center', alignItems: 'center', padding: 10,
  },
  cardImage: { width: '100%', height: '100%', minHeight:180, },
  cardDetailSection: { backgroundColor: '#120D1D', borderRadius: 8, padding: 10, marginBottom: 8 },
  sectionTitle: { color: '#E056FD', fontSize: 11.5, fontWeight: 'bold', marginBottom: 3 },
  sectionComment: { color: '#FFF', fontSize: 11.5, fontStyle: 'italic', lineHeight: 16 },
  sectionLore: { color: '#DDD', fontSize: 11.5, lineHeight: 16 },
  statGrid: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#140D20', paddingVertical: 8, borderRadius: 8, marginBottom: 10 },
  statBadge: { color: '#AAA', fontSize: 11.5 },
  statVal: { color: '#FFD700', fontWeight: 'bold' },
  cardConfirmButton: { backgroundColor: '#FFD700', paddingVertical: 13, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  cardConfirmButtonText: { color: '#181226', fontSize: 13.5, fontWeight: 'bold' },
});