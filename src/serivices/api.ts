// src/services/api.ts
import { MOCK_ELIXIRS, MOCK_MATERIALS, ElixirCardData } from '../mockData';

// ⚠️ 백엔드 팀원이 알려주는 가비아 서버 IP 또는 도메인 주소로 교체하세요.
const BASE_URL = 'http://localhost:8080';

// 임시 테스트용 JWT 토큰 (로그인 구현 전이거나 테스트 시 사용)
let authToken = 'test-mock-jwt-token';

export const setAuthToken = (token: string) => {
  authToken = token;
};

const getHeaders = (isMultipart = false) => {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${authToken}`,
  };
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

export const ApiService = {
  // ==========================================
  // 1. 온보딩 텍스트 카테고리 분류 (POST /api/onboarding/classify)
  // ==========================================
  classifyOnboardingText: async (freeText: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/onboarding/classify`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ freeText }),
      });
      if (!response.ok) throw new Error('온보딩 분류 실패');
      return await response.json(); // { themeCategory: "FATIGUE_ENERGY", labelKo: "피로/에너지" }
    } catch (e) {
      console.warn('온보딩 API 미연결 -> Mock 응답 사용:', e);
      return { themeCategory: 'FATIGUE_ENERGY', labelKo: '피로/에너지' };
    }
  },

  // ==========================================
  // 2. 가마솥 연성 실행 (POST /api/synthesize)
  // ==========================================
  synthesizeElixir: async (ingredientCardIds: number[], themeCategory: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/synthesize`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ingredientCardIds,
          themeCategory, // "SKIN_ANTIOXIDANT" | "FATIGUE_ENERGY" | "DIET_BLOODSUGAR" | "SLEEP_REST"
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

  // ==========================================
  // 3. 코덱스 도감 목록 조회 (GET /api/codex)
  // ==========================================
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

  // ==========================================
  // 4. 코덱스 상세 단건 조회 (GET /api/codex/{elixirCardId})
  // ==========================================
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

  // ==========================================
  // 5. 출석체크 실행 (POST /api/attendance/check)
  // ==========================================
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
      return await response.json(); // { currentStreak: 7, rewardGranted: true, rewardItemName: "연속 출석 보상 상자" }
    } catch (e: any) {
      console.warn('출석체크 API 미연결:', e.message);
      return { currentStreak: 1, rewardGranted: false, rewardItemName: null };
    }
  },

  // ==========================================
  // 6. 출석 상태 조회 (GET /api/attendance)
  // ==========================================
  getAttendanceStatus: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/attendance`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('출석 상태 조회 실패');
      return await response.json(); // { currentStreak: 3, rewards: [...] }
    } catch (e) {
      console.warn('출석 상태 조회 API 미연결:', e);
      return { currentStreak: 3, rewards: [] };
    }
  },

  // ==========================================
  // 7. 영양제 사진 OCR 인증 (POST /api/supplements/verify)
  // ==========================================
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
        headers: getHeaders(true), // multipart
        body: formData,
      });
      if (!response.ok) throw new Error('영양제 사진 인증 실패');
      return await response.json(); // { supplementLogId: 1, productName: "...", isVerified: true }
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