// app/(tabs)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { Image, StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FFD700',
        tabBarInactiveTintColor: '#8A7A9E',
        tabBarStyle: {
          backgroundColor: '#130E1F',
          borderTopWidth: 1.5,
          borderTopColor: '#34264E',
          height: 72,
          paddingBottom: 10,
          paddingTop: 8,
          maxWidth: 600,
          width: '100%',
          marginHorizontal: 'auto',
          alignSelf: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 15,
          fontWeight: 'bold',
        },
        headerShown: false,
      }}
    >
      {/* 1. 재료 탭 (보라색 물약병) */}
      <Tabs.Screen
        name="materials"
        options={{
          title: '재료',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../assets/images/tab_materials.png')}
              style={[styles.tabIcon, !focused && styles.tabIconInactive]}
            />
          ),
        }}
      />

      {/* 2. 홈 탭 (보라색 가마솥) */}
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../assets/images/tab_home.png')}
              style={[styles.tabIcon, !focused && styles.tabIconInactive]}
            />
          ),
        }}
      />

      {/* 3. 도감 탭 (황금 두루마리) */}
      <Tabs.Screen
        name="codex"
        options={{
          title: '도감',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../assets/images/tab_codex.png')}
              style={[styles.tabIcon, !focused && styles.tabIconInactive]}
            />
          ),
        }}
      />

      <Tabs.Screen name="myroom" options={{ href: null }} />
      <Tabs.Screen name="cauldron" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: { width: 30, height: 30, resizeMode: 'contain' },
  tabIconInactive: { opacity: 0.4 },
});