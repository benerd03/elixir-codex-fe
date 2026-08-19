// app/onboarding.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getElixirImage } from '../constants/elixirImages';

export default function OnboardingScreen() {
  const router = useRouter();

  // 온보딩 단계: 1(대화/텍스트입력) -> 2(첫 영양제인증) -> 3(연성로딩) -> 4(스페셜엘릭서결과)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [userPainText, setUserPainText] = useState('');
  const [supplementName, setSupplementName] = useState('데일리 멀티비타민 & 미네랄');
  const [isBrewing, setIsBrewing] = useState(false);

  // 1단계: 고민 텍스트 입력 완료
  const handleNextToSupplement = () => {
    if (!userPainText.trim()) {
      Alert.alert('알림', '늘해랑에게 현재 가장 불편하거나 챙기고 싶은 건강 고민을 들려주세요!');
      return;
    }
    setStep(2);
  };

  // 2단계: 첫 영양제 인증 및 스페셜 엘릭서 연성 시작
  const handleStartSpecialBrew = () => {
    setStep(3);
    setIsBrewing(true);

    // 3초간 가마솥 AI 연성 연출
    setTimeout(() => {
      setIsBrewing(false);
      setStep(4);
    }, 3000);
  };

  // 4단계: 스페셜 엘릭서 섭취 후 홈 화면으로 최종 진입
  const handleCompleteOnboarding = () => {
    Alert.alert('✨ 치유 완료!', '몸에 활력이 차오릅니다. 이제 매일 가마솥을 찾아와 주세요!', [
      {
        text: '홈으로 입장',
        onPress: () => router.replace('/(tabs)'),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentWrapper}>
        
        {/* 상단 늘해랑 NPC 프로필 영역 */}
        <View style={styles.npcHeaderArea}>
          <View style={styles.npcAvatarFrame}>
            <Text style={styles.npcAvatarIcon}>🧙‍♀️</Text>
          </View>
          <View style={styles.npcDialogueBubble}>
            <Text style={styles.npcName}>연금술사 늘해랑</Text>
            <Text style={styles.npcDialogueText}>
              {step === 1 && "용사님, 온몸이 상처투성이예요... 요즘 어디가 가장 불편하신가요?"}
              {step === 2 && "무슨 말씀인지 알겠어요! 오늘 드신 영양제를 가마솥에 넣어 첫 치료 비약을 만들어 드릴게요."}
              {step === 3 && "가마솥의 기운을 모아 용사님만을 위한 전설의 비약을 빚어내고 있어요..."}
              {step === 4 && "완성되었어요! 용사님의 아픔을 씻어내 줄 세상에 단 하나뿐인 스페셜 비약이에요."}
            </Text>
          </View>
        </View>

        {/* STEP 1: 고민 입력 화면 */}
        {step === 1 && (
          <View style={styles.stepBox}>
            <Text style={styles.inputLabel}>현재 건강 고민이나 상태를 적어주세요</Text>
            <TextInput
              style={styles.textInputArea}
              placeholder="예: 요즘 야근이 잦아서 아침에 일어나기 힘들고 눈이 피로해요."
              placeholderTextColor="#6D6882"
              multiline
              numberOfLines={4}
              value={userPainText}
              onChangeText={setUserPainText}
            />
            <TouchableOpacity style={styles.actionPrimaryBtn} onPress={handleNextToSupplement}>
              <Text style={styles.actionPrimaryBtnText}>늘해랑에게 이야기하기 ➔</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 2: 첫 영양제 촬영/인증 화면 */}
        {step === 2 && (
          <View style={styles.stepBox}>
            <Text style={styles.inputLabel}>오늘 챙겨 먹은 첫 번째 영양제</Text>
            <View style={styles.mockOcrFrame}>
              <Text style={styles.ocrIcon}>📸</Text>
              <Text style={styles.ocrResultName}>{supplementName}</Text>
              <Text style={styles.ocrSuccessBadge}>✓ 첫 온보딩 자동 인증 완료</Text>
            </View>
            <TouchableOpacity style={styles.actionPrimaryBtn} onPress={handleStartSpecialBrew}>
              <Text style={styles.actionPrimaryBtnText}>가마솥에 넣고 비약 연성하기 🔥</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 3: 연성 로딩 */}
        {step === 3 && (
          <View style={styles.loadingArea}>
            <ActivityIndicator size="large" color="#E056FD" />
            <Text style={styles.loadingText}>가마솥에서 황금빛 오라가 솟구칩니다...</Text>
          </View>
        )}

        {/* STEP 4: 🎴 첫 스페셜 엘릭서 완성 카드 */}
        {step === 4 && (
          <ScrollView contentContainerStyle={styles.resultCardScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.specialCardContainer}>
              <View style={styles.specialCardBadge}>
                <Text style={styles.specialCardBadgeText}>✨ SPECIAL ONBOARDING ELIXIR ✨</Text>
              </View>
              
              <Text style={styles.specialCardTitle}>새벽을 여는 영원의 안식수</Text>

              <View style={styles.specialArtFrame}>
                <Image
                  source={getElixirImage('skin_01')}
                  style={styles.specialImage}
                  resizeMode="cover"
                />
              </View>

              <View style={styles.specialStatsBox}>
                <Text style={styles.specialStatText}>💖 회복 탄력도: <Text style={styles.statBold}>99</Text></Text>
                <Text style={styles.specialStatText}>🛡️ 피로 저항력: <Text style={styles.statBold}>95</Text></Text>
              </View>

              <Text style={styles.specialAdviceText}>
                "{userPainText.trim()}" 라는 고민을 담아 빚어냈습니다. 매일 꾸준히 드시면 놀라운 변화가 찾아올 거예요!
              </Text>

              <TouchableOpacity style={styles.drinkCompleteBtn} onPress={handleCompleteOnboarding}>
                <Text style={styles.drinkCompleteBtnText}>꿀떡 마시고 모험 시작하기 🧪</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#130E1F' },
  contentWrapper: { flex: 1, paddingHorizontal: 16, maxWidth: 600, width: '100%', marginHorizontal: 'auto', paddingTop: 20 },
  
  // 늘해랑 대화창
  npcHeaderArea: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 20 },
  npcAvatarFrame: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#291C3E', borderWidth: 1.5, borderColor: '#E056FD', justifyContent: 'center', alignItems: 'center' },
  npcAvatarIcon: { fontSize: 30 },
  npcDialogueBubble: { flex: 1, backgroundColor: '#1C142A', borderRadius: 14, borderWidth: 1.2, borderColor: '#594483', padding: 12 },
  npcName: { color: '#FFD700', fontSize: 13, fontWeight: 'bold', marginBottom: 4 },
  npcDialogueText: { color: '#DDD', fontSize: 12.5, lineHeight: 18 },

  // 단계별 폼 박스
  stepBox: { backgroundColor: '#1C142A', borderRadius: 16, padding: 16, borderWidth: 1.2, borderColor: '#3E2F5E' },
  inputLabel: { color: '#E056FD', fontSize: 13, fontWeight: 'bold', marginBottom: 10 },
  textInputArea: { backgroundColor: '#100C1A', borderRadius: 12, borderWidth: 1, borderColor: '#483566', color: '#FFF', padding: 14, fontSize: 13, lineHeight: 19, textAlignVertical: 'top', minHeight: 110, marginBottom: 16 },
  actionPrimaryBtn: { backgroundColor: '#6C5CE7', paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#A29BFE' },
  actionPrimaryBtnText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },

  // 가짜 OCR 박스
  mockOcrFrame: { backgroundColor: '#100C1A', borderRadius: 14, padding: 20, alignItems: 'center', borderWidth: 1.2, borderColor: '#483566', marginBottom: 20 },
  ocrIcon: { fontSize: 40, marginBottom: 8 },
  ocrResultName: { color: '#FFF', fontSize: 15, fontWeight: 'bold', marginBottom: 6 },
  ocrSuccessBadge: { color: '#2ECC71', fontSize: 12, fontWeight: '600' },

  // 로딩
  loadingArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#E056FD', fontSize: 14, fontWeight: 'bold', marginTop: 16 },

  // 🎴 스페셜 엘릭서 카드
  resultCardScroll: { paddingBottom: 30 },
  specialCardContainer: { backgroundColor: '#201C34', borderRadius: 20, padding: 16, borderWidth: 2, borderColor: '#FFD700', alignItems: 'center' },
  specialCardBadge: { backgroundColor: '#FFD700', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6, marginBottom: 8 },
  specialCardBadgeText: { color: '#130E1F', fontSize: 10.5, fontWeight: 'bold' },
  specialCardTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  specialArtFrame: { width: '100%', height: 320, borderRadius: 14, overflow: 'hidden', borderWidth: 1.2, borderColor: '#594483', marginBottom: 12 },
  specialImage: { width: '100%', height: '100%' },
  specialStatsBox: { flexDirection: 'row', gap: 16, backgroundColor: '#140D20', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, marginBottom: 12 },
  specialStatText: { color: '#AAA', fontSize: 12 },
  statBold: { color: '#FFD700', fontWeight: 'bold' },
  specialAdviceText: { color: '#DDD', fontSize: 12, lineHeight: 18, textAlign: 'center', fontStyle: 'italic', marginBottom: 16, paddingHorizontal: 8 },
  drinkCompleteBtn: { width: '100%', backgroundColor: '#E056FD', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  drinkCompleteBtnText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
});