import React from 'react';
import { TouchableOpacity, Text, Image, StyleSheet, View } from 'react-native';
import { ElixirCardData } from '../mockData';

interface ElixirCardProps {
  elixir: ElixirCardData;
  onPress: (elixir: ElixirCardData) => void;
}

export default function ElixirCard({ elixir, onPress }: ElixirCardProps) {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'Prismatic': return '#E056FD';
      case 'Epic': return '#F0932B';
      case 'Rare': return '#686DE0';
      default: return '#95AFC0';
    }
  };

  const isLocked = !elixir.isUnlocked;
  const gradeColor = isLocked ? '#4A475C' : getGradeColor(elixir.grade);

  return (
    <TouchableOpacity
      style={[
        styles.pokerCard,
        { borderColor: gradeColor },
        isLocked && styles.lockedCard,
      ]}
      onPress={() => onPress(elixir)}
      activeOpacity={0.8}
    >
      {/* 1. 좌측 상단 등급 약칭 배지 */}
      <View style={[styles.gradeBadge, { backgroundColor: gradeColor }]}>
        <Text style={styles.badgeText}>
          {isLocked ? '?' : elixir.grade.substring(0, 1)}
        </Text>
      </View>

      {/* 2. 프리즘 등급 전용 시리얼 넘버 */}
      {!isLocked && elixir.serialNumber ? (
        <View style={styles.serialBadge}>
          <Text style={styles.serialText}>{elixir.serialNumber}</Text>
        </View>
      ) : null}

      {/* 3. 카드 내부 이미지 / 실루엣 */}
      <View style={styles.artFrame}>
        {isLocked ? (
          <View style={styles.silhouetteArea}>
            <Text style={styles.silhouetteFlask}>🏺</Text>
            <Text style={styles.lockedLabel}>미해금</Text>
          </View>
        ) : (
          <Image source={{ uri: elixir.imageUrl }} style={styles.cardImage} resizeMode="cover" />
        )}
      </View>

      {/* 4. 하단 카드 이름 */}
      <View style={styles.nameContainer}>
        <Text
          style={[styles.cardName, isLocked && styles.lockedText]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {isLocked ? '???' : elixir.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pokerCard: {
    width: '31%',
    aspectRatio: 0.69,
    backgroundColor: '#242038',
    borderRadius: 12,
    padding: 6,
    margin: 4,
    borderWidth: 1.8,
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  lockedCard: {
    backgroundColor: '#181525',
    borderStyle: 'dashed',
    opacity: 0.85,
  },
  gradeBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  serialBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    zIndex: 2,
  },
  serialText: {
    color: '#FFD700',
    fontSize: 8,
    fontWeight: 'bold',
  },
  artFrame: {
    width: '100%',
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 18,
    marginBottom: 6,
    backgroundColor: '#161322',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  silhouetteArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1D1A2B',
  },
  silhouetteFlask: {
    fontSize: 30,
    opacity: 0.25,
    marginBottom: 4,
  },
  lockedLabel: {
    color: '#65607A',
    fontSize: 10,
    fontWeight: 'bold',
  },
  nameContainer: {
    width: '100%',
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardName: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  lockedText: {
    color: '#555169',
  },
});