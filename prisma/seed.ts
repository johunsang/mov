import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// 모든 기본 스타일 옵션 데이터
const styleOptionsData = {
  genre: [
    { optionId: "cinematic", name: "시네마틱", description: "영화같은 느낌의 드라마틱한 연출", icon: "🎬" },
    { optionId: "action", name: "액션", description: "역동적이고 박진감 넘치는", icon: "💥" },
    { optionId: "horror", name: "호러/스릴러", description: "긴장감과 공포 연출", icon: "👻" },
    { optionId: "comedy", name: "코미디", description: "밝고 유머러스한 연출", icon: "😂" },
    { optionId: "romance", name: "로맨스", description: "감성적이고 아름다운 연출", icon: "💕" },
    { optionId: "drama", name: "드라마", description: "감동적인 스토리텔링", icon: "🎭" },
    { optionId: "sci-fi", name: "SF/공상과학", description: "미래적이고 과학기술 테마", icon: "🚀" },
    { optionId: "fantasy", name: "판타지", description: "마법과 환상의 세계", icon: "🧙" },
    { optionId: "noir", name: "느와르", description: "어둡고 범죄 스타일", icon: "🕵️" },
    { optionId: "western", name: "웨스턴", description: "서부극 스타일", icon: "🤠" },
    { optionId: "war", name: "전쟁/역사", description: "전투와 역사적 장면", icon: "⚔️" },
    { optionId: "mystery", name: "미스터리", description: "수수께끼와 추리", icon: "🔍" },
    { optionId: "commercial", name: "광고/프로모션", description: "제품 홍보용 세련된 영상", icon: "📺" },
    { optionId: "documentary", name: "다큐멘터리", description: "사실적이고 정보 전달 중심", icon: "🎥" },
    { optionId: "music-video", name: "뮤직비디오", description: "음악에 맞는 역동적인 영상", icon: "🎵" },
    { optionId: "vlog", name: "브이로그", description: "일상적이고 친근한 느낌", icon: "📱" },
    { optionId: "tutorial", name: "튜토리얼", description: "설명 중심의 교육용 영상", icon: "📚" },
    { optionId: "animation", name: "애니메이션", description: "만화/애니메이션 스타일", icon: "🎨" },
    { optionId: "artistic", name: "아트/실험", description: "예술적이고 실험적인 표현", icon: "🖼️" },
    { optionId: "news", name: "뉴스/리포트", description: "뉴스 리포팅 스타일", icon: "📰" },
    { optionId: "interview", name: "인터뷰", description: "대담 및 인터뷰 형식", icon: "🎤" },
    { optionId: "travel", name: "여행", description: "여행 및 풍경 영상", icon: "✈️" },
    { optionId: "food", name: "음식/쿡방", description: "요리 및 음식 콘텐츠", icon: "🍳" },
    { optionId: "sports", name: "스포츠", description: "스포츠 하이라이트 스타일", icon: "⚽" },
    { optionId: "gaming", name: "게이밍", description: "게임 플레이 콘텐츠", icon: "🎮" },
    { optionId: "asmr", name: "ASMR", description: "소리 중심 감각 콘텐츠", icon: "🎧" },
    { optionId: "kids", name: "키즈/어린이", description: "어린이용 밝은 콘텐츠", icon: "🧸" },
    { optionId: "wedding", name: "웨딩/결혼식", description: "결혼식 촬영 스타일", icon: "💒" },
    { optionId: "corporate", name: "기업/비즈니스", description: "회사 소개 및 비즈니스", icon: "🏢" },
  ],
  mood: [
    { optionId: "epic", name: "웅장한", description: "강렬하고 인상적인, 대서사시 느낌", icon: "⚔️" },
    { optionId: "calm", name: "평화로운", description: "차분하고 여유로운, 힐링", icon: "🌿" },
    { optionId: "energetic", name: "활기찬", description: "역동적이고 신나는, 에너지 넘치는", icon: "⚡" },
    { optionId: "playful", name: "유쾌한", description: "재미있고 밝은, 장난스러운", icon: "🎉" },
    { optionId: "hopeful", name: "희망찬", description: "밝은 미래, 긍정적인 에너지", icon: "🌅" },
    { optionId: "joyful", name: "기쁜", description: "행복하고 축제 같은", icon: "🥳" },
    { optionId: "uplifting", name: "고양되는", description: "마음을 들뜨게 하는", icon: "🎈" },
    { optionId: "inspiring", name: "영감을 주는", description: "동기부여와 감동", icon: "✨" },
    { optionId: "triumphant", name: "승리감", description: "성취와 영광의 순간", icon: "🏆" },
    { optionId: "cozy", name: "아늑한", description: "따뜻하고 포근한", icon: "🏠" },
    { optionId: "romantic", name: "로맨틱", description: "따뜻하고 감성적인, 사랑스러운", icon: "💝" },
    { optionId: "nostalgic", name: "향수적", description: "레트로하고 추억이 담긴", icon: "📷" },
    { optionId: "melancholy", name: "우울한", description: "슬프고 감상적인, 쓸쓸한", icon: "🌧️" },
    { optionId: "dreamy", name: "몽환적", description: "꿈같은, 초현실적인", icon: "💭" },
    { optionId: "sentimental", name: "센티멘탈", description: "감상에 젖은, 서정적", icon: "🥹" },
    { optionId: "bittersweet", name: "씁쓸한", description: "달콤하면서도 아픈", icon: "🍂" },
    { optionId: "longing", name: "그리운", description: "그리움과 갈망", icon: "💫" },
    { optionId: "intimate", name: "친밀한", description: "개인적이고 가까운", icon: "🤝" },
    { optionId: "mysterious", name: "신비로운", description: "몽환적이고 호기심 자극", icon: "🔮" },
    { optionId: "ethereal", name: "천상의", description: "신성하고 초월적인", icon: "👼" },
    { optionId: "magical", name: "마법같은", description: "환상과 경이로움", icon: "🪄" },
    { optionId: "surreal", name: "초현실적", description: "현실을 벗어난, 기이한", icon: "🎭" },
    { optionId: "whimsical", name: "기발한", description: "엉뚱하고 상상력 넘치는", icon: "🦄" },
    { optionId: "dark", name: "어두운", description: "긴장감 있고 무거운, 불길한", icon: "🌑" },
    { optionId: "tense", name: "긴장감", description: "조마조마한, 서스펜스", icon: "😰" },
    { optionId: "eerie", name: "으스스한", description: "불안하고 섬뜩한", icon: "👁️" },
    { optionId: "ominous", name: "불길한", description: "나쁜 일이 일어날 것 같은", icon: "⚠️" },
    { optionId: "gritty", name: "거친", description: "날것의, 현실적인 어둠", icon: "🏚️" },
    { optionId: "chaotic", name: "혼란스러운", description: "무질서하고 격동적인", icon: "🌪️" },
    { optionId: "intense", name: "강렬한", description: "압도적인 긴장과 몰입", icon: "🔥" },
    { optionId: "serene", name: "고요한", description: "평온하고 정적인", icon: "🕊️" },
    { optionId: "meditative", name: "명상적", description: "내면을 들여다보는", icon: "🧘" },
    { optionId: "contemplative", name: "사색적", description: "깊이 생각에 잠긴", icon: "💭" },
    { optionId: "zen", name: "선(禪)", description: "마음의 평화, 미니멀", icon: "☯️" },
    { optionId: "professional", name: "전문적", description: "비즈니스, 신뢰감 있는", icon: "💼" },
    { optionId: "luxurious", name: "럭셔리", description: "고급스럽고 우아한", icon: "💎" },
    { optionId: "retro", name: "레트로", description: "복고풍, 과거 스타일", icon: "📻" },
    { optionId: "futuristic", name: "미래적", description: "첨단 기술, SF 느낌", icon: "🤖" },
    { optionId: "raw", name: "날것의", description: "가공되지 않은 진정성", icon: "🎸" },
    { optionId: "elegant", name: "우아한", description: "세련되고 품격 있는", icon: "🎩" },
  ],
  visualStyle: [
    { optionId: "realistic", name: "사실적", description: "실사 같은 고퀄리티, 포토리얼", icon: "📸" },
    { optionId: "stylized", name: "스타일화", description: "독특한 아트 스타일, 개성있는", icon: "🎭" },
    { optionId: "minimalist", name: "미니멀", description: "단순하고 깔끔한, 여백의 미", icon: "⬜" },
    { optionId: "vibrant", name: "비비드", description: "채도 높고 화려한, 강렬한 색감", icon: "🌈" },
    { optionId: "muted", name: "뮤트톤", description: "차분한 색감, 부드러운 톤", icon: "🩶" },
    { optionId: "vintage", name: "빈티지", description: "복고풍 필름 느낌, 레트로", icon: "📼" },
    { optionId: "neon", name: "네온", description: "사이버펑크/네온 조명, 형광", icon: "💜" },
    { optionId: "pastel", name: "파스텔", description: "부드러운 파스텔 톤, 아기자기", icon: "🍬" },
    { optionId: "monochrome", name: "흑백", description: "모노크롬, 클래식한 느낌", icon: "🖤" },
    { optionId: "high-contrast", name: "하이콘트라스트", description: "강한 명암 대비, 극적인", icon: "◐" },
    { optionId: "soft-focus", name: "소프트포커스", description: "부드럽게 흐린, 로맨틱", icon: "🌸" },
    { optionId: "gritty", name: "그리티", description: "거칠고 날것의, 리얼리즘", icon: "🏚️" },
    { optionId: "cartoon", name: "카툰", description: "만화 스타일, 굵은 외곽선, 단순한 색상", icon: "🎨" },
    { optionId: "anime", name: "애니메이션", description: "일본 애니메이션 스타일, 큰 눈, 생동감", icon: "✨" },
    { optionId: "comic", name: "코믹북", description: "미국 만화 스타일, 강렬한 색상, 역동적", icon: "💥" },
    { optionId: "pixar", name: "픽사/디즈니", description: "3D 애니메이션, 귀엽고 따뜻한", icon: "🧸" },
    { optionId: "watercolor", name: "수채화", description: "수채화 느낌, 부드럽고 예술적인", icon: "🖼️" },
    { optionId: "flat-design", name: "플랫 디자인", description: "심플하고 현대적인 일러스트", icon: "📐" },
    { optionId: "chibi", name: "치비/SD", description: "귀엽고 과장된 비율, 아기자기", icon: "🎀" },
  ],
  lightingStyle: [
    { optionId: "natural", name: "자연광", description: "햇빛, 창문 빛 등 자연스러운 조명", icon: "☀️" },
    { optionId: "studio", name: "스튜디오", description: "전문 조명 세팅, 깔끔한", icon: "💡" },
    { optionId: "dramatic", name: "드라마틱", description: "강한 명암, 극적인 조명", icon: "🎭" },
    { optionId: "soft", name: "소프트", description: "부드럽고 은은한 조명", icon: "🕯️" },
    { optionId: "hard", name: "하드", description: "날카로운 그림자, 선명한", icon: "🔦" },
    { optionId: "backlight", name: "역광", description: "뒤에서 비추는 실루엣 효과", icon: "🌟" },
    { optionId: "rim-light", name: "림라이트", description: "피사체 테두리를 빛으로 강조", icon: "✨" },
    { optionId: "neon-glow", name: "네온글로우", description: "네온사인 느낌의 컬러풀한 빛", icon: "💜" },
    { optionId: "candlelight", name: "촛불", description: "따뜻한 촛불 조명, 아늑한", icon: "🕯️" },
  ],
  cameraAngle: [
    { optionId: "eye-level", name: "아이레벨", description: "눈높이에서 촬영, 가장 자연스러운", icon: "👁️" },
    { optionId: "low-angle", name: "로우앵글", description: "아래에서 위로, 웅장하고 강력한", icon: "⬆️" },
    { optionId: "high-angle", name: "하이앵글", description: "위에서 아래로, 작고 약해 보이는", icon: "⬇️" },
    { optionId: "birds-eye", name: "버즈아이", description: "완전 위에서 내려다보는 시점", icon: "🦅" },
    { optionId: "worms-eye", name: "웜즈아이", description: "바닥에서 올려다보는 극단적 앵글", icon: "🐛" },
    { optionId: "dutch-angle", name: "더치앵글", description: "기울어진 앵글, 불안감 조성", icon: "📐" },
    { optionId: "over-shoulder", name: "오버숄더", description: "어깨 너머로 촬영, 대화 장면", icon: "👤" },
    { optionId: "pov", name: "POV", description: "1인칭 시점, 몰입감", icon: "👀" },
  ],
  shotSize: [
    { optionId: "extreme-wide", name: "익스트림 와이드", description: "매우 넓은 전경, 장소 소개", icon: "🏔️" },
    { optionId: "wide", name: "와이드샷", description: "전체 장면이 보이는 넓은 샷", icon: "🌄" },
    { optionId: "full", name: "풀샷", description: "인물 전신이 보이는 샷", icon: "🧍" },
    { optionId: "medium-full", name: "미디엄풀", description: "무릎 위부터 보이는 샷", icon: "👔" },
    { optionId: "medium", name: "미디엄샷", description: "허리 위부터 보이는 샷", icon: "👕" },
    { optionId: "medium-close", name: "미디엄클로즈", description: "가슴 위부터 보이는 샷", icon: "🎽" },
    { optionId: "close-up", name: "클로즈업", description: "얼굴 위주의 가까운 샷", icon: "😊" },
    { optionId: "extreme-close", name: "익스트림클로즈", description: "눈, 입 등 극도로 가까운", icon: "👁️" },
  ],
  cameraMovement: [
    { optionId: "static", name: "고정", description: "카메라 움직임 없이 안정적", icon: "📍" },
    { optionId: "pan", name: "패닝", description: "좌우로 천천히 회전", icon: "↔️" },
    { optionId: "tilt", name: "틸트", description: "위아래로 회전", icon: "↕️" },
    { optionId: "zoom-in", name: "줌인", description: "점점 가까이 확대", icon: "🔍" },
    { optionId: "zoom-out", name: "줌아웃", description: "점점 멀리 축소", icon: "🔎" },
    { optionId: "dolly-in", name: "달리인", description: "카메라가 앞으로 이동", icon: "➡️" },
    { optionId: "dolly-out", name: "달리아웃", description: "카메라가 뒤로 이동", icon: "⬅️" },
    { optionId: "tracking", name: "트래킹", description: "피사체를 따라 옆으로 이동", icon: "🚶" },
    { optionId: "crane-up", name: "크레인업", description: "위로 올라가며 촬영", icon: "⤴️" },
    { optionId: "crane-down", name: "크레인다운", description: "위에서 아래로 내려오며", icon: "⤵️" },
    { optionId: "handheld", name: "핸드헬드", description: "손떨림이 있는 현장감", icon: "✋" },
    { optionId: "steadicam", name: "스테디캠", description: "부드럽게 따라가는 움직임", icon: "🎥" },
    { optionId: "arc", name: "아크", description: "피사체 주위를 원형으로", icon: "🔄" },
    { optionId: "push-pull", name: "푸시풀", description: "줌과 달리를 동시에 (버티고)", icon: "🌀" },
  ],
  pacing: [
    { optionId: "very-slow", name: "매우 느린", description: "명상적, 시적인 여유로움", icon: "🐢" },
    { optionId: "slow", name: "느린", description: "감성적이고 여유로운 페이스", icon: "🚶" },
    { optionId: "moderate", name: "보통", description: "자연스러운 일반적인 속도", icon: "🚗" },
    { optionId: "fast", name: "빠른", description: "역동적이고 긴장감 있는", icon: "🏃" },
    { optionId: "very-fast", name: "매우 빠른", description: "액션, 몽타주, 에너지 폭발", icon: "⚡" },
    { optionId: "varied", name: "변화있는", description: "상황에 따라 속도 변화", icon: "📈" },
    { optionId: "building", name: "점점 빨라지는", description: "클라이맥스를 향해 가속", icon: "🚀" },
    { optionId: "slowing", name: "점점 느려지는", description: "긴장 해소, 여운", icon: "🌊" },
  ],
  transitionStyle: [
    { optionId: "cut", name: "컷", description: "즉각적인 장면 전환, 기본", icon: "✂️" },
    { optionId: "fade", name: "페이드", description: "서서히 사라지고 나타나는", icon: "🌫️" },
    { optionId: "dissolve", name: "디졸브", description: "두 장면이 겹쳐지며 전환", icon: "💫" },
    { optionId: "wipe", name: "와이프", description: "한 방향으로 밀어내며 전환", icon: "👋" },
    { optionId: "zoom-transition", name: "줌 전환", description: "줌인/아웃하며 다음 장면으로", icon: "🔍" },
    { optionId: "whip-pan", name: "휩팬", description: "빠르게 패닝하며 전환", icon: "💨" },
    { optionId: "match-cut", name: "매치컷", description: "비슷한 모양/동작으로 연결", icon: "🔗" },
    { optionId: "j-cut", name: "J컷", description: "다음 장면 소리가 먼저", icon: "🔊" },
    { optionId: "l-cut", name: "L컷", description: "이전 장면 소리가 이어짐", icon: "🔉" },
    { optionId: "morph", name: "모프", description: "형태가 변형되며 전환", icon: "🦋" },
  ],
  colorGrade: [
    { optionId: "natural", name: "내추럴", description: "자연스러운 색감 그대로", icon: "🌿" },
    { optionId: "warm", name: "따뜻한", description: "오렌지/황금빛 톤, 아늑한", icon: "🔥" },
    { optionId: "cool", name: "차가운", description: "블루/청록 톤, 시원한", icon: "❄️" },
    { optionId: "teal-orange", name: "틸앤오렌지", description: "할리우드 블록버스터 스타일", icon: "🎬" },
    { optionId: "desaturated", name: "저채도", description: "색이 빠진 듯한 무드", icon: "🩶" },
    { optionId: "high-saturation", name: "고채도", description: "색이 진하고 화려한", icon: "🌈" },
    { optionId: "sepia", name: "세피아", description: "갈색 톤의 빈티지 느낌", icon: "📜" },
    { optionId: "cross-process", name: "크로스프로세스", description: "독특한 색 왜곡 효과", icon: "🎨" },
    { optionId: "bleach-bypass", name: "블리치바이패스", description: "은잔류 효과, 저채도 하이콘", icon: "🖤" },
    { optionId: "day-for-night", name: "데이포나잇", description: "낮에 촬영한 밤 장면 느낌", icon: "🌙" },
    { optionId: "lut-cinematic", name: "시네마틱LUT", description: "영화 필름 같은 색감", icon: "🎞️" },
    { optionId: "lut-vintage", name: "빈티지LUT", description: "오래된 필름 색감", icon: "📷" },
  ],
  timeSetting: [
    { optionId: "dawn", name: "새벽", description: "동이 트기 전 어스름", icon: "🌅" },
    { optionId: "morning", name: "아침", description: "밝고 상쾌한 오전", icon: "☀️" },
    { optionId: "noon", name: "정오", description: "해가 높이 뜬 한낮", icon: "🌞" },
    { optionId: "afternoon", name: "오후", description: "따스한 햇살의 오후", icon: "🌤️" },
    { optionId: "golden-hour", name: "골든아워", description: "일몰 1시간 전 황금빛", icon: "🌇" },
    { optionId: "sunset", name: "일몰", description: "해가 지는 순간", icon: "🌆" },
    { optionId: "blue-hour", name: "블루아워", description: "해진 직후 푸른 빛", icon: "🌃" },
    { optionId: "night", name: "밤", description: "어두운 밤 시간", icon: "🌙" },
    { optionId: "midnight", name: "한밤중", description: "깊은 밤, 고요한", icon: "🌑" },
  ],
  weatherSetting: [
    { optionId: "clear", name: "맑음", description: "구름 없이 화창한", icon: "☀️" },
    { optionId: "cloudy", name: "흐림", description: "구름이 많은 날씨", icon: "☁️" },
    { optionId: "overcast", name: "잔뜩 흐림", description: "하늘 전체가 구름", icon: "🌥️" },
    { optionId: "rainy", name: "비", description: "비가 내리는", icon: "🌧️" },
    { optionId: "stormy", name: "폭풍", description: "번개와 강한 비바람", icon: "⛈️" },
    { optionId: "snowy", name: "눈", description: "눈이 내리는", icon: "🌨️" },
    { optionId: "foggy", name: "안개", description: "안개가 자욱한", icon: "🌫️" },
    { optionId: "misty", name: "옅은 안개", description: "살짝 뿌연 분위기", icon: "🌁" },
    { optionId: "windy", name: "바람", description: "바람이 부는", icon: "💨" },
    { optionId: "sunset-clouds", name: "노을", description: "붉게 물든 구름", icon: "🌅" },
  ],
  format: [
    { optionId: "shorts", name: "쇼츠/릴스", description: "9:16 세로형, 60초 이내, SNS 최적화", icon: "📱", metadata: { aspectRatio: "9:16", maxDuration: 60 } },
    { optionId: "tiktok", name: "틱톡", description: "9:16 세로형, 15-60초, 트렌디한", icon: "🎵", metadata: { aspectRatio: "9:16", maxDuration: 60 } },
    { optionId: "standard", name: "유튜브 일반", description: "16:9 가로형, 3-10분, 표준", icon: "▶️", metadata: { aspectRatio: "16:9", maxDuration: 600 } },
    { optionId: "long", name: "롱폼", description: "16:9 가로형, 10분 이상, 깊이있는", icon: "🎬", metadata: { aspectRatio: "16:9", maxDuration: 1800 } },
    { optionId: "square", name: "정사각형", description: "1:1 정사각형, 인스타그램 피드", icon: "⬛", metadata: { aspectRatio: "1:1", maxDuration: 180 } },
    { optionId: "cinema-wide", name: "시네마 와이드", description: "2.35:1 영화 비율, 시네마틱", icon: "🎞️", metadata: { aspectRatio: "2.35:1", maxDuration: 1800 } },
    { optionId: "cinema-standard", name: "시네마 스탠다드", description: "1.85:1 영화 비율", icon: "🎥", metadata: { aspectRatio: "1.85:1", maxDuration: 1800 } },
  ],
  duration: [
    { optionId: "15", name: "15초", description: "초단편, 임팩트 있는 한 장면", icon: "⚡", metadata: { seconds: 15 } },
    { optionId: "30", name: "30초", description: "광고/프로모션 적합, 핵심 전달", icon: "📺", metadata: { seconds: 30 } },
    { optionId: "60", name: "1분", description: "쇼츠/릴스 최대 길이, SNS 최적", icon: "📱", metadata: { seconds: 60 } },
    { optionId: "180", name: "3분", description: "짧은 콘텐츠, 집중력 유지", icon: "🎯", metadata: { seconds: 180 } },
    { optionId: "300", name: "5분", description: "중간 길이, 스토리 전개 가능", icon: "📖", metadata: { seconds: 300 } },
    { optionId: "600", name: "10분", description: "유튜브 표준, 완전한 이야기", icon: "🎬", metadata: { seconds: 600 } },
    { optionId: "900", name: "15분", description: "심화 콘텐츠, 상세 설명", icon: "📚", metadata: { seconds: 900 } },
    { optionId: "1200", name: "20분", description: "미니 다큐, 깊이있는 내용", icon: "🎥", metadata: { seconds: 1200 } },
  ],
};

async function main() {
  console.log("🌱 Starting seed...");

  // 기존 시스템 옵션 삭제
  await prisma.styleOption.deleteMany({
    where: { isSystem: true },
  });
  console.log("🗑️ Cleared existing system options");

  // 모든 타입별로 옵션 삽입
  let totalCount = 0;
  for (const [type, options] of Object.entries(styleOptionsData)) {
    const data = options.map((option, index) => ({
      type,
      optionId: option.optionId,
      name: option.name,
      description: option.description || null,
      icon: option.icon || "🎬",
      isSystem: true,
      sortOrder: index,
      metadata: "metadata" in option ? (option.metadata as Prisma.InputJsonValue) : Prisma.DbNull,
      userId: null,
    }));

    await prisma.styleOption.createMany({
      data,
      skipDuplicates: true,
    });

    console.log(`✅ Seeded ${data.length} ${type} options`);
    totalCount += data.length;
  }

  console.log(`\n🎉 Seed completed! Total: ${totalCount} style options`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
