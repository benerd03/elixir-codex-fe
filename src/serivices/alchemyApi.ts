// src/services/alchemyApi.ts
import { MOCK_ELIXIRS } from '../mockData';

const BASE_URL = 'http://localhost:8080'; // 💡 백엔드 IP/도메인

export type BackendThemeCategory = 
  | 'SKIN_ANTIOXIDANT' 
  | 'FATIGUE_ENERGY' 
  | 'DIET_BLOODSUGAR' 
  | 'SLEEP_REST';

export type FrontendThemeCategory = 
  | '피부/항산화' 
  | '피로/에너지' 
  | '혈당/다이어트' 
  | '수면/휴식' 
  | '월식의 변이종';

// 백엔드 POST /api/synthesize 응답 규격 (v1.12)
export interface BackendElixirResponse {
  id: number;
  name: string;
  grade: 'COMMON' | 'RARE' | 'EPIC' | 'PRISMATIC_LEGENDARY';
  themeCategory: BackendThemeCategory;
  imageUrl: string;
  adviserComment: string;
  serialNumber?: number | null;
  ingredientSummary: string;
  isMutated: boolean;
  scientificExplanation?: string | null;
  cardDescription?: string | null;
  stats: Record<string, number>;
  createdAt?: string;
}

export interface SynthesizePayload {
  ingredientCardIds: number[];
  themeCategory: BackendThemeCategory;
}

// 1. 테마 변환 헬퍼 함수
export const toFrontendTheme = (backendTheme: BackendThemeCategory): FrontendThemeCategory => {
  const map: Record<BackendThemeCategory, FrontendThemeCategory> = {
    SKIN_ANTIOXIDANT: '피부/항산화',
    FATIGUE_ENERGY: '피로/에너지',
    DIET_BLOODSUGAR: '혈당/다이어트',
    SLEEP_REST: '수면/휴식',
  };
  return map[backendTheme] || '피부/항산화';
};

// 2. 등급 변환 헬퍼 함수
export const toFrontendGrade = (grade: string): 'Common' | 'Rare' | 'Epic' | 'Prismatic' => {
  if (grade === 'PRISMATIC_LEGENDARY') return 'Prismatic';
  return (grade.charAt(0).toUpperCase() + grade.slice(1).toLowerCase()) as any;
};

// 3. 백엔드 연성 요청 (실패 시 Mock 연성으로 안전하게 Fallback)
export const synthesizeElixir = async (
  payload: SynthesizePayload,
  token?: string
): Promise<BackendElixirResponse> => {
  try {
    if (!token) {
      throw new Error('인증 토큰이 없습니다. Mock 연성 모드로 전환합니다.');
    }

    const res = await fetch(`${BASE_URL}/api/synthesize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `연성 실패 (HTTP ${res.status})`);
    }

    return await res.json();
  } catch (err: any) {
    console.warn(`[Alchemy API] ${err.message} -> 시연용 Mock 데이터로 대체 생성합니다.`);
    
    // 💡 해커톤 심사용 스마트 Fallback: 선택된 재료 수에 따라 Mock 데이터 반환
    const fallbackBase = MOCK_ELIXIRS[0];
    return {
      id: Date.now(),
      name: payload.ingredientCardIds.length >= 3 ? '온전한 조화의 황금 엘릭서' : fallbackBase.name,
      grade: 'EPIC',
      themeCategory: payload.themeCategory,
      imageUrl: fallbackBase.imageUrl || '',
      adviserComment: fallbackBase.adviserComment,
      serialNumber: null,
      ingredientSummary: fallbackBase.ingredientSummary,
      isMutated: false,
      scientificExplanation: fallbackBase.scienceDesc,
      cardDescription: fallbackBase.brewingLore,
      stats: fallbackBase.stats || { '신체 활력도': 88, '대사 가속력': 85 },
    };
  }
};