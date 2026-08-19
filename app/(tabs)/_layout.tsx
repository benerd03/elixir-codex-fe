import React from 'react';
import { Tabs } from 'expo-router';
import { Image, StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FFD700',
        tabBarInactiveTintColor: '#7A728E',
        tabBarStyle: {
          backgroundColor: '#130E1F',
          borderTopWidth: 1.5,
          borderTopColor: '#34264E',
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        headerShown: false,
      }}
    >
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
      <Tabs.Screen
        name="myroom"
        options={{
          title: '마이룸',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../assets/images/tab_codex.png')}
              style={[styles.tabIcon, !focused && styles.tabIconInactive]}
            />
          ),
        }}
      />
      <Tabs.Screen name="cauldron" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: { width: 26, height: 26, resizeMode: 'contain' },
  tabIconInactive: { opacity: 0.4 },
});