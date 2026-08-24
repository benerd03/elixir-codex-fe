// src/mockData.ts
import { ImageSourcePropType } from 'react-native';
import { getElixirImage } from '../constants/elixirImages';

export interface IngredientScience {
  name: string;
  original: string;
  icon: string;
  effect: string;
}

export interface ElixirCardData {
  id: string;
  name: string;
  grade: 'Common' | 'Rare' | 'Epic' | 'Prismatic';
  themeCategory: '피부/항산화' | '피로/에너지' | '혈당/다이어트' | '수면/휴식';
  imageUrl?: string;
  imageSource: ImageSourcePropType;
  isUnlocked: boolean;
  serialNumber?: string;
  supplementSummary: string;
  ingredientSummary: string;
  brewingLore: string;
  adviserComment: string;
  recipeHint: string;
  scienceDesc: string;
  ingredientScienceList: IngredientScience[];
  stats: Record<string, number>;
}

export interface MaterialData {
  id: string;
  name: string;
  grade: 'Common' | 'Rare' | 'Epic';
  count: number;
  icon: string;
}

export const MOCK_MATERIALS: MaterialData[] = [
  { id: 'm1', name: '이슬 한 방울', grade: 'Common', count: 3, icon: '💧' },
  { id: 'm2', name: '탱탱 젤리', grade: 'Common', count: 2, icon: '🍮' },
  { id: 'm3', name: '황금 레몬', grade: 'Rare', count: 2, icon: '🍋' },
  { id: 'm4', name: '백옥 진주', grade: 'Epic', count: 1, icon: '⚪' },
  { id: 'm5', name: '활력초', grade: 'Common', count: 4, icon: '🌿' },
  { id: 'm6', name: '심장 태엽', grade: 'Rare', count: 2, icon: '⚙️' },
  { id: 'm7', name: '마룡 뿔', grade: 'Rare', count: 1, icon: '🐂' },
  { id: 'm8', name: '천년 뿌리', grade: 'Epic', count: 1, icon: '🪵' },
  { id: 'm9', name: '홀쭉 열매', grade: 'Common', count: 3, icon: '🫐' },
  { id: 'm10', name: '녹차잎', grade: 'Common', count: 2, icon: '🍃' },
  { id: 'm11', name: '포만 이끼', grade: 'Rare', count: 2, icon: '🌱' },
  { id: 'm12', name: '바나바잎', grade: 'Epic', count: 1, icon: '🍂' },
  { id: 'm13', name: '평온초', grade: 'Common', count: 3, icon: '🌾' },
  { id: 'm14', name: '안정석', grade: 'Rare', count: 2, icon: '🪨' },
  { id: 'm15', name: '해독 엉겅퀴', grade: 'Epic', count: 1, icon: '🌺' },
  // ✨ 5번 [온전한 조화] 레시피 필수 재료 추가
  { id: 'm16', name: '심해 오일', grade: 'Rare', count: 2, icon: '🌊' },
  { id: 'm17', name: '황금 포자', grade: 'Common', count: 2, icon: '🍄' },
];

const POTION_FALLBACK_URL =
  'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=400';

// 👑 [1~4번] 4대 테마 기본 해금 엘릭서
export const UNLOCKED_CORE_4: ElixirCardData[] = [
  // ① 1번: 탱글한 백옥 엘릭서
  {
    id: 'skin_01',
    name: '탱글한 백옥 엘릭서',
    grade: 'Epic',
    themeCategory: '피부/항산화',
    isUnlocked: true,
    imageUrl: POTION_FALLBACK_URL,
    imageSource: getElixirImage('skin_01') || { uri: POTION_FALLBACK_URL },
    serialNumber: 'SK-001',
    supplementSummary: '황금 레몬(비타민 C) + 탱탱 젤리(콜라겐) + 백옥 진주(글루타치온)',
    ingredientSummary: '황금 레몬, 탱탱 젤리, 백옥 진주',
    brewingLore:
      '가마솥에서 눈부신 은백색 거품이 솟구치며 신비로운 향이 퍼집니다! 황금 레몬의 산뜻한 햇살 기운과 백옥 진주의 정화력이 탱탱 젤리의 결속 마력과 완벽히 녹아들었습니다.',
    adviserComment:
      '피부 속 깊은 어둠을 걷어내고 세월의 풍파에도 흔들리지 않는 찬란한 백옥빛 결계를 둘러줄게. 아주 피부가 맑고 깨끗해질 것 같은 완벽한 배합이야!',
    recipeHint: '피부 투명도 및 장벽 결속력 기본 수치 +20% 추가 보정',
    scienceDesc:
      '비타민 C가 콜라겐 합성을 촉진하고 글루타치온이 멜라닌을 억제하며 산화된 비타민 C를 지속적으로 환원시킵니다. 이 세 성분이 맞물려 콜라겐 장벽 형성과 비타민 C 재생 회로를 가동해 피부 탄력 및 미백 시너지를 극대화합니다.',
    ingredientScienceList: [
      {
        name: '황금 레몬',
        original: '비타민 C',
        icon: '🍋',
        effect: '콜라겐 합성 효소의 필수 조효소로 작용하며 활성산소를 제거합니다.',
      },
      {
        name: '탱탱 젤리',
        original: '콜라겐',
        icon: '🍮',
        effect: '진피층 섬유아세포를 활성화해 무너지지 않는 탄력망을 복원합니다.',
      },
      {
        name: '백옥 진주',
        original: '글루타치온',
        icon: '⚪',
        effect: '멜라닌 생성을 억제하고 산화된 비타민 C를 환원시켜 재생 회로를 가동합니다.',
      },
    ],
    stats: { '피부 투명도': 94, '장벽 결속력': 92, '항산화 방어': 88 },
  },

  // ② 2번: 불타는 태양 엘릭서
  {
    id: 'energy_01',
    name: '불타는 태양 엘릭서',
    grade: 'Epic',
    themeCategory: '피로/에너지',
    isUnlocked: true,
    imageUrl: POTION_FALLBACK_URL,
    imageSource: getElixirImage('energy_01') || { uri: POTION_FALLBACK_URL },
    serialNumber: 'EG-001',
    supplementSummary: '활력초(비타민 B군) + 심장 태엽(코엔자임Q10) + 마룡 뿔(L-아르기닌)',
    ingredientSummary: '활력초, 심장 태엽, 마룡 뿔',
    brewingLore:
      '가마솥 안에서 붉은 용의 맥박 같은 맹렬한 열기가 요동칩니다! 심장 태엽이 거세게 회전하며 마룡 뿔의 폭발적인 혈류 마력과 활력초의 생기를 빨아들였습니다.',
    adviserComment:
      '지친 용사의 영혼에 꺼지지 않는 태양 마나 엔진을 장착해 줄게. 더 폭발적인 대사열을 원한다면 씁쓸한 녹차잎을 한 꼬집 더해봐도 좋아!',
    recipeHint: '활력 마나량 및 신속 순환력 기본 수치 +25% 추가 보정',
    scienceDesc:
      '아르기닌의 혈류 확장이 산소와 비타민 B군의 대사 연료 공급을 가속하고, 코엔자임Q10이 이를 미토콘드리아에서 ATP 에너지로 즉시 전환합니다. 산소 공급-대사 촉진-에너지 생성이 삼위일체를 이루어 피로를 원천 봉쇄합니다.',
    ingredientScienceList: [
      {
        name: '활력초',
        original: '비타민 B군',
        icon: '🌿',
        effect: '세포 내 TCA 회로의 필수 조효소로 작동해 즉각적인 생체 에너지를 충전합니다.',
      },
      {
        name: '마룡 뿔',
        original: 'L-아르기닌',
        icon: '🐂',
        effect: '산화질소(NO)를 생성해 혈관을 확장하고 전신 산소 공급 속도를 높입니다.',
      },
      {
        name: '심장 태엽',
        original: '코엔자임Q10',
        icon: '⚙️',
        effect: '미토콘드리아 전자전달계에서 생체 에너지 단위인 ATP 생성을 촉진합니다.',
      },
    ],
    stats: { '활력 마나량': 96, '신속 순환력': 92, '심장 박동력': 90 },
  },

  // ③ 3번: 가뿐한 칠흑 엘릭서
  {
    id: 'diet_01',
    name: '가뿐한 칠흑 엘릭서',
    grade: 'Epic',
    themeCategory: '혈당/다이어트',
    isUnlocked: true,
    imageUrl: POTION_FALLBACK_URL,
    imageSource: getElixirImage('diet_01') || { uri: POTION_FALLBACK_URL },
    serialNumber: 'DT-001',
    supplementSummary: '홀쭉 열매(가르시니아) + 녹차잎(카테킨) + 바나바잎(바나바잎)',
    ingredientSummary: '홀쭉 열매, 녹차잎, 바나바잎',
    brewingLore:
      '짙은 비취빛 안개가 가마솥을 휘감으며 몸을 무겁게 짓누르던 탁기를 순식간에 흡수합니다! 바나바잎의 고대 결계가 식후 당독소를 가두고, 홀쭉 열매와 녹차잎의 정화열이 불필요한 지방의 족쇄를 모조리 불태웠습니다.',
    adviserComment:
      '식후에 찾아오는 나태한 졸음을 쫓아내고 몸을 깃털처럼 가볍게 만들어 줄게. 가짜 허기까지 꽉 잡고 싶다면 수분을 머금는 포만 이끼를 추가해봐!',
    recipeHint: '당독소 봉인 및 지방 연소열 기본 수치 +20% 추가 보정',
    scienceDesc:
      '바나바잎이 포도당 흡수를 도와 식후 혈당 스파이크를 막고, 가르시니아가 잉여 탄수화물의 지방 합성을 차단합니다. 여기에 카테킨의 대사열 발생이 더해져 당 흡수 억제-지방 합성 차단-저장 지방 연소의 3중 대사 방어선을 완성합니다.',
    ingredientScienceList: [
      {
        name: '바나바잎',
        original: '바나바잎',
        icon: '🍂',
        effect: '포도당 수송체를 활성화해 혈중 당분을 세포로 이동시켜 식후 혈당 스파이크를 막습니다.',
      },
      {
        name: '홀쭉 열매',
        original: '가르시니아',
        icon: '🫐',
        effect: '지방 합성 효소를 차단해 잉여 탄수화물이 체지방으로 축적되는 경로를 억제합니다.',
      },
      {
        name: '녹차잎',
        original: '카테킨',
        icon: '🍃',
        effect: '교감신경을 자극해 기초 대사열을 발생시키고 저장된 체지방 연소를 유도합니다.',
      },
    ],
    stats: { '당독소 봉인': 92, '지방 연소열': 94, '포만 유지력': 88 },
  },

  // ④ 4번: 은은한 달빛 엘릭서
  {
    id: 'sleep_01',
    name: '은은한 달빛 엘릭서',
    grade: 'Epic',
    themeCategory: '수면/휴식',
    isUnlocked: true,
    imageUrl: POTION_FALLBACK_URL,
    imageSource: getElixirImage('sleep_01') || { uri: POTION_FALLBACK_URL },
    serialNumber: 'SL-001',
    supplementSummary: '안정석(마그네슘) + 평온초(L-테아닌) + 해독 엉겅퀴(밀크씨슬)',
    ingredientSummary: '안정석, 평온초, 해독 엉겅퀴',
    brewingLore:
      '가마솥 수면 위로 은은한 달빛 호수가 잔잔하게 차오르며 고요한 밤의 향기가 피어납니다! 안정석의 묵직한 파동과 평온초의 안식 기운이 신경을 감싸고, 해독 엉겅퀴가 잠든 사이 체내 독소를 맑게 정화합니다.',
    adviserComment:
      '오늘 밤은 모든 근심을 내려놓고 가장 깊고 평화로운 꿈의 심연으로 여행을 떠나봐. 뒤척임 없이 깊은 잠에 빠져들 수 있는 최고의 나이트 루틴이야.',
    recipeHint: '스트레스 차단 및 심연 수면도 기본 수치 +25% 추가 보정',
    scienceDesc:
      '테아닌의 정신적 이완과 마그네슘의 근육 이완으로 깊은 숙면에 도달하며, 수면 시간 동안 밀크씨슬의 실리마린이 간세포 해독 및 재생을 진행하여 기상 시 피로를 상쾌하게 정화합니다.',
    ingredientScienceList: [
      {
        name: '평온초',
        original: 'L-테아닌',
        icon: '🌾',
        effect: '흥분 신경계를 진정시키고 안정 뇌파인 알파(α)파 방출을 유도합니다.',
      },
      {
        name: '안정석',
        original: '마그네슘',
        icon: '🪨',
        effect: '근육 이완과 신경계 평정을 도와 깊은 서파 수면에 머물게 합니다.',
      },
      {
        name: '해독 엉겅퀴',
        original: '밀크씨슬',
        icon: '🌺',
        effect: '수면 중 간세포의 글루타치온 합성과 야간 독소 해독을 진행합니다.',
      },
    ],
    stats: { '수면 깊이': 96, '신경 안정도': 94, '체내 정화력': 90 },
  },
];

// 4대 테마 목록
const CATEGORY_LIST: ElixirCardData['themeCategory'][] = [
  '피부/항산화',
  '피로/에너지',
  '혈당/다이어트',
  '수면/휴식',
];

// 나머지 60개 미해금 더미 생성
const LOCKED_DUMMY_LIST: ElixirCardData[] = CATEGORY_LIST.flatMap((category) => {
  return Array.from({ length: 15 }, (_, i) => {
    const num = String(i + 2).padStart(2, '0');
    return {
      id: `${category}_${num}`,
      name: `미지의 비약 ${num}`,
      grade: i % 3 === 0 ? 'Rare' : i % 3 === 1 ? 'Common' : 'Epic',
      themeCategory: category,
      imageUrl: POTION_FALLBACK_URL,
      imageSource: getElixirImage('skin_01') || { uri: POTION_FALLBACK_URL },
      isUnlocked: false, // 🔒 잠김
      supplementSummary: '미지의 영양소 배합',
      ingredientSummary: '연성을 통해 성분을 밝혀내세요',
      brewingLore: '아직 발견되지 않은 신비한 비약입니다. 가마솥에 재료를 넣어 연성해 보세요!',
      adviserComment: '가마솥에 신선한 재료를 넣으면 새로운 레시피가 탄생할 거야!',
      recipeHint: '매일 영양제를 섭취하고 퀘스트 재료를 모아 연성해봐.',
      scienceDesc: '새로운 시너지 조합이 발견되기를 기다리고 있습니다.',
      ingredientScienceList: [],
      stats: { 잠재력: 70, 안정도: 70, 순도: 70 },
    };
  });
});

// 🌟 전체 도감: 1~4번 해금 카드가 최상단에 나란히 배치됨
export const MOCK_ELIXIRS: ElixirCardData[] = [...UNLOCKED_CORE_4, ...LOCKED_DUMMY_LIST];