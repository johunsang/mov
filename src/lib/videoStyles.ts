// ==================== 영상 장르 ====================
export const VIDEO_GENRES = [
  // 영화 장르
  { id: "cinematic", name: "시네마틱", description: "영화같은 느낌의 드라마틱한 연출", icon: "🎬" },
  { id: "action", name: "액션", description: "역동적이고 박진감 넘치는", icon: "💥" },
  { id: "horror", name: "호러/스릴러", description: "긴장감과 공포 연출", icon: "👻" },
  { id: "comedy", name: "코미디", description: "밝고 유머러스한 연출", icon: "😂" },
  { id: "romance", name: "로맨스", description: "감성적이고 아름다운 연출", icon: "💕" },
  { id: "drama", name: "드라마", description: "감동적인 스토리텔링", icon: "🎭" },
  { id: "sci-fi", name: "SF/공상과학", description: "미래적이고 과학기술 테마", icon: "🚀" },
  { id: "fantasy", name: "판타지", description: "마법과 환상의 세계", icon: "🧙" },
  { id: "noir", name: "느와르", description: "어둡고 범죄 스타일", icon: "🕵️" },
  { id: "western", name: "웨스턴", description: "서부극 스타일", icon: "🤠" },
  { id: "war", name: "전쟁/역사", description: "전투와 역사적 장면", icon: "⚔️" },
  { id: "mystery", name: "미스터리", description: "수수께끼와 추리", icon: "🔍" },

  // 콘텐츠 장르
  { id: "commercial", name: "광고/프로모션", description: "제품 홍보용 세련된 영상", icon: "📺" },
  { id: "documentary", name: "다큐멘터리", description: "사실적이고 정보 전달 중심", icon: "🎥" },
  { id: "music-video", name: "뮤직비디오", description: "음악에 맞는 역동적인 영상", icon: "🎵" },
  { id: "vlog", name: "브이로그", description: "일상적이고 친근한 느낌", icon: "📱" },
  { id: "tutorial", name: "튜토리얼", description: "설명 중심의 교육용 영상", icon: "📚" },
  { id: "animation", name: "애니메이션", description: "만화/애니메이션 스타일", icon: "🎨" },
  { id: "artistic", name: "아트/실험", description: "예술적이고 실험적인 표현", icon: "🖼️" },
  { id: "news", name: "뉴스/리포트", description: "뉴스 리포팅 스타일", icon: "📰" },
  { id: "interview", name: "인터뷰", description: "대담 및 인터뷰 형식", icon: "🎤" },
  { id: "travel", name: "여행", description: "여행 및 풍경 영상", icon: "✈️" },
  { id: "food", name: "음식/쿡방", description: "요리 및 음식 콘텐츠", icon: "🍳" },
  { id: "sports", name: "스포츠", description: "스포츠 하이라이트 스타일", icon: "⚽" },
  { id: "gaming", name: "게이밍", description: "게임 플레이 콘텐츠", icon: "🎮" },
  { id: "asmr", name: "ASMR", description: "소리 중심 감각 콘텐츠", icon: "🎧" },
  { id: "kids", name: "키즈/어린이", description: "어린이용 밝은 콘텐츠", icon: "🧸" },
  { id: "wedding", name: "웨딩/결혼식", description: "결혼식 촬영 스타일", icon: "💒" },
  { id: "corporate", name: "기업/비즈니스", description: "회사 소개 및 비즈니스", icon: "🏢" },
];

// ==================== 분위기/무드 ====================
export const VIDEO_MOODS = [
  // 긍정적/밝은 분위기
  { id: "epic", name: "웅장한", description: "강렬하고 인상적인, 대서사시 느낌", icon: "⚔️" },
  { id: "calm", name: "평화로운", description: "차분하고 여유로운, 힐링", icon: "🌿" },
  { id: "energetic", name: "활기찬", description: "역동적이고 신나는, 에너지 넘치는", icon: "⚡" },
  { id: "playful", name: "유쾌한", description: "재미있고 밝은, 장난스러운", icon: "🎉" },
  { id: "hopeful", name: "희망찬", description: "밝은 미래, 긍정적인 에너지", icon: "🌅" },
  { id: "joyful", name: "기쁜", description: "행복하고 축제 같은", icon: "🥳" },
  { id: "uplifting", name: "고양되는", description: "마음을 들뜨게 하는", icon: "🎈" },
  { id: "inspiring", name: "영감을 주는", description: "동기부여와 감동", icon: "✨" },
  { id: "triumphant", name: "승리감", description: "성취와 영광의 순간", icon: "🏆" },
  { id: "cozy", name: "아늑한", description: "따뜻하고 포근한", icon: "🏠" },

  // 감성적 분위기
  { id: "romantic", name: "로맨틱", description: "따뜻하고 감성적인, 사랑스러운", icon: "💝" },
  { id: "nostalgic", name: "향수적", description: "레트로하고 추억이 담긴", icon: "📷" },
  { id: "melancholy", name: "우울한", description: "슬프고 감상적인, 쓸쓸한", icon: "🌧️" },
  { id: "dreamy", name: "몽환적", description: "꿈같은, 초현실적인", icon: "💭" },
  { id: "sentimental", name: "센티멘탈", description: "감상에 젖은, 서정적", icon: "🥹" },
  { id: "bittersweet", name: "씁쓸한", description: "달콤하면서도 아픈", icon: "🍂" },
  { id: "longing", name: "그리운", description: "그리움과 갈망", icon: "💫" },
  { id: "intimate", name: "친밀한", description: "개인적이고 가까운", icon: "🤝" },

  // 신비/환상적 분위기
  { id: "mysterious", name: "신비로운", description: "몽환적이고 호기심 자극", icon: "🔮" },
  { id: "ethereal", name: "천상의", description: "신성하고 초월적인", icon: "👼" },
  { id: "magical", name: "마법같은", description: "환상과 경이로움", icon: "🪄" },
  { id: "surreal", name: "초현실적", description: "현실을 벗어난, 기이한", icon: "🎭" },
  { id: "whimsical", name: "기발한", description: "엉뚱하고 상상력 넘치는", icon: "🦄" },

  // 어두운/긴장감 분위기
  { id: "dark", name: "어두운", description: "긴장감 있고 무거운, 불길한", icon: "🌑" },
  { id: "tense", name: "긴장감", description: "조마조마한, 서스펜스", icon: "😰" },
  { id: "eerie", name: "으스스한", description: "불안하고 섬뜩한", icon: "👁️" },
  { id: "ominous", name: "불길한", description: "나쁜 일이 일어날 것 같은", icon: "⚠️" },
  { id: "gritty", name: "거친", description: "날것의, 현실적인 어둠", icon: "🏚️" },
  { id: "chaotic", name: "혼란스러운", description: "무질서하고 격동적인", icon: "🌪️" },
  { id: "intense", name: "강렬한", description: "압도적인 긴장과 몰입", icon: "🔥" },

  // 차분/명상적 분위기
  { id: "serene", name: "고요한", description: "평온하고 정적인", icon: "🕊️" },
  { id: "meditative", name: "명상적", description: "내면을 들여다보는", icon: "🧘" },
  { id: "contemplative", name: "사색적", description: "깊이 생각에 잠긴", icon: "💭" },
  { id: "zen", name: "선(禪)", description: "마음의 평화, 미니멀", icon: "☯️" },

  // 전문적/특수 분위기
  { id: "professional", name: "전문적", description: "비즈니스, 신뢰감 있는", icon: "💼" },
  { id: "luxurious", name: "럭셔리", description: "고급스럽고 우아한", icon: "💎" },
  { id: "retro", name: "레트로", description: "복고풍, 과거 스타일", icon: "📻" },
  { id: "futuristic", name: "미래적", description: "첨단 기술, SF 느낌", icon: "🤖" },
  { id: "raw", name: "날것의", description: "가공되지 않은 진정성", icon: "🎸" },
  { id: "elegant", name: "우아한", description: "세련되고 품격 있는", icon: "🎩" },
];

// ==================== 비주얼 스타일 ====================
export const VISUAL_STYLES = [
  { id: "realistic", name: "사실적", description: "실사 같은 고퀄리티, 포토리얼", icon: "📸" },
  { id: "stylized", name: "스타일화", description: "독특한 아트 스타일, 개성있는", icon: "🎭" },
  { id: "minimalist", name: "미니멀", description: "단순하고 깔끔한, 여백의 미", icon: "⬜" },
  { id: "vibrant", name: "비비드", description: "채도 높고 화려한, 강렬한 색감", icon: "🌈" },
  { id: "muted", name: "뮤트톤", description: "차분한 색감, 부드러운 톤", icon: "🩶" },
  { id: "vintage", name: "빈티지", description: "복고풍 필름 느낌, 레트로", icon: "📼" },
  { id: "neon", name: "네온", description: "사이버펑크/네온 조명, 형광", icon: "💜" },
  { id: "pastel", name: "파스텔", description: "부드러운 파스텔 톤, 아기자기", icon: "🍬" },
  { id: "monochrome", name: "흑백", description: "모노크롬, 클래식한 느낌", icon: "🖤" },
  { id: "high-contrast", name: "하이콘트라스트", description: "강한 명암 대비, 극적인", icon: "◐" },
  { id: "soft-focus", name: "소프트포커스", description: "부드럽게 흐린, 로맨틱", icon: "🌸" },
  { id: "gritty", name: "그리티", description: "거칠고 날것의, 리얼리즘", icon: "🏚️" },
];

// ==================== 조명 스타일 (신규) ====================
export const LIGHTING_STYLES = [
  { id: "natural", name: "자연광", description: "햇빛, 창문 빛 등 자연스러운 조명", icon: "☀️" },
  { id: "studio", name: "스튜디오", description: "전문 조명 세팅, 깔끔한", icon: "💡" },
  { id: "dramatic", name: "드라마틱", description: "강한 명암, 극적인 조명", icon: "🎭" },
  { id: "soft", name: "소프트", description: "부드럽고 은은한 조명", icon: "🕯️" },
  { id: "hard", name: "하드", description: "날카로운 그림자, 선명한", icon: "🔦" },
  { id: "backlight", name: "역광", description: "뒤에서 비추는 실루엣 효과", icon: "🌟" },
  { id: "rim-light", name: "림라이트", description: "피사체 테두리를 빛으로 강조", icon: "✨" },
  { id: "neon-glow", name: "네온글로우", description: "네온사인 느낌의 컬러풀한 빛", icon: "💜" },
  { id: "candlelight", name: "촛불", description: "따뜻한 촛불 조명, 아늑한", icon: "🕯️" },
];

// ==================== 카메라 앵글 (신규) ====================
export const CAMERA_ANGLES = [
  { id: "eye-level", name: "아이레벨", description: "눈높이에서 촬영, 가장 자연스러운", icon: "👁️" },
  { id: "low-angle", name: "로우앵글", description: "아래에서 위로, 웅장하고 강력한", icon: "⬆️" },
  { id: "high-angle", name: "하이앵글", description: "위에서 아래로, 작고 약해 보이는", icon: "⬇️" },
  { id: "birds-eye", name: "버즈아이", description: "완전 위에서 내려다보는 시점", icon: "🦅" },
  { id: "worms-eye", name: "웜즈아이", description: "바닥에서 올려다보는 극단적 앵글", icon: "🐛" },
  { id: "dutch-angle", name: "더치앵글", description: "기울어진 앵글, 불안감 조성", icon: "📐" },
  { id: "over-shoulder", name: "오버숄더", description: "어깨 너머로 촬영, 대화 장면", icon: "👤" },
  { id: "pov", name: "POV", description: "1인칭 시점, 몰입감", icon: "👀" },
];

// ==================== 카메라 샷 크기 (신규) ====================
export const SHOT_SIZES = [
  { id: "extreme-wide", name: "익스트림 와이드", description: "매우 넓은 전경, 장소 소개", icon: "🏔️" },
  { id: "wide", name: "와이드샷", description: "전체 장면이 보이는 넓은 샷", icon: "🌄" },
  { id: "full", name: "풀샷", description: "인물 전신이 보이는 샷", icon: "🧍" },
  { id: "medium-full", name: "미디엄풀", description: "무릎 위부터 보이는 샷", icon: "👔" },
  { id: "medium", name: "미디엄샷", description: "허리 위부터 보이는 샷", icon: "👕" },
  { id: "medium-close", name: "미디엄클로즈", description: "가슴 위부터 보이는 샷", icon: "🎽" },
  { id: "close-up", name: "클로즈업", description: "얼굴 위주의 가까운 샷", icon: "😊" },
  { id: "extreme-close", name: "익스트림클로즈", description: "눈, 입 등 극도로 가까운", icon: "👁️" },
];

// ==================== 카메라 움직임 ====================
export const CAMERA_MOVEMENTS = [
  { id: "static", name: "고정", description: "카메라 움직임 없이 안정적", icon: "📍" },
  { id: "pan", name: "패닝", description: "좌우로 천천히 회전", icon: "↔️" },
  { id: "tilt", name: "틸트", description: "위아래로 회전", icon: "↕️" },
  { id: "zoom-in", name: "줌인", description: "점점 가까이 확대", icon: "🔍" },
  { id: "zoom-out", name: "줌아웃", description: "점점 멀리 축소", icon: "🔎" },
  { id: "dolly-in", name: "달리인", description: "카메라가 앞으로 이동", icon: "➡️" },
  { id: "dolly-out", name: "달리아웃", description: "카메라가 뒤로 이동", icon: "⬅️" },
  { id: "tracking", name: "트래킹", description: "피사체를 따라 옆으로 이동", icon: "🚶" },
  { id: "crane-up", name: "크레인업", description: "위로 올라가며 촬영", icon: "⤴️" },
  { id: "crane-down", name: "크레인다운", description: "위에서 아래로 내려오며", icon: "⤵️" },
  { id: "handheld", name: "핸드헬드", description: "손떨림이 있는 현장감", icon: "✋" },
  { id: "steadicam", name: "스테디캠", description: "부드럽게 따라가는 움직임", icon: "🎥" },
  { id: "arc", name: "아크", description: "피사체 주위를 원형으로", icon: "🔄" },
  { id: "push-pull", name: "푸시풀", description: "줌과 달리를 동시에 (버티고)", icon: "🌀" },
];

// ==================== 속도감/페이싱 ====================
export const PACING_OPTIONS = [
  { id: "very-slow", name: "매우 느린", description: "명상적, 시적인 여유로움", icon: "🐢" },
  { id: "slow", name: "느린", description: "감성적이고 여유로운 페이스", icon: "🚶" },
  { id: "moderate", name: "보통", description: "자연스러운 일반적인 속도", icon: "🚗" },
  { id: "fast", name: "빠른", description: "역동적이고 긴장감 있는", icon: "🏃" },
  { id: "very-fast", name: "매우 빠른", description: "액션, 몽타주, 에너지 폭발", icon: "⚡" },
  { id: "varied", name: "변화있는", description: "상황에 따라 속도 변화", icon: "📈" },
  { id: "building", name: "점점 빨라지는", description: "클라이맥스를 향해 가속", icon: "🚀" },
  { id: "slowing", name: "점점 느려지는", description: "긴장 해소, 여운", icon: "🌊" },
];

// ==================== 전환 효과 (신규) ====================
export const TRANSITION_STYLES = [
  { id: "cut", name: "컷", description: "즉각적인 장면 전환, 기본", icon: "✂️" },
  { id: "fade", name: "페이드", description: "서서히 사라지고 나타나는", icon: "🌫️" },
  { id: "dissolve", name: "디졸브", description: "두 장면이 겹쳐지며 전환", icon: "💫" },
  { id: "wipe", name: "와이프", description: "한 방향으로 밀어내며 전환", icon: "👋" },
  { id: "zoom-transition", name: "줌 전환", description: "줌인/아웃하며 다음 장면으로", icon: "🔍" },
  { id: "whip-pan", name: "휩팬", description: "빠르게 패닝하며 전환", icon: "💨" },
  { id: "match-cut", name: "매치컷", description: "비슷한 모양/동작으로 연결", icon: "🔗" },
  { id: "j-cut", name: "J컷", description: "다음 장면 소리가 먼저", icon: "🔊" },
  { id: "l-cut", name: "L컷", description: "이전 장면 소리가 이어짐", icon: "🔉" },
  { id: "morph", name: "모프", description: "형태가 변형되며 전환", icon: "🦋" },
];

// ==================== 색보정/컬러그레이딩 (신규) ====================
export const COLOR_GRADES = [
  { id: "natural", name: "내추럴", description: "자연스러운 색감 그대로", icon: "🌿" },
  { id: "warm", name: "따뜻한", description: "오렌지/황금빛 톤, 아늑한", icon: "🔥" },
  { id: "cool", name: "차가운", description: "블루/청록 톤, 시원한", icon: "❄️" },
  { id: "teal-orange", name: "틸앤오렌지", description: "할리우드 블록버스터 스타일", icon: "🎬" },
  { id: "desaturated", name: "저채도", description: "색이 빠진 듯한 무드", icon: "🩶" },
  { id: "high-saturation", name: "고채도", description: "색이 진하고 화려한", icon: "🌈" },
  { id: "sepia", name: "세피아", description: "갈색 톤의 빈티지 느낌", icon: "📜" },
  { id: "cross-process", name: "크로스프로세스", description: "독특한 색 왜곡 효과", icon: "🎨" },
  { id: "bleach-bypass", name: "블리치바이패스", description: "은잔류 효과, 저채도 하이콘", icon: "🖤" },
  { id: "day-for-night", name: "데이포나잇", description: "낮에 촬영한 밤 장면 느낌", icon: "🌙" },
  { id: "lut-cinematic", name: "시네마틱LUT", description: "영화 필름 같은 색감", icon: "🎞️" },
  { id: "lut-vintage", name: "빈티지LUT", description: "오래된 필름 색감", icon: "📷" },
];

// ==================== 시간대/배경 (신규) ====================
export const TIME_SETTINGS = [
  { id: "dawn", name: "새벽", description: "동이 트기 전 어스름", icon: "🌅" },
  { id: "morning", name: "아침", description: "밝고 상쾌한 오전", icon: "☀️" },
  { id: "noon", name: "정오", description: "해가 높이 뜬 한낮", icon: "🌞" },
  { id: "afternoon", name: "오후", description: "따스한 햇살의 오후", icon: "🌤️" },
  { id: "golden-hour", name: "골든아워", description: "일몰 1시간 전 황금빛", icon: "🌇" },
  { id: "sunset", name: "일몰", description: "해가 지는 순간", icon: "🌆" },
  { id: "blue-hour", name: "블루아워", description: "해진 직후 푸른 빛", icon: "🌃" },
  { id: "night", name: "밤", description: "어두운 밤 시간", icon: "🌙" },
  { id: "midnight", name: "한밤중", description: "깊은 밤, 고요한", icon: "🌑" },
];

// ==================== 날씨/환경 (신규) ====================
export const WEATHER_SETTINGS = [
  { id: "clear", name: "맑음", description: "구름 없이 화창한", icon: "☀️" },
  { id: "cloudy", name: "흐림", description: "구름이 많은 날씨", icon: "☁️" },
  { id: "overcast", name: "잔뜩 흐림", description: "하늘 전체가 구름", icon: "🌥️" },
  { id: "rainy", name: "비", description: "비가 내리는", icon: "🌧️" },
  { id: "stormy", name: "폭풍", description: "번개와 강한 비바람", icon: "⛈️" },
  { id: "snowy", name: "눈", description: "눈이 내리는", icon: "🌨️" },
  { id: "foggy", name: "안개", description: "안개가 자욱한", icon: "🌫️" },
  { id: "misty", name: "옅은 안개", description: "살짝 뿌연 분위기", icon: "🌁" },
  { id: "windy", name: "바람", description: "바람이 부는", icon: "💨" },
  { id: "sunset-clouds", name: "노을", description: "붉게 물든 구름", icon: "🌅" },
];

// ==================== 영상 형식 ====================
export const VIDEO_FORMATS = [
  { id: "shorts", name: "쇼츠/릴스", description: "9:16 세로형, 60초 이내, SNS 최적화", aspectRatio: "9:16", maxDuration: 60, icon: "📱" },
  { id: "tiktok", name: "틱톡", description: "9:16 세로형, 15-60초, 트렌디한", aspectRatio: "9:16", maxDuration: 60, icon: "🎵" },
  { id: "standard", name: "유튜브 일반", description: "16:9 가로형, 3-10분, 표준", aspectRatio: "16:9", maxDuration: 600, icon: "▶️" },
  { id: "long", name: "롱폼", description: "16:9 가로형, 10분 이상, 깊이있는", aspectRatio: "16:9", maxDuration: 1800, icon: "🎬" },
  { id: "square", name: "정사각형", description: "1:1 정사각형, 인스타그램 피드", aspectRatio: "1:1", maxDuration: 180, icon: "⬛" },
  { id: "cinema-wide", name: "시네마 와이드", description: "2.35:1 영화 비율, 시네마틱", aspectRatio: "2.35:1", maxDuration: 1800, icon: "🎞️" },
  { id: "cinema-standard", name: "시네마 스탠다드", description: "1.85:1 영화 비율", aspectRatio: "1.85:1", maxDuration: 1800, icon: "🎥" },
];

// ==================== 영상 길이 ====================
export const VIDEO_DURATIONS = [
  { id: "15", name: "15초", description: "초단편, 임팩트 있는 한 장면", seconds: 15, icon: "⚡" },
  { id: "30", name: "30초", description: "광고/프로모션 적합, 핵심 전달", seconds: 30, icon: "📺" },
  { id: "60", name: "1분", description: "쇼츠/릴스 최대 길이, SNS 최적", seconds: 60, icon: "📱" },
  { id: "180", name: "3분", description: "짧은 콘텐츠, 집중력 유지", seconds: 180, icon: "🎯" },
  { id: "300", name: "5분", description: "중간 길이, 스토리 전개 가능", seconds: 300, icon: "📖" },
  { id: "600", name: "10분", description: "유튜브 표준, 완전한 이야기", seconds: 600, icon: "🎬" },
  { id: "900", name: "15분", description: "심화 콘텐츠, 상세 설명", seconds: 900, icon: "📚" },
  { id: "1200", name: "20분", description: "미니 다큐, 깊이있는 내용", seconds: 1200, icon: "🎥" },
];

// ==================== 스타일 인터페이스 ====================
export interface VideoStyleOptions {
  genre: string;
  mood: string;
  visualStyle: string;
  lightingStyle?: string; // deprecated, kept for compatibility
  cameraAngle: string;
  shotSize: string;
  cameraMovement: string;
  pacing: string;
  transitionStyle: string;
  colorGrade: string;
  timeSetting: string;
  weatherSetting?: string; // deprecated, kept for compatibility
  format: string;
  duration: string;
}

// ==================== 스타일 프롬프트 생성 ====================
export function generateStylePrompt(options: VideoStyleOptions, customGenre?: string, customMood?: string): string {
  const genre = VIDEO_GENRES.find((g) => g.id === options.genre);
  const mood = VIDEO_MOODS.find((m) => m.id === options.mood);
  const visual = VISUAL_STYLES.find((v) => v.id === options.visualStyle);
  const angle = CAMERA_ANGLES.find((a) => a.id === options.cameraAngle);
  const shot = SHOT_SIZES.find((s) => s.id === options.shotSize);
  const camera = CAMERA_MOVEMENTS.find((c) => c.id === options.cameraMovement);
  const pacing = PACING_OPTIONS.find((p) => p.id === options.pacing);
  const transition = TRANSITION_STYLES.find((t) => t.id === options.transitionStyle);
  const color = COLOR_GRADES.find((c) => c.id === options.colorGrade);
  const time = TIME_SETTINGS.find((t) => t.id === options.timeSetting);
  const format = VIDEO_FORMATS.find((f) => f.id === options.format);
  const duration = VIDEO_DURATIONS.find((d) => d.id === options.duration);

  // 커스텀 장르/분위기 처리
  const genreText = options.genre === "custom" && customGenre
    ? `${customGenre} (사용자 정의 장르)`
    : `${genre?.name} (${genre?.description})`;

  const moodText = options.mood === "custom" && customMood
    ? `${customMood} (사용자 정의 분위기)`
    : `${mood?.name} (${mood?.description})`;

  return `
[영상 제작 스타일 가이드]

■ 기본 정보
- 장르: ${genreText}
- 분위기: ${moodText}
- 영상 형식: ${format?.name} (화면비 ${format?.aspectRatio})
- 목표 길이: ${duration?.name} (${duration?.description})

■ 비주얼 스타일
- 시각 스타일: ${visual?.name} (${visual?.description})
- 색보정: ${color?.name} (${color?.description})
- 시간대: ${time?.name} (${time?.description})

■ 촬영 기법
- 카메라 앵글: ${angle?.name} (${angle?.description})
- 샷 크기: ${shot?.name} (${shot?.description})
- 카메라 움직임: ${camera?.name} (${camera?.description})

■ 편집 스타일
- 속도감: ${pacing?.name} (${pacing?.description})
- 전환 효과: ${transition?.name} (${transition?.description})

[지시사항]
1. 위 스타일 가이드를 모든 프레임에 일관되게 적용하세요.
2. ${format?.aspectRatio} 화면비에 맞는 구도로 촬영을 구성하세요.
3. ${time?.name} 시간대의 자연스러운 조명과 ${color?.name} 색보정을 활용하세요.
4. ${camera?.name} 카메라 움직임으로 ${mood?.name} 분위기를 연출하세요.
5. 장면 전환은 ${transition?.name} 스타일을 사용하세요.
`.trim();
}

// ==================== 프리셋 (신규) ====================
export const STYLE_PRESETS = [
  {
    id: "cinematic-epic",
    name: "시네마틱 대작",
    description: "할리우드 블록버스터 스타일",
    icon: "🎬",
    options: {
      genre: "cinematic",
      mood: "epic",
      visualStyle: "realistic",
      lightingStyle: "dramatic",
      cameraAngle: "low-angle",
      shotSize: "wide",
      cameraMovement: "crane-up",
      pacing: "building",
      transitionStyle: "dissolve",
      colorGrade: "teal-orange",
      timeSetting: "golden-hour",
      weatherSetting: "clear",
      format: "cinema-wide",
      duration: "600",
    }
  },
  {
    id: "sns-shorts",
    name: "SNS 쇼츠",
    description: "틱톡/릴스 바이럴 스타일",
    icon: "📱",
    options: {
      genre: "vlog",
      mood: "energetic",
      visualStyle: "vibrant",
      lightingStyle: "natural",
      cameraAngle: "eye-level",
      shotSize: "medium-close",
      cameraMovement: "handheld",
      pacing: "fast",
      transitionStyle: "whip-pan",
      colorGrade: "high-saturation",
      timeSetting: "afternoon",
      weatherSetting: "clear",
      format: "shorts",
      duration: "30",
    }
  },
  {
    id: "romantic-mv",
    name: "로맨틱 뮤비",
    description: "감성적인 뮤직비디오",
    icon: "💕",
    options: {
      genre: "romance",
      mood: "romantic",
      visualStyle: "soft-focus",
      lightingStyle: "soft",
      cameraAngle: "eye-level",
      shotSize: "medium",
      cameraMovement: "dolly-in",
      pacing: "slow",
      transitionStyle: "fade",
      colorGrade: "warm",
      timeSetting: "sunset",
      weatherSetting: "clear",
      format: "standard",
      duration: "180",
    }
  },
  {
    id: "horror-thriller",
    name: "호러 스릴러",
    description: "긴장감 넘치는 공포 연출",
    icon: "👻",
    options: {
      genre: "horror",
      mood: "tense",
      visualStyle: "gritty",
      lightingStyle: "hard",
      cameraAngle: "dutch-angle",
      shotSize: "close-up",
      cameraMovement: "handheld",
      pacing: "varied",
      transitionStyle: "cut",
      colorGrade: "desaturated",
      timeSetting: "night",
      weatherSetting: "foggy",
      format: "standard",
      duration: "300",
    }
  },
  {
    id: "documentary",
    name: "다큐멘터리",
    description: "사실적인 정보 전달",
    icon: "🎥",
    options: {
      genre: "documentary",
      mood: "calm",
      visualStyle: "realistic",
      lightingStyle: "natural",
      cameraAngle: "eye-level",
      shotSize: "medium",
      cameraMovement: "steadicam",
      pacing: "moderate",
      transitionStyle: "cut",
      colorGrade: "natural",
      timeSetting: "morning",
      weatherSetting: "clear",
      format: "long",
      duration: "600",
    }
  },
  {
    id: "vintage-aesthetic",
    name: "빈티지 감성",
    description: "레트로하고 향수적인",
    icon: "📷",
    options: {
      genre: "artistic",
      mood: "nostalgic",
      visualStyle: "vintage",
      lightingStyle: "soft",
      cameraAngle: "eye-level",
      shotSize: "medium",
      cameraMovement: "static",
      pacing: "slow",
      transitionStyle: "fade",
      colorGrade: "lut-vintage",
      timeSetting: "afternoon",
      weatherSetting: "cloudy",
      format: "square",
      duration: "60",
    }
  },
  {
    id: "action-sequence",
    name: "액션 시퀀스",
    description: "역동적인 액션 장면",
    icon: "💥",
    options: {
      genre: "action",
      mood: "energetic",
      visualStyle: "high-contrast",
      lightingStyle: "dramatic",
      cameraAngle: "low-angle",
      shotSize: "full",
      cameraMovement: "tracking",
      pacing: "very-fast",
      transitionStyle: "whip-pan",
      colorGrade: "bleach-bypass",
      timeSetting: "noon",
      weatherSetting: "clear",
      format: "cinema-wide",
      duration: "180",
    }
  },
  {
    id: "dreamy-fantasy",
    name: "몽환적 판타지",
    description: "꿈같은 초현실 세계",
    icon: "💭",
    options: {
      genre: "artistic",
      mood: "dreamy",
      visualStyle: "soft-focus",
      lightingStyle: "backlight",
      cameraAngle: "high-angle",
      shotSize: "wide",
      cameraMovement: "crane-down",
      pacing: "very-slow",
      transitionStyle: "morph",
      colorGrade: "cross-process",
      timeSetting: "blue-hour",
      weatherSetting: "misty",
      format: "cinema-standard",
      duration: "300",
    }
  },
];
