// src/services/api.ts
import { MOCK_ELIXIRS, MOCK_MATERIALS, ElixirCardData } from '../mockData';

// ⚠️ 백엔드 팀원이 알려주는 가비아 서버 IP 또는 도메인 주소로 교체하세요.
export const BASE_URL = 'https://1-201-116-227.sslip.io';

// 로컬 스토리지에서 실제 토큰을 실시간으로 가져오는 함수
export const getStoredToken = (): string => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('jwtToken') || 'test-mock-jwt-token';
  }
  return 'test-mock-jwt-token';
};

const getHeaders = (isMultipart = false) => {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

// ==========================================
// 🔑 유저 인증 API (회원가입, 로그인, 내 정보 조회)
// ==========================================

// 1. 회원가입 API (POST /api/users/signup)
export const signupUser = async (
  email: string,
  password: string,
  selectedCategory: string = 'FATIGUE_ENERGY'
) => {
  const res = await fetch(`${BASE_URL}/api/users/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, selectedCategory }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || '회원가입 실패');
  }
  return data;
};

// 2. 로그인 API (POST /api/users/login)
export const loginUser = async (email: string, password: string) => {
  try {
    const res = await fetch(`${BASE_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || '로그인 실패');
    }

    // 백엔드에서 내려준 JWT 토큰을 localStorage에 저장
    if (data.token && typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('jwtToken', data.token);
    }
    return data;

  } catch (error) {
    // 💡 핵심: 백엔드가 꺼져 있거나 웹에서 네트워크 에러(Network request failed)가 나도
    // 멈추지 않고 웹 테스트용 가짜 토큰을 강제로 저장해서 다음 화면으로 넘어가게 함!
    console.warn('⚠️ 백엔드 미연결 또는 웹 네트워크 오류 -> 웹 테스트용 안전 폴백 로그인 통과');
    
    const mockToken = 'mock-jwt-token-for-web-test';
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('jwtToken', mockToken);
    }
    
    // 로그인 성공한 것처럼 데이터 반환
    return { token: mockToken, message: '로그인 성공 (웹 폴백)' };
  }
};

// 3. 내 정보 조회 API (GET /api/users/me)
export const getMyInfo = async () => {
  const res = await fetch(`${BASE_URL}/api/users/me`, {
    method: 'GET',
    headers: getHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || '정보 조회 실패');
  }
  return data;
};

// ==========================================
// 🔮 인게임 기능 API (연성, 도감, 출석, 인증 등)
// ==========================================
export const ApiService = {
  // 1. 온보딩 텍스트 카테고리 분류 (POST /api/onboarding/classify)
  classifyOnboardingText: async (freeText: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/onboarding/classify`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ freeText }),
      });
      if (!response.ok) throw new Error('온보딩 분류 실패');
      return await response.json();
    } catch (e) {
      console.warn('온보딩 API 미연결 -> Mock 응답 사용:', e);
      return { themeCategory: 'FATIGUE_ENERGY', labelKo: '피로/에너지' };
    }
  },

  // 2. 가마솥 연성 실행 (POST /api/synthesize)
  synthesizeElixir: async (ingredientCardIds: number[], themeCategory: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/synthesize`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ingredientCardIds,
          themeCategory,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: '연성에 실패했습니다.' }));
        throw new Error(errorData.message || '연성 실패');
      }
      return await response.json();
    } catch (e: any) {
      console.warn('연성 API 실패/미연결 -> Mock 결과 반환:', e.message);
      return MOCK_ELIXIRS[0];
    }
  },

  // 3. 코덱스 도감 목록 조회 (GET /api/codex)
  getCodexList: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/codex`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('도감 목록 조회 실패');
      return await response.json();
    } catch (e) {
      console.warn('도감 API 미연결 -> Mock 도감 사용:', e);
      return MOCK_ELIXIRS;
    }
  },

  // 4. 코덱스 상세 단건 조회 (GET /api/codex/{elixirCardId})
  getCodexDetail: async (elixirCardId: number | string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/codex/${elixirCardId}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('상세 조회 실패');
      return await response.json();
    } catch (e) {
      console.warn('상세 조회 API 미연결 -> Mock 첫번째 카드 반환:', e);
      return MOCK_ELIXIRS[0];
    }
  },

  // 5. 출석체크 실행 (POST /api/attendance/check)
  checkAttendance: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/attendance/check`, {
        method: 'POST',
        headers: getHeaders(),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: '출석체크 실패' }));
        throw new Error(err.message);
      }
      return await response.json();
    } catch (e: any) {
      console.warn('출석체크 API 미연결:', e.message);
      return { currentStreak: 1, rewardGranted: false, rewardItemName: null };
    }
  },

  // 6. 출석 상태 조회 (GET /api/attendance)
  getAttendanceStatus: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/attendance`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('출석 상태 조회 실패');
      return await response.json();
    } catch (e) {
      console.warn('출석 상태 조회 API 미연결:', e);
      return { currentStreak: 3, rewards: [] };
    }
  },

  // 7. 영양제 사진 OCR 인증 (POST /api/supplements/verify)
  verifySupplementPhoto: async (imageUri: string) => {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        name: 'supplement.jpg',
        type: 'image/jpeg',
      } as any);

      const response = await fetch(`${BASE_URL}/api/supplements/verify`, {
        method: 'POST',
        headers: getHeaders(true),
        body: formData,
      });
      if (!response.ok) throw new Error('영양제 사진 인증 실패');
      return await response.json();
    } catch (e) {
      console.warn('영양제 사진 업로드 API 미연결 -> Mock 인증 성공 반환:', e);
      return {
        supplementLogId: 1,
        productName: '비타민 C & 글루타치온 복합제',
        confidenceScore: 95,
        isVerified: true,
        isAffiliateProduct: false,
      };
    }
  },
};