// ============================================
// 게임 상태 관리 (game-state.js)
// ============================================

// 게임 상태
let currentRoom = 1;
let completedQuizzes = JSON.parse(localStorage.getItem('completedQuizzes')) || [];
let currentQuiz = null;

// 타이머 관련 변수
let roomTimer = null;
let timeLeft = 600;
let tickSound = null;
let isTimerActive = false;

// 사운드 관련 변수
let backgroundMusic = null;
let clickSound = null;
let soundsLoaded = false;
let confettiInterval = null;

// 퍼즐 관련 변수
let puzzlePieces = [];
let puzzleCompleted = false;
let puzzleTouchElement = null;
let puzzleTouchOffsetX = 0;
let puzzleTouchOffsetY = 0;
let puzzleInitialParent = null;

// 전환 비디오 설정
const transitionVideos = {
    start: 'videos/start_to_room1.mp4',
    room1: 'videos/room1_to_room2.mp4',
    room2: 'videos/room2_to_room3.mp4'
};

// 퀴즈 데이터
const quizzes = {
    1: {
        title: "음운의 개념",
        question: "말의 뜻을 구별해 주는 가장 작은 소리의 단위를 무엇이라고 할까요?",
        answers: ["음운"],
        type: "single"
    },
    2: {
        title: "음운의 종류",
        question: "음운은 크게 OO과 OO으로 나눌 수 있습니다. 빈칸에 들어갈 말은 무엇일까요? (두 단어 입력)",
        answers: ["자음 모음", "모음 자음", "모음자음", "자음모음"],
        type: "single"
    },
    3: {
        title: "최소 대립쌍",
        question: "'물'과 '불'처럼, 오직 하나의 소리 때문에 뜻이 구별되는 단어의 쌍을 무엇이라고 할까요?",
        answers: ["최소대립쌍", "최소 대립쌍"],
        type: "single"
    },
    4: {
        title: "단모음 체계",
        question: "다음 단모음들을 혀의 높이에 따라 '고모음', '중모음', '저모음'으로 바르게 분류하세요.",
        type: "word_classification",
        words: ['ㅏ', 'ㅐ', 'ㅔ', 'ㅗ', 'ㅜ', 'ㅣ', 'ㅡ', 'ㅓ', 'ㅟ', 'ㅚ'],
        categories: ['고모음', '중모음', '저모음'],
        correctClassification: {
            '고모음': ['ㅣ', 'ㅜ', 'ㅡ', 'ㅟ'],
            '중모음': ['ㅔ', 'ㅗ', 'ㅓ', 'ㅚ'],
            '저모음': ['ㅐ', 'ㅏ']
        }
    },
    5: {
        title: "음운의 종류",
        question: "다음 빈칸에 들어갈 알맞은 음운을 순서대로 채우세요.\n\n1. 초성: 파열음이면서 예사소리이고 입술소리인 음운\n2. 중성: 후설모음이면서 평순모음이고 저모음인 음운\n3. 종성: 비음이면서 입술소리의 음운\n4. 위 세 음운을 묶어 알맞은 단어를 쓰시오.",
        answers: ["ㅂ", "ㅏ", "ㅁ", "밤"],
        type: "four"
    },
    6: {
        title: "콧소리와 흐름소리",
        question: "발음할 때 코를 통해 공기가 나오는 '콧소리(비음)'에 해당하는 자음 세 가지는 무엇일까요?",
        answers: ["ㄴㅁㅇ", "ㅁㄴㅇ", "ㅇㄴㅁ", "ㅁㅇㄴ", "ㅇㅁㄴ"],
        type: "single"
    },
    7: {
        title: "소리의 세기",
        question: "다음 자음들을 소리의 세기에 따라 'ㄱ-ㄲ-ㅋ' 순서로 올바르게 배열하세요.",
        shuffledWords: ["예사소리", "된소리", "거센소리"].sort(() => Math.random() - 0.5),
        correctOrder: ["예사소리", "된소리", "거센소리"],
        type: "word_sort"
    },
    8: {
        title: "두 번째 방 탈출",
        question: "두 번째 방을 탈출하기 위한 <span class='highlight-red'>비밀번호</span>.",
        answers: ["40"],
        type: "password"
    },
    9: {
        title: "단모음 vs 이중 모음",
        question: "발음할 때 입술 모양이나 혀의 위치가 변하지 않는 모음을 무엇이라고 할까요?",
        answers: ["단모음"],
        type: "single"
    },
    10: {
        title: "자음의 분류: 좋은 위치",
        question: "다음 자음들을 소리 나는 위치(조음 위치)에 따라 알맞게 짝지어 보세요.",
        periods: ["ㅁ, ㅂ, ㅍ", "ㄴ, ㄷ, ㄹ, ㅅ, ㅆ", "ㄱ, ㅋ, ㄲ, ㅇ", "ㅈ, ㅊ, ㅉ"],
        laws: ["입술소리 (양순음)", "잇몸소리 (치조음)", "여린입천장소리 (연구개음)", "센입천장소리 (경구개음)"],
        correctMatches: {
            "ㅁ, ㅂ, ㅍ": "입술소리 (양순음)",
            "ㄴ, ㄷ, ㄹ, ㅅ, ㅆ": "잇몸소리 (치조음)",
            "ㄱ, ㅋ, ㄲ, ㅇ": "여린입천장소리 (연구개음)",
            "ㅈ, ㅊ, ㅉ": "센입천장소리 (경구개음)"
        },
        type: "matching"
    },
    11: {
        title: "혀의 앞뒤, 입술 모양",
        question: "입술을 둥글게 오므리는 '원순 모음'이면서, 혀의 최고점이 뒤쪽에 위치하는 '후설 모음' 두 가지는 'ㅗ'와 무엇일까요?",
        answers: ["ㅜ"],
        type: "single"
    },
    12: {
        title: "마지막 방 탈출",
        question: "마지막 방을 탈출하기 위한 <span class='highlight-red'>암호</span>.",
        answers: ["음운"],
        type: "password"
    }
};

// 방별 스토리
const roomStories = {
    1: {
        title: "정령들의 속삭임",
        content: "어둠 속에서 빛의 정령들이 반짝인다. 빛의 정령을 찾아 지혜를 모아주세요! 정령들을 따라가 첫 번째 방을 탈출하라!"
    },
    2: {
        title: "정령들의 시험",
        content: "더 많은 정령들이 숨어있다. 진정한 탐구자만이 비밀을 풀 수 있어요. 숨겨진 힌트를 찾아 정령들을 깨워라!"
    },
    3: {
        title: "정령들의 선물",
        content: "마지막 방, 자유의 정령이 기다린다. 모든 지혜를 모아! 이제 자유를 향해! 빛의 힘을 모아 탈출의 문을 열어라!"
    }
};

// 답안 정규화 함수
function normalizeAnswer(answer) {
    return answer.toLowerCase()
                .replace(/\s+/g, '')
                .replace(/[이가을를의에서]/g, '');
}

// 방별 퀴즈 ID 반환
function getRoomQuizzes(roomNum) {
    switch(roomNum) {
        case 1: return [1, 2, 3, 4];
        case 2: return [5, 6, 7, 8];
        case 3: return [9, 10, 11, 12];
        default: return [];
    }

}

