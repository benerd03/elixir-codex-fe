// src/services/alchemyApi.ts
const BASE_URL = 'http://localhost:8080'; // 💡 백엔드 공인 IP/도메인으로 교체 가능

export interface SupplementItem {
  supplementLogId: string | number;
  productName: string;
  photoUrl?: string;
  createdAt: string;
  isVerified: boolean;
}

export interface SynthesizeResult {
  elixirCardId: number;
  name: string;
  grade: 'Common' | 'Rare' | 'Epic' | 'Prismatic';
  themeCategory: '피부/항산화' | '피로/에너지' | '혈당/다이어트' | '수면/휴식' | '월식의 변이종';
  imageUrl: string;
  adviserComment: string;
  serialNumber?: string;
  stats: Record<string, number>;
  ingredientSummary: string;
  supplementSummary: string;
  brewingLore: string;
  scienceDesc: string;
}

// 1. 오늘 인증된 영양제 목록 조회 (당일 자정 리셋)
export const fetchTodaySupplements = async (token?: string): Promise<SupplementItem[]> => {
  if (!token) return [];
  try {
    const res = await fetch(`${BASE_URL}/api/supplements`, {
      headers: { credentials: 'omit', Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('영양제 목록 로드 실패');
    return await res.json();
  } catch (err) {
    console.warn('API 미연결 - Mock 영양제 데이터 사용');
    return [];
  }
};

// 2. 연성 확정 API 호출 (재료 ID 목록 전달 -> 서버가 당일 영양제 자동 합산)
export const synthesizeElixir = async (
  ingredientCardIds: number[],
  token?: string
): Promise<SynthesizeResult | null> => {
  if (!token) return null;
  try {
    const res = await fetch(`${BASE_URL}/api/synthesize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ingredientCardIds }),
    });
    if (!res.ok) throw new Error('연성 실패');
    return await res.json();
  } catch (err) {
    console.warn('API 미연결 - 클라이언트 Mock 연성 로직 실행');
    return null;
  }
};