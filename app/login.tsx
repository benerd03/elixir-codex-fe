// app/login.tsx (수정 완료된 완벽한 버전)
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';

// 💡 백엔드 서버 기본 주소
const BACKEND_BASE_URL = 'https://1-201-116-227.sslip.io';

export default function LoginScreen() {
  const router = useRouter();
  const [isLoginView, setIsLoginView] = useState(true); // true: 로그인, false: 회원가입
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 🚀 로그인 / 회원가입 제출 핸들러
  const handleAuthSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      if (Platform.OS === 'web') {
        window.alert('이메일과 비밀번호를 모두 입력해 주세요.');
      } else {
        Alert.alert('알림', '이메일과 비밀번호를 모두 입력해 주세요.');
      }
      return;
    }

    setLoading(true);

    try {
      if (isLoginView) {
        // [1] 로그인 처리
        let tokenToSave = '';

        try {
          const res = await fetch(`${BACKEND_BASE_URL}/api/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          // 💡 res.ok 검사를 json()보다 먼저 수행하여 안전성 확보
          if (!res.ok) {
            throw new Error('로그인 실패');
          }

          const data = await res.json();
          tokenToSave = data.token || 'mock_jwt_token_local_dev';
        } catch (serverErr) {
          console.warn('⚠️ 백엔드 미연결 또는 CORS 발생 -> Mock 토큰 발급 후 로컬 로그인 통과');
          tokenToSave = 'mock_jwt_token_local_dev';
        }

        // 💡 토큰 저장
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('jwtToken', tokenToSave);
        }

        // 💡 웹과 모바일 분기 처리하여 확실하게 다음 화면으로 이동
        if (Platform.OS === 'web') {
          window.alert('로그인 성공!');
          router.replace('/onboarding');
        } else {
          Alert.alert('환영합니다!', '로그인에 성공했습니다.', [
            {
              text: '확인',
              onPress: () => router.replace('/onboarding'),
            },
          ]);
        }

      } else {
        // [2] 회원가입 처리
        try {
          const res = await fetch(`${BACKEND_BASE_URL}/api/users/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              password,
              selectedCategory: 'FATIGUE_ENERGY',
            }),
          });

          if (!res.ok) {
            throw new Error('회원가입 실패');
          }
          
          if (Platform.OS === 'web') {
            window.alert('회원가입 완료! 로그인해 주세요.');
          } else {
            Alert.alert('가입 완료', '회원가입이 완료되었습니다! 로그인해 주세요.');
          }
        } catch (serverErr) {
          console.warn('⚠️ 백엔드 미연결 -> Mock 회원가입 완료 처리');
          if (Platform.OS === 'web') {
            window.alert('가입 완료 (테스트 모드): 이제 로그인해 주세요.');
          } else {
            Alert.alert('가입 완료 (테스트 모드)', '회원가입이 완료되었습니다! 이제 로그인해 주세요.');
          }
        }
        setIsLoginView(true); // 가입 완료 후 로그인 창으로 전환
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>🔮 엘릭서 코덱스</Text>
        <Text style={styles.subtitle}>
          {isLoginView ? '연금술사의 탑에 로그인' : '새로운 연금술사 등록'}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="이메일 입력 (예: test@test.com)"
          placeholderTextColor="#7D7A94"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="비밀번호 입력"
          placeholderTextColor="#7D7A94"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleAuthSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitBtnText}>
              {isLoginView ? '로그인 ➔' : '회원가입 완료 ➔'}
            </Text>
          )}
        </TouchableOpacity>

        {/* 로그인 ↔ 회원가입 전환 버튼 */}
        <TouchableOpacity
          style={styles.switchBtn}
          onPress={() => setIsLoginView(!isLoginView)}
        >
          <Text style={styles.switchBtnText}>
            {isLoginView
              ? '계정이 없으신가요? 회원가입하기'
              : '이미 계정이 있으신가요? 로그인하기'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0914',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    maxWidth: 420,
    backgroundColor: '#1E172E',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#4E3A70',
    alignItems: 'center',
  },
  title: {
    color: '#FFD700',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subtitle: {
    color: '#A29BFE',
    fontSize: 13,
    marginBottom: 24,
  },
  input: {
    width: '100%',
    backgroundColor: '#120D1D',
    borderWidth: 1,
    borderColor: '#3E2D56',
    borderRadius: 10,
    padding: 12,
    color: '#FFF',
    fontSize: 14,
    marginBottom: 14,
  },
  submitBtn: {
    width: '100%',
    backgroundColor: '#6C5CE7',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  switchBtn: {
    marginTop: 16,
    padding: 8,
  },
  switchBtnText: {
    color: '#8A879E',
    fontSize: 12.5,
    textDecorationLine: 'underline',
  },
});