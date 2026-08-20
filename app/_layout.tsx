// app/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
// 💡 상단 import문들 바로 밑에 추가
const BACKEND_BASE_URL = 'http://localhost:8080';

export default function RootLayout() {
  return (
    <View style={styles.rootContainer}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* 0. 최초 진입 토큰 검사 화면 */}
        <Stack.Screen name="index" />

        {/* 1. 로그인 / 회원가입 화면 */}
        <Stack.Screen name="login" />

        {/* 2. 온보딩 화면 (늘해랑과의 만남 & 영양제 등록) */}
        <Stack.Screen name="onboarding" />

        {/* 3. 메인 하단 탭 그룹 (가마솥, 도감, 재료, 마이룸) */}
        <Stack.Screen name="(tabs)" />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#0D0914',
  },
});