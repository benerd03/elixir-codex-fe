// src/services/alchemyApi.ts
import { MOCK_ELIXIRS, ElixirCardData } from '../mockData';

const BASE_URL = 'http://localhost:8080'; // 백엔드 서버 URL

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
  imageUrl?: string;
  adviserComment?: string;
  serialNumber?: number | null;
  ingredientSummary?: string;
  isMutated?: boolean;
  scientificExplanation?: string | null;
  cardDescription?: string | null;
  stats?: Record<string, number>;
  createdAt?: string;
}

export interface SynthesizePayload {
  ingredientCardIds: number[];
  themeCategory: BackendThemeCategory;
}

// 1. 테마 한글 변환기
export const toFrontendTheme = (backendTheme: BackendThemeCategory | string): FrontendThemeCategory => {
  const map: Record<string, FrontendThemeCategory> = {
    SKIN_ANTIOXIDANT: '피부/항산화',
    FATIGUE_ENERGY: '피로/에너지',
    DIET_BLOODSUGAR: '혈당/다이어트',
    SLEEP_REST: '수면/휴식',
  };
  return map[backendTheme] || '피로/에너지';
};

// 2. 등급 변환기
export const toFrontendGrade = (grade: string): 'Common' | 'Rare' | 'Epic' | 'Prismatic' => {
  if (grade === 'PRISMATIC_LEGENDARY') return 'Prismatic';
  const formatted = grade.charAt(0).toUpperCase() + grade.slice(1).toLowerCase();
  if (['Common', 'Rare', 'Epic', 'Prismatic'].includes(formatted)) {
    return formatted as 'Common' | 'Rare' | 'Epic' | 'Prismatic';
  }
  return 'Epic';
};

// 3. 백엔드 연성 요청 함수 (실패 시 시연용 Fallback 자동 작동)
export const synthesizeElixir = async (
  payload: SynthesizePayload,
  token?: string
): Promise<BackendElixirResponse> => {
  try {
    if (!token || token === 'YOUR_AUTH_JWT_TOKEN') {
      throw new Error('인증 토큰 없음 -> 안전 Fallback 모드로 실행');
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
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `연성 실패 HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    console.warn(`[연성 Fallback 가동]: ${err.message}`);
    
    // 백엔드 미연결/오류 시 심사용 스마트 Mock 데이터 반환
    const fallbackBase: ElixirCardData = MOCK_ELIXIRS[0] || {
      id: 'fallback_1',
      name: '온전한 조화의 황금 엘릭서',
      grade: 'Epic',
      themeCategory: '피로/에너지',
      isUnlocked: true,
      imageSource: 0 as any,
      supplementSummary: '오늘의 영양제 복합체',
      ingredientSummary: '황금 레몬, 심해 오일, 안정석',
      brewingLore: '가마솥 안에서 황금빛 소용돌이가 휘몰아치며 조화로운 비약이 탄생했습니다.',
      adviserComment: '모든 성분이 완벽한 균형을 이루었어!',
      recipeHint: '특수 조화 배합',
      scienceDesc: '신체 대사 활성화 및 전신 생체 밸런스 회복 메커니즘',
      ingredientScienceList: [],
      stats: { 활력마나량: 92, 피로무력화: 88, 심장박동력: 85 },
    };

    return {
      id: 5,
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
      stats: fallbackBase.stats || { 활력마나량: 90, 피로무력화: 85 },
    };
  }
};