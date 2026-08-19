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
  themeCategory: '피부/항산화' | '피로/에너지' | '혈당/다이어트' | '수면/휴식' | '월식의 변이종';
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
  { id: 'm3', name: '황금 레몬', grade: 'Rare', count: 1, icon: '🍋' },
  { id: 'm4', name: '백옥 진주', grade: 'Epic', count: 1, icon: '⚪' },
  { id: 'm5', name: '활력초', grade: 'Common', count: 4, icon: '🌿' },
  { id: 'm6', name: '심장 태엽', grade: 'Rare', count: 2, icon: '⚙️' },
  { id: 'm7', name: '마룡 뿔', grade: 'Rare', count: 1, icon: '🐂' },
  { id: 'm8', name: '천년 뿌리', grade: 'Epic', count: 1, icon: '🪵' },
  { id: 'm9', name: '홀쭉 열매', grade: 'Common', count: 3, icon: '🫐' },
  { id: 'm10', name: '녹차잎', grade: 'Common', count: 2, icon: '🍃' },
  { id: 'm11', name: '포만 이끼', grade: 'Rare', count: 2, icon: '🌱' },
  { id: 'm12', name: '바나바잎', grade: 'Epic', count: 1, icon: '🍂' },
  { id: 'm13', name: '평온초', grade: 'Common', count: 2, icon: '🌾' },
  { id: 'm14', name: '안정석', grade: 'Rare', count: 3, icon: '🪨' },
  { id: 'm15', name: '해독 엉겅퀴', grade: 'Epic', count: 1, icon: '🌺' },
];

const POTION_FALLBACK_URL = 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=500';

const BASE_CORE_ELIXIRS: ElixirCardData[] = [
  // 1. 피부/항산화 (기본 해금)
  {
    id: 'skin_01',
    name: '탱글한 백옥 엘릭서',
    grade: 'Epic',
    themeCategory: '피부/항산화',
    isUnlocked: true,
    imageUrl: POTION_FALLBACK_URL,
    imageSource: getElixirImage('skin_01'),
    supplementSummary: '비타민 C & 글루타치온 복합제, 저분자 콜라겐 젤리',
    ingredientSummary: '황금 레몬, 탱탱 젤리, 백옥 진주',
    brewingLore: '가마솥에서 눈부신 은백색 거품이 솟구치며 신비로운 향이 퍼집니다! 황금 레몬의 산뜻한 햇살 기운과 백옥 진주의 정화력이 탱탱 젤리의 결속 마력과 완벽히 녹아들었습니다.',
    adviserComment: '피부 속 깊은 어둠을 걷어내고 세월의 풍파에도 흔들리지 않는 찬란한 백옥빛 결계를 둘러줄게. 매일 아침 거울 속에서 맑아진 피부를 확인해봐!',
    recipeHint: '아주 피부가 맑고 깨끗해질 것 같은 완벽한 배합이야!',
    scienceDesc: '비타민 C가 조효소로 작용해 콜라겐 합성을 촉진하고, 글루타치온이 멜라닌을 억제하며 산화된 비타민 C를 지속적으로 환원시킵니다. 이 세 성분이 맞물려 콜라겐 장벽 형성과 비타민 C 재생 회로를 가동해 피부 탄력 및 미백 시너지를 극대화합니다.',
    ingredientScienceList: [
      {
        name: '황금 레몬',
        original: '비타민 C (L-아스코르브산)',
        icon: '🍋',
        effect: '콜라겐 합성 효소(프롤릴 하이드록실라아제)의 필수 조효소로 작용하며 체내 유해 활성산소를 중화합니다.',
      },
      {
        name: '탱탱 젤리',
        original: '저분자 콜라겐 펩타이드',
        icon: '🍮',
        effect: '진피층 섬유아세포를 활성화해 무너지지 않는 탄력 결속망을 복원합니다.',
      },
      {
        name: '백옥 진주',
        original: '환원형 글루타치온 (GSH)',
        icon: '⚪',
        effect: '티로시나아제 활성을 억제해 멜라닌 침착을 차단하고 산화된 비타민 C를 환원시킵니다.',
      },
    ],
    stats: { '피부 투명도': 88, '장벽 결속력': 85, '항산화 방어': 80 },
  },
  // 2. 피로/에너지 (연성 시연용)
  {
    id: 'energy_01',
    name: '불타는 태양 엘릭서',
    grade: 'Epic',
    themeCategory: '피로/에너지',
    isUnlocked: false,
    imageUrl: POTION_FALLBACK_URL,
    imageSource: getElixirImage('energy_01'),
    supplementSummary: '고함량 비타민B 컴플렉스, 아르기닌 포션',
    ingredientSummary: '활력초, 심장 태엽, 마룡 뿔',
    brewingLore: '가마솥 안에서 붉은 용의 맥박 같은 맹렬한 열기가 요동칩니다! 심장 태엽이 거세게 회전하며 마룡 뿔의 폭발적인 혈류 마력과 활력초의 생기를 빨아들였습니다.',
    adviserComment: '지친 용사의 영혼에 꺼지지 않는 태양 마나 엔진을 장착해 줄게. 오늘 하루 한계 없는 활력을 경험해봐!',
    recipeHint: '더 폭발적인 대사열을 원한다면 씁쓸한 녹차잎을 한 꼬집 더해봐도 좋아!',
    scienceDesc: '아르기닌이 혈관을 확장해 혈류와 산소 공급을 늘리면, 비타민 B군이 이를 통해 빠르게 전달되어 세포 대사 회로를 가동합니다. 이어 코엔자임Q10이 전자를 전달받아 미토콘드리아에서 ATP 에너지를 폭발적으로 생성합니다.',
    ingredientScienceList: [
      {
        name: '활력초',
        original: '수용성 비타민 B 복합체',
        icon: '🌿',
        effect: '세포 내 TCA 대사 회로의 핵심 조효소로 작동하여 신속한 기력을 충전합니다.',
      },
      {
        name: '마룡 뿔',
        original: 'L-아르기닌',
        icon: '🐂',
        effect: '산화질소(NO) 생성을 촉진해 혈관을 확장하고 전신 산소 공급 속도를 높입니다.',
      },
      {
        name: '심장 태엽',
        original: '코엔자임Q10 (유비퀴논)',
        icon: '⚙️',
        effect: '미토콘드리아 내막 전자전달계에서 생체 에너지 화폐인 ATP를 폭발적으로 생성합니다.',
      },
    ],
    stats: { '활력 마나량': 92, '신속 순환력': 90, '심장 박동력': 85 },
  },
  // 3. 혈당/다이어트 (연성 시연용)
  {
    id: 'diet_01',
    name: '가뿐한 칠흑 엘릭서',
    grade: 'Epic',
    themeCategory: '혈당/다이어트',
    isUnlocked: false,
    imageUrl: POTION_FALLBACK_URL,
    imageSource: getElixirImage('diet_01'),
    supplementSummary: '가르시니아 앤 바나바 정제, 카테킨 녹차정',
    ingredientSummary: '홀쭉 열매, 녹차잎, 바나바잎',
    brewingLore: '짙은 비취빛 안개가 가마솥을 휘감으며 몸을 무겁게 짓누르던 탁기를 순식간에 흡수합니다! 바나바잎의 고대 결계가 식후 당독소를 가두고 지방의 족쇄를 불태웠습니다.',
    adviserComment: '식후에 찾아오는 나태한 졸음을 쫓아내고 몸을 깃털처럼 가볍게 만들어 줄게. 가뿐해진 발걸음으로 하루를 누벼봐!',
    recipeHint: '가짜 허기까지 꽉 잡고 싶다면 수분을 머금는 포만 이끼를 추가해봐!',
    scienceDesc: '바나바잎이 포도당 흡수를 도와 식후 혈당 스파이크를 막고, 가르시니아가 잉여 탄수화물의 지방 합성을 차단합니다. 카테킨이 갈색지방 열 발생을 자극해 3중 대사 방어선을 완성합니다.',
    ingredientScienceList: [
      {
        name: '바나바잎',
        original: '코로솔산 (Corosolic acid)',
        icon: '🍂',
        effect: '포도당 수송체(GLUT4)를 활성화해 식후 혈당 스파이크를 억제합니다.',
      },
      {
        name: '홀쭉 열매',
        original: '가르시니아 HCA',
        icon: '🫐',
        effect: '구연산 분해효소를 차단해 잉여 탄수화물이 체지방으로 합성·축적되는 경로를 봉쇄합니다.',
      },
      {
        name: '녹차잎',
        original: '카테킨 (EGCG)',
        icon: '🍃',
        effect: '교감신경계를 자극해 기초 대사열을 촉진하고 저장된 체지방의 산화를 유도합니다.',
      },
    ],
    stats: { '당독소 봉인': 89, '지방 연소열': 86, '흡수 차단력': 82 },
  },
  // 4. 수면/휴식 (연성 시연용)
  {
    id: 'sleep_01',
    name: '은은한 달빛 엘릭서',
    grade: 'Epic',
    themeCategory: '수면/휴식',
    isUnlocked: false,
    imageUrl: POTION_FALLBACK_URL,
    imageSource: getElixirImage('sleep_01'),
    supplementSummary: '마그네슘 & 테아닌 나이트',
    ingredientSummary: '평온초, 안정석, 해독 엉겅퀴',
    brewingLore: '가마솥 수면 위로 은은한 달빛 호수가 잔잔하게 차오르며 고요한 밤의 향기가 피어납니다! 안정석의 묵직한 파동과 평온초의 안식 기운이 신경을 감싸고, 해독 엉겅퀴가 잠든 사이 체내 독소를 맑게 정화합니다.',
    adviserComment: '오늘 밤은 모든 근심을 내려놓고 가장 깊고 평화로운 꿈의 심연으로 여행을 떠나봐.',
    recipeHint: '뒤척임 없이 깊은 잠에 빠져들 수 있는 최고의 나이트 루틴이야.',
    scienceDesc: '테아닌의 알파파 유도와 마그네슘의 신경계 이완, 실리마린의 간 해독이 수면 질을 극대화합니다.',
    ingredientScienceList: [
      {
        name: '평온초',
        original: 'L-테아닌 (L-Theanine)',
        icon: '🌾',
        effect: '흥분성 신경전달물질을 차단하고 안정 알파(α)파를 방출시켜 긴장을 완화합니다.',
      },
      {
        name: '안정석',
        original: '마그네슘 (Magnesium)',
        icon: '🪨',
        effect: 'NMDA 수용체를 차단하고 GABA를 활성화해 골격근 긴장을 풀고 깊은 서파 수면을 유도합니다.',
      },
      {
        name: '해독 엉겅퀴',
        original: '밀크씨슬 (실리마린)',
        icon: '🌺',
        effect: '수면 중 간세포 단백질 합성을 촉진해 야간 해독 및 피로 물질 정화를 진행합니다.',
      },
    ],
    stats: { '스트레스 차단': 96, '심연 수면도': 94, '독소 정화력': 90 },
  },
];

const CATEGORY_LIST: ElixirCardData['themeCategory'][] = [
  '피부/항산화',
  '피로/에너지',
  '혈당/다이어트',
  '수면/휴식',
  '월식의 변이종',
];

export const MOCK_ELIXIRS: ElixirCardData[] = CATEGORY_LIST.flatMap((category) => {
  const existing = BASE_CORE_ELIXIRS.filter((e) => e.themeCategory === category);
  const remainingCount = 16 - existing.length;

  const dummyList: ElixirCardData[] = Array.from({ length: remainingCount }, (_, i) => {
    const num = String(i + 1 + existing.length).padStart(2, '0');
    const isPrismatic = category === '월식의 변이종';

    return {
      id: `${category}_${num}`,
      name: isPrismatic ? `신비한 변이 엘릭서 ${num}` : `미지의 비약 ${num}`,
      grade: isPrismatic ? 'Prismatic' : i % 3 === 0 ? 'Rare' : i % 3 === 1 ? 'Common' : 'Epic',
      themeCategory: category,
      isUnlocked: false,
      serialNumber: isPrismatic ? `#00${num}` : undefined,
      imageUrl: POTION_FALLBACK_URL,
      imageSource: getElixirImage('skin_01'),
      supplementSummary: '미확인 영양 성분',
      ingredientSummary: '가마솥에서 연성하여 해금하세요',
      brewingLore: '아직 연성되지 않은 미지의 비약입니다.',
      adviserComment: '가마솥에 새로운 영양제와 재료를 넣어 이 비약을 발견해봐!',
      recipeHint: '새로운 재료를 조합해 미지의 레시피를 찾아봐!',
      scienceDesc: '연금술 조합을 통해 성분의 과학적 메커니즘을 밝혀낼 수 있습니다.',
      ingredientScienceList: [],
      stats: { '잠재력': 50, '순도': 50 },
    };
  });

  return [...existing, ...dummyList];
});