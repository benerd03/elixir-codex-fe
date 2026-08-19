import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
}

interface QuestItem {
  id: string;
  title: string;
  reward: string;
  grade: 'Common' | 'Rare' | 'Epic';
}

const DAILY_QUESTS: QuestItem[] = [
  { id: 'd1', title: '아침 미온수 1잔 마시기', reward: '비타민C 가루 x1', grade: 'Common' },
  { id: 'd2', title: '오늘의 영양제 섭취 인증', reward: '마그네슘 원액 x1', grade: 'Rare' },
  { id: 'd3', title: '가벼운 스트레칭 5분', reward: '정제수 x1', grade: 'Common' },
  { id: 'd4', title: '햇볕 쬐며 산책 10분', reward: '태양의 정화 이슬 x1', grade: 'Common' },
  { id: 'd5', title: '밤 12시 이전 취침 준비', reward: '달빛 신경 안정석 x1', grade: 'Rare' },
];

const WEEKLY_QUESTS: QuestItem[] = [
  { id: 'w1', title: '[운동] 주 3회 30분 유산소 운동', reward: '오메가3 오일 + 레시피 스크롤', grade: 'Epic' },
  { id: 'w2', title: '[루틴] 5일 연속 영양제 인증 완료', reward: '천년삼 원액 x1', grade: 'Epic' },
  { id: 'w3', title: '[휴식] 주간 평균 7시간 수면 달성', reward: '달빛 이끼 x2', grade: 'Rare' },
  { id: 'w4', title: '[식습관] 야식 먹지 않기 4회 달성', reward: '공간 왜곡 포만 이끼 x1', grade: 'Epic' },
];

export default function QuestModal({ visible, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');
  const [completed, setCompleted] = useState<string[]>([]);

  const toggleComplete = (id: string) => {
    if (completed.includes(id)) {
      setCompleted(completed.filter((cId) => cId !== id));
    } else {
      setCompleted([...completed, id]);
    }
  };

  const currentList = activeTab === 'daily' ? DAILY_QUESTS : WEEKLY_QUESTS;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        {/* 기기 화면 비율에 맞춘 반응형 박스 */}
        <View style={styles.modalBox}>
          
          {/* 상단 타이틀 */}
          <Text style={styles.headerTitle}>🎯 퀘스트 게시판</Text>

          {/* 상단 탭 바 */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'daily' && styles.activeTabButton]}
              onPress={() => setActiveTab('daily')}
            >
              <Text style={[styles.tabText, activeTab === 'daily' && styles.activeTabText]}>
                일일 퀘스트
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'weekly' && styles.activeTabButton]}
              onPress={() => setActiveTab('weekly')}
            >
              <Text style={[styles.tabText, activeTab === 'weekly' && styles.activeTabText]}>
                주간 퀘스트
              </Text>
            </TouchableOpacity>
          </View>

          {/* 내부 스크롤 영역 (개수가 늘어나도 박스 크기 유지) */}
          <ScrollView
            style={styles.questScroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {currentList.map((item) => {
              const isDone = completed.includes(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.questCard, isDone && styles.questCardDone]}
                  onPress={() => toggleComplete(item.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.checkCircle}>
                    <Text style={styles.checkIcon}>{isDone ? '✓' : ''}</Text>
                  </View>

                  <View style={styles.questInfo}>
                    <Text style={[styles.questTitle, isDone && styles.questTitleDone]}>
                      {item.title}
                    </Text>
                    <Text style={styles.rewardText}>
                      🎁 보상: {item.reward}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* 하단 고정 닫기 버튼 */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    height: '75%', // 기기 화면 세로 길이의 75% 비율 차지
    maxHeight: 650, // 대화면 태블릿 대비 최대 높이 제한
    backgroundColor: '#242038',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#6C5CE7',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#181528',
    borderRadius: 10,
    padding: 4,
    marginBottom: 14,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
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
    flex: 1, // 상단 탭과 하단 닫기 버튼 사이의 남은 공간 전체를 스크롤 뷰로 할당
  },
  scrollContent: {
    paddingBottom: 8,
  },
  questCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2F2B4A',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#3E3960',
  },
  questCardDone: {
    backgroundColor: '#1E1B2E',
    borderColor: '#2ECC71',
    opacity: 0.7,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6C5CE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#181528',
  },
  checkIcon: {
    color: '#2ECC71',
    fontWeight: 'bold',
    fontSize: 14,
  },
  questInfo: {
    flex: 1,
  },
  questTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  questTitleDone: {
    color: '#8A879E',
    textDecorationLine: 'line-through',
  },
  rewardText: {
    color: '#FFD700',
    fontSize: 11,
  },
  closeBtn: {
    backgroundColor: '#6C5CE7',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  closeBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});