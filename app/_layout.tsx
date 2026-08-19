// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* 1. 최초 진입 온보딩 화면 */}
      <Stack.Screen name="onboarding" />
      {/* 2. 메인 하단 탭 그룹 */}
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}