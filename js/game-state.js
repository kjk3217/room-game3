// ============================================
// 게임 상태 관리 (game-state.js)
// ============================================

// 게임 상태
let currentRoom = 1;
let completedQuizzes = JSON.parse(localStorage.getItem('completedQuizzes')) || [];
let currentQuiz = null;

// 타이머 관련 변수
let roomTimer = null;
let timeLeft = 420;  // ← 이렇게 단순하게 변경
let lastSavedRoom = parseInt(localStorage.getItem('lastSavedRoom')) || 1;  // ← 이 줄은 새로 추가
let tickSound = null;
let isTimerActive = false;

// 사운드 관련 변수
let backgroundMusic = null;
let clickSound = null;
let soundsLoaded = false;

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
    room2: 'videos/room2_to_room3.mp4',
    room3: 'videos/room3_to_ending.mp4'
};

// 퀴즈 데이터
const quizzes = {
    // 방 1: 품사의 기본 개념
    1: {
        title: "품사의 기본 개념",
        question: "단어를 공통된 성질에 따라 갈래를 나누어 놓은 것을 무엇이라고 할까요?",
        answers: ["품사"],
        type: "single"
    },
    2: {
        title: "품사의 종류",
        question: "문장에서 쓰일 때 형태가 변하는 단어(가변어)에 속하는 품사 두 가지는 동사와 무엇일까요?",
        answers: ["형용사"],
        type: "single"
    },
    3: {
        title: "품사의 분류 기준",
        question: "단어를 분류하는 세 가지 기준은 '형태', '의미' 그리고 무엇일까요?",
        answers: ["기능"],
        type: "single"
    },
    4: {
        title: "품사 분류하기 (첫 번째 방 탈출)",
        question: "주어진 단어들을 '형태가 변하는 말'과 '형태가 변하지 않는 말'로 올바르게 분류하여 방을 탈출하세요.",
        type: "word_classification",
        words: ['먹다', '예쁘다', '날다', '슬프다', '공부하다', '하늘', '나무', '아주', '와', '책'],
        categories: ['형태가 변함', '형태가 변하지 않음'],
        correctClassification: {
            '형태가 변함': ['먹다', '예쁘다', '날다', '슬프다', '공부하다'],
            '형태가 변하지 않음': ['하늘', '나무', '아주', '와', '책']
        }
    },
    // 방 2: 체언과 용언
    5: {
        title: "체언의 종류",
        question: "다음 빈칸에 들어갈 알맞은 단어를 순서대로 채우세요.\n\n1. 사람이나 사물의 이름을 나타내는 품사는? (예: 하늘, 사랑)\n2. 이름을 대신하여 가리키는 품사는? (예: 나, 우리, 여기)\n3. 수량이나 순서를 나타내는 품사는? (예: 하나, 첫째)\n4. 위 세 품사를 묶어 OOO이라고 합니다.",
        answers: ["명사", "대명사", "수사", "체언"],
        type: "four"
    },
    6: {
        title: "용언의 종류 (1)",
        question: "사람이나 사물의 움직임을 나타내는 품사는 무엇일까요? (예: 먹다, 달리다)",
        answers: ["동사"],
        type: "single"
    },
    7: {
        title: "품사 배열하기",
        question: "예시 문장: '나는 새 신발을 샀다.'\n\n아래 품사들을 위 문장의 순서에 맞게 올바르게 배열하세요.",
        shuffledWords: ["대명사", "조사", "관형사", "명사", "조사", "동사"].sort(() => Math.random() - 0.5),
        correctOrder: ["대명사", "조사", "관형사", "명사", "조사", "동사"],
        type: "word_sort"
    },
    8: {
        title: "두 번째 방 탈출",
        question: "두 번째 방을 탈출하기 위한 <span class='highlight-red'>비밀번호</span>.",
        answers: ["9"],
        type: "password"
    },
    // 방 3: 수식언, 관계언, 독립언
    9: {
        title: "수식언의 종류 (1)",
        question: "문장에서 주로 체언(명사, 대명사, 수사)을 꾸며 주는 역할을 하는 품사는 무엇일까요? (예: 새, 헌, 이, 그, 저)",
        answers: ["관형사"],
        type: "single"
    },
    10: {
        title: "품사 짝짓기",
        question: "각 품사와 그에 대한 설명을 올바르게 연결하세요.",
        periods: ["명사", "동사", "부사", "조사", "감탄사"],
        laws: ["대상의 이름을 나타냄", "대상의 움직임을 나타냄", "주로 용언을 꾸며 줌", "다른 말과의 문법적 관계를 나타냄", "놀람, 느낌, 부름, 대답을 나타냄"],
        correctMatches: {
            "명사": "대상의 이름을 나타냄",
            "동사": "대상의 움직임을 나타냄",
            "부사": "주로 용언을 꾸며 줌",
            "조사": "다른 말과의 문법적 관계를 나타냄",
            "감탄사": "놀람, 느낌, 부름, 대답을 나타냄"
        },
        type: "matching"
    },
    11: {
        title: "관계언",
        question: "문장에서 다른 단어와의 문법적 관계를 나타내거나 특별한 뜻을 더해주는 품사는 무엇일까요? (예: 이/가, 을/를, 은/는, 도)",
        answers: ["조사"],
        type: "single"
    },
    12: {
        title: "마지막 방 탈출",
        question: "마지막 방을 탈출하기 위한 <span class='highlight-red'>암호</span>.",
        answers: ["품사"],
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








