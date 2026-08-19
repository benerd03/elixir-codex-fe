// app/(tabs)/myroom.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';

export default function MyRoomScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>🏰 마법사의 비밀 서재</Text>
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => Alert.alert('설정', '목표 도메인 키워드 변경 및 방 설정창이 열립니다.')}
        >
          <Text style={styles.menuBtnText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* 쿼터뷰 방 전시대 캔버스 영역 */}
      <View style={styles.isometricRoomFrame}>
        <View style={styles.roomPlaceholderInner}>
          <Text style={styles.roomCenterIcon}>🔮</Text>
          <Text style={styles.roomCenterTitle}>마법사의 방 쿼터뷰 캔버스</Text>
          <Text style={styles.roomCenterSub}>
            디자이너의 쿼터뷰 일러스트 및 가구 배치 에셋이 연결되는 공간입니다.
          </Text>
        </View>

        {/* 늘해랑 대화 말풍선 */}
        <View style={styles.neulhaerangFloatingBubble}>
          <Text style={styles.bubbleSpeaker}>늘해랑</Text>
          <Text style={styles.bubbleMessage}>
            "용사님, 출석체크를 7일 완료하면 방을 꾸밀 수 있는 신비로운 가구를 선물로 드릴게요!"
          </Text>
        </View>
      </View>

      {/* 하단 상호작용 상자 2종 (보관함 / 상점) */}
      <View style={styles.roomBottomActionRow}>
        {/* 보관함 상자 */}
        <TouchableOpacity
          style={styles.actionChestCard}
          onPress={() => Alert.alert('📦 보관함', '온보딩 때 획득한 스페셜 엘릭서(최대 3개)를 전시·교체할 수 있습니다.')}
          activeOpacity={0.8}
        >
          <Text style={styles.chestIcon}>🧰</Text>
          <Text style={styles.chestTitle}>보관함</Text>
          <Text style={styles.chestSub}>스페셜 엘릭서 1/3</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#130E1F', paddingHorizontal: 14 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  headerTitle: { color: '#FFD700', fontSize: 18, fontWeight: 'bold' },
  menuBtn: { width: 34, height: 34, backgroundColor: '#231A38', borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#4A3B6E' },
  menuBtnText: { fontSize: 16 },

  // 쿼터뷰 룸 캔버스 프레임
  isometricRoomFrame: { flex: 1, backgroundColor: '#1C142A', borderRadius: 18, borderWidth: 1.5, borderColor: '#594483', justifyContent: 'center', alignItems: 'center', padding: 16, position: 'relative', marginBottom: 12 },
  roomPlaceholderInner: { alignItems: 'center', paddingHorizontal: 20 },
  roomCenterIcon: { fontSize: 50, marginBottom: 10 },
  roomCenterTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  roomCenterSub: { color: '#8A7A9E', fontSize: 12, textAlign: 'center', lineHeight: 18 },

  // 늘해랑 말풍선
  neulhaerangFloatingBubble: { position: 'absolute', top: 14, left: 14, right: 14, backgroundColor: '#291C3E', borderRadius: 12, padding: 12, borderWidth: 1.2, borderColor: '#E056FD' },
  bubbleSpeaker: { color: '#E056FD', fontSize: 11, fontWeight: 'bold', marginBottom: 3 },
  bubbleMessage: { color: '#DDD', fontSize: 11, lineHeight: 16 },

  // 하단 상자 2종
  roomBottomActionRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  actionChestCard: { flex: 1, backgroundColor: '#1C142A', borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1.2, borderColor: '#483566' },
  chestIcon: { fontSize: 28, marginBottom: 4 },
  chestTitle: { color: '#FFF', fontSize: 14, fontWeight: 'bold', marginBottom: 2 },
  chestSub: { color: '#A29BFE', fontSize: 10 },
});