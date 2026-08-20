import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';

export interface QuestItem {
  id: string;
  title: string;
  rewardText: string;
  rewardMatId: string;    // 실제 들어갈 재료 ID (m1 ~ m15)
  rewardMatName: string;  // 재료명
  grade: 'Common' | 'Rare' | 'Epic';
}

interface Props {
  visible: boolean;
  onClose: () => void;
  // 💡 보상 수령 시 부모(index.tsx)의 재료 인벤토리(materials)를 증가시키는 콜백
  onClaimReward?: (matId: string, matName: string) => void;
}

// 📜 일일 퀘스트 Mock 데이터
const DAILY_QUESTS: QuestItem[] = [
  { id: 'd1', title: '아침 미온수 1잔 마시기', rewardText: '이슬 한 방울 x1', rewardMatId: 'm1', rewardMatName: '이슬 한 방울', grade: 'Common' },
  { id: 'd2', title: '오늘의 영양제 섭취 인증', rewardText: '황금 레몬 x1', rewardMatId: 'm3', rewardMatName: '황금 레몬', grade: 'Rare' },
  { id: 'd3', title: '가벼운 스트레칭 5분', rewardText: '활력초 x1', rewardMatId: 'm5', rewardMatName: '활력초', grade: 'Common' },
  { id: 'd4', title: '햇볕 쬐며 산책 10분', rewardText: '탱탱 젤리 x1', rewardMatId: 'm2', rewardMatName: '탱탱 젤리', grade: 'Common' },
  { id: 'd5', title: '밤 12시 이전 취침 준비', rewardText: '평온초 x1', rewardMatId: 'm11', rewardMatName: '평온초', grade: 'Rare' },
];

// 📜 주간 퀘스트 Mock 데이터
const WEEKLY_QUESTS: QuestItem[] = [
  { id: 'w1', title: '[운동] 주 3회 30분 유산소 운동', rewardText: '백옥 진주 x1', rewardMatId: 'm4', rewardMatName: '백옥 진주', grade: 'Epic' },
  { id: 'w2', title: '[루틴] 5일 연속 영양제 인증 완료', rewardText: '천년 뿌리 x1', rewardMatId: 'm8', rewardMatName: '천년 뿌리', grade: 'Epic' },
  { id: 'w3', title: '[휴식] 주간 평균 7시간 수면 달성', rewardText: '안정석 x1', rewardMatId: 'm12', rewardMatName: '안정석', grade: 'Rare' },
  { id: 'w4', title: '[식습관] 야식 먹지 않기 4회 달성', rewardText: '마룡 뿔 x1', rewardMatId: 'm7', rewardMatName: '마룡 뿔', grade: 'Epic' },
];

export default function QuestModal({ visible, onClose, onClaimReward }: Props) {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');
  const [claimedIds, setClaimedIds] = useState<string[]>([]);

  // 🎁 보상 수령 실행 함수
  const handleClaim = (quest: QuestItem) => {
    if (claimedIds.includes(quest.id)) return;

    // 1. 수령 상태 기록
    setClaimedIds((prev) => [...prev, quest.id]);

    // 2. 부모 인벤토리 데이터로 재료 추가
    if (onClaimReward) {
      onClaimReward(quest.rewardMatId, quest.rewardMatName);
    } else {
      Alert.alert('🎁 보상 수령 완료', `${quest.rewardText}을(를) 획득했습니다!`);
    }
  };

  const currentList = activeTab === 'daily' ? DAILY_QUESTS : WEEKLY_QUESTS;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalBox}>
              {/* 상단 헤더 */}
              <View style={styles.modalHeader}>
                <Text style={styles.headerTitle}>🎯 모험가 의뢰 게시판</Text>
                <TouchableOpacity onPress={onClose}>
                  <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* 탭 버튼 영역 (일일 / 주간) */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tabButton, activeTab === 'daily' && styles.activeTabButton]}
                  onPress={() => setActiveTab('daily')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabText, activeTab === 'daily' && styles.activeTabText]}>
                    일일 퀘스트
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabButton, activeTab === 'weekly' && styles.activeTabButton]}
                  onPress={() => setActiveTab('weekly')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabText, activeTab === 'weekly' && styles.activeTabText]}>
                    주간 퀘스트
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 퀘스트 목록 스크롤 */}
              <ScrollView style={styles.questScroll} contentContainerStyle={styles.scrollContent}>
                {currentList.map((item) => {
                  const isClaimed = claimedIds.includes(item.id);
                  return (
                    <View
                      key={item.id}
                      style={[styles.questCard, isClaimed && styles.questCardDone]}
                    >
                      {/* 좌측: 퀘스트 내용 및 보상 */}
                      <View style={styles.questInfo}>
                        <Text style={[styles.questTitle, isClaimed && styles.questTitleDone]} numberOfLines={2}>
                          {item.title}
                        </Text>
                        <Text style={styles.rewardText}>보상: {item.rewardText}</Text>
                      </View>

                      {/* 우측: 36x36 정사각형 수령 버튼 */}
                      <TouchableOpacity
                        style={[styles.squareClaimBtn, isClaimed && styles.squareClaimBtnDone]}
                        disabled={isClaimed}
                        onPress={() => handleClaim(item)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.squareClaimBtnText}>
                          {isClaimed ? '완료' : '수령'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '90%',
    maxWidth: 500,
    height: '75%',
    maxHeight: 560,
    backgroundColor: '#242038',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#6C5CE7',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeIcon: {
    color: '#8A879E',
    fontSize: 18,
    fontWeight: 'bold',
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#181528',
    borderRadius: 10,
    padding: 4,
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: '#6C5CE7',
  },
  tabText: {
    color: '#8A879E',
    fontSize: 13,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  questScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  questCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1B1728',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#3E3960',
  },
  questCardDone: {
    backgroundColor: '#161322',
    borderColor: '#2D2845',
    opacity: 0.65,
  },
  questInfo: {
    flex: 1,
    marginRight: 10,
  },
  questTitle: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  questTitleDone: {
    color: '#8A879E',
    textDecorationLine: 'line-through',
  },
  rewardText: {
    color: '#A29BFE',
    fontSize: 11,
  },
  // 🔲 36x36 정사각형 수령 버튼
  squareClaimBtn: {
    width: 36,
    height: 36,
    backgroundColor: '#E056FD',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  squareClaimBtnDone: {
    backgroundColor: '#3E3960',
  },
  squareClaimBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});