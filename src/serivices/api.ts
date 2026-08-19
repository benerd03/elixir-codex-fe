// src/services/api.ts
import { MOCK_ELIXIRS, MOCK_MATERIALS } from '../mockData';

// ⚠️ 백엔드 팀원이 가비아 공인 IP를 알려주면 아래 주소를 수정하세요!
const BASE_URL = 'http://localhost:8080';

export const ApiService = {
  // 1. 온보딩 도메인 분석 (POST /api/v1/onboarding/analyze)
  analyzeOnboardingText: async (text: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/onboarding/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) throw new Error('API 응답 실패');
      return await response.json();
    } catch (e) {
      console.warn('백엔드 미연결 -> Mock 도메인 반환');
      return { domain: '기본', message: '분석 완료' };
    }
  },

  // 2. 도감 목록 조회 (GET /api/codex)
  getCodexList: async (ownerId = '1') => {
    try {
      const response = await fetch(`${BASE_URL}/api/codex?ownerId=${ownerId}`);
      if (!response.ok) throw new Error('API 응답 실패');
      return await response.json();
    } catch (e) {
      console.warn('백엔드 미연결 -> Mock 도감 데이터 사용');
      return MOCK_ELIXIRS;
    }
  },

  // 3. 가마솥 연성 요청 (POST /api/v1/elixir/brew)
  brewElixir: async (ingredientIds: string[]) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/elixir/brew`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredientCardIds: ingredientIds }),
      });
      if (!response.ok) throw new Error('연성 실패');
      return await response.json();
    } catch (e) {
      console.warn('백엔드 미연결 -> Mock 연성 결과 반환');
      return MOCK_ELIXIRS[0];
    }
  },

  // 4. 출석체크 (POST /api/v1/attendance)
  checkAttendance: async (ownerId = '1') => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerId }),
      });
      if (!response.ok) throw new Error('출석 실패');
      return await response.json();
    } catch (e) {
      console.warn('백엔드 미연결 -> Mock 출석 성공 반환');
      return { success: true, currentStreak: 3 };
    }
  },
};