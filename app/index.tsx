// app/index.tsx
import React from 'react';
import { Redirect } from 'expo-router';

export default function IndexScreen() {
  // 1. 브라우저/앱 로컬스토리지에서 토큰 확인
  let token = null;
  if (typeof window !== 'undefined' && window.localStorage) {
    token = localStorage.getItem('jwtToken');
  }

  // 2. 토큰 유무에 따라 안전하게 즉시 리다이렉트
  if (token) {
    return <Redirect href="/onboarding" />;
  } else {
    return <Redirect href="/login" />;
  }
}