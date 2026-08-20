import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { FullWindowOverlay } from 'react-native-screens';

interface Props {
  visible: boolean;
  onClose: () => void;
}


// 7일 출석 보상 데이터
const ATTENDANCE_REWARDS = [
  { day: 1, reward: '비타민C x1', icon: '💊' },
  { day: 2, reward: '정제수 x2', icon: '💧' },
  { day: 3, reward: '마그네슘 x1', icon: '🧪' },
  { day: 4, reward: '태양의 이슬 x1', icon: '✨' },
  { day: 5, reward: '오메가3 x1', icon: '🍯' },
  { day: 6, reward: '레시피 조각 x1', icon: '📜' },
  { day: 7, reward: '마이룸 연금술 가구', icon: '🏰', isSpecial: true },
];

export default function AttendanceModal({ visible, onClose }: Props) {
  // 현재까지 출석 완료한 총 일수 (테스트용으로 3일차까지 완료 상태로 시작)
  const [attendedDays, setAttendedDays] = useState<number>(3);
  const [checkedToday, setCheckedToday] = useState<boolean>(false);

  // 출석 도장 찍기 핸들러 (누적 방식)
  const handleCheckIn = (dayNumber: number) => {
    // 이미 완료된 일차 클릭 시
    if (dayNumber <= attendedDays) {
      Alert.alert('알림', `${dayNumber}일차 출석은 이미 완료되었습니다.`);
      return;
    }

    // 오늘 이미 출석을 완료한 경우
    if (checkedToday) {
      Alert.alert('알림', '오늘의 출석체크는 이미 완료했습니다!\n내일 다시 찾아와 주세요.');
      return;
    }

    // 오늘 출석할 순서가 아닌 먼 미래의 일차를 누른 경우
    if (dayNumber > attendedDays + 1) {
      Alert.alert('안내', `${attendedDays + 1}일차 출석을 먼저 완료해 주세요!`);
      return;
    }

    // 출석 완료 처리
    const nextDay = attendedDays + 1;
    setAttendedDays(nextDay);
    setCheckedToday(true);    if (nextDay === 7) {
      Alert.alert('🎉 7일 연속 출석 달성!', '마이룸 전용 가구 보상을 획득했습니다!\n마이룸 탭에서 확인해 보세요.');
    } else {
      Alert.alert('✨ 출석 완료!', `${nextDay}일차 보상 [${ATTENDANCE_REWARDS[nextDay - 1].reward}]이 지급되었습니다.`);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {/* 1. 우측 상단 X 닫기 버튼 */}
          <TouchableOpacity style={styles.closeIconButton} onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.closeIconText}>✕</Text>
          </TouchableOpacity>

          {/* 2. 상단 헤더 */}
          <Text style={styles.title}>📅 7일 출석체크</Text>
          <Text style={styles.subDesc}>
            현재 <Text style={styles.streakHighlight}>{attendedDays}일차</Text> 출석 완료 (총 7일)
          </Text>

          {/* 3. 7개 출석 박스 그리드 */}
          <View style={styles.gridContainer}>
            {ATTENDANCE_REWARDS.map((item) => {
              const isChecked = item.day <= attendedDays;
              const isNextTurn = item.day === attendedDays + 1 && !checkedToday;

              return (
                <TouchableOpacity
                  key={item.day}
                  style={[
                    styles.dayBox,
                    item.isSpecial && styles.specialBox,
                    isChecked && styles.checkedBox,
                    isNextTurn && styles.nextTurnBox,
                  ]}
                  onPress={() => handleCheckIn(item.day)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dayText, isChecked && styles.checkedText]}>
                    {item.day}일차
                  </Text>

                  <Text style={styles.boxIcon}>{item.icon}</Text>

                  <Text style={[styles.rewardText, isChecked && styles.checkedText]} numberOfLines={1}>
                    {item.reward}
                  </Text>

                  {/* 출석 완료 시 도장 오버레이 */}
                  {isChecked && (
                    <View style={styles.stampOverlay}>
                      <Text style={styles.stampText}>✓</Text>
                    </View>
                  )}

                  {/* 오늘 출석 가능한 박스 강조 뱃지 */}
                  {isNextTurn && (
                    <View style={styles.todayBadge}>
                      <Text style={styles.todayBadgeText}>오늘</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '100%',
    maxWidth: 500,
    maxHeight: 560,
    alignSelf: 'center',
    backgroundColor: '#242038',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 20,
    borderWidth: 1.5,
    borderColor: '#6C5CE7',
  },

  closeIconButton: {
    position: 'absolute',
    top: 16,
    right: 18,
    zIndex: 10,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIconText: {
    color: '#AAA',
    fontSize: 20,
    fontWeight: 'bold',
  },
  title: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  subDesc: {
    color: '#8A879E',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
  },
  streakHighlight: {
    color: '#E056FD',
    fontWeight: 'bold',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  dayBox: {
    width: '31%', // 1~6일차: 3열 배치
    height: 100,
    backgroundColor: '#2F2B4A',
    borderRadius: 14,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#3E3960',
    position: 'relative',
    overflow: 'hidden',
  },
  specialBox: {
    width: '100%', // 7일차 특별 보상: 가로 전체 차지
    height: 75,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderColor: '#FFD700',
    backgroundColor: '#352D4D',
  },
  nextTurnBox: {
    borderColor: '#E056FD',
    backgroundColor: '#3E2F5B',
    borderWidth: 2,
  },
  checkedBox: {
    backgroundColor: '#1A1728',
    borderColor: '#2ECC71',
    opacity: 0.85,
  },
  dayText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  boxIcon: {
    fontSize: 26,
  },
  rewardText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  checkedText: {
    color: '#666',
  },
  stampOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(46, 204, 113, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stampText: {
    color: '#2ECC71',
    fontSize: 36,
    fontWeight: 'bold',
  },
  todayBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#E056FD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  todayBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
});