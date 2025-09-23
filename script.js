// 기존 script.js 파일의 모든 내용을 지우고 아래 코드를 붙여넣으세요.

// 게임 상태
let currentRoom = 1;
let completedQuizzes = JSON.parse(localStorage.getItem('completedQuizzes')) || [];
let currentQuiz = null;

// 타이머 관련 변수
let roomTimer = null;
let timeLeft = 600; // 10분 = 600초
let tickSound = null;
let isTimerActive = false;

// 사운드 관련 변수
let backgroundMusic = null;
let clickSound = null;
let soundsLoaded = false;
let confettiInterval = null;

// 전환 비디오 설정 (엔딩 비디오 제거)
const transitionVideos = {
    start: 'videos/start_to_room1.mp4',      // 시작 → 방1
    room1: 'videos/room1_to_room2.mp4',      // 방1 → 방2
    room2: 'videos/room2_to_room3.mp4'       // 방2 → 방3
};

// 퀴즈 데이터 ('음운의 세계' 내용으로 교체)
const quizzes = {
    // === 방 1: 음운의 개념 ===
    1: {
        title: "음운의 개념",
        question: "말의 뜻을 구별해 주는 가장 작은 소리의 단위를 무엇이라고 할까요?",
        answers: ["음운"],
        type: "single"
    },
    2: {
        title: "음운의 종류",
        question: "음운은 크게 OOO과 OOO으로 나눌 수 있습니다. 빈칸에 들어갈 말은 무엇일까요? (두 단어 입력)",
        answers: ["자음", "모음"],
        type: "four" // UI 재활용을 위해 four 타입 사용 (입력칸 2개만 생성되도록 수정됨)
    },
    3: {
        title: "최소 대립쌍",
        question: "'물'과 '불'처럼, 오직 하나의 소리 때문에 뜻이 구별되는 단어의 쌍을 무엇이라고 할까요?",
        answers: ["최소대립쌍", "최소 대립쌍"],
        type: "single"
    },
    4: {
        title: "첫 번째 방 탈출",
        question: "주어진 단어들을 '자음'이 바뀌어 뜻이 달라진 단어와 '모음'이 바뀌어 뜻이 달라진 단어로 분류하여 방을 탈출하세요. (기준 단어: '달')",
        type: "word_classification",
        words: ['돌', '들', '말', '솔', '딸'],
        categories: ['자음이 바뀜', '모음이 바뀜'],
        correctClassification: {
            '자음이 바뀜': ['말', '솔', '딸'],
            '모음이 바뀜': ['돌', '들']
        }
    },
    // === 방 2: 자음의 세계 ===
    5: {
        title: "자음의 분류: 좋은 위치",
        question: "다음 자음들을 소리 나는 위치(조음 위치)에 따라 알맞게 짝지어 보세요.",
        type: "matching",
        periods: ["ㅁ, ㅂ, ㅍ", "ㄴ, ㄷ, ㄹ, ㅅ, ㅆ", "ㄱ, ㅋ, ㄲ, ㅇ", "ㅈ, ㅊ, ㅉ"],
        laws: ["입술소리 (양순음)", "잇몸소리 (치조음)", "여린입천장소리 (연구개음)", "센입천장소리 (경구개음)"],
        correctMatches: {
            "ㅁ, ㅂ, ㅍ": "입술소리 (양순음)",
            "ㄴ, ㄷ, ㄹ, ㅅ, ㅆ": "잇몸소리 (치조음)",
            "ㄱ, ㅋ, ㄲ, ㅇ": "여린입천장소리 (연구개음)",
            "ㅈ, ㅊ, ㅉ": "센입천장소리 (경구개음)"
        }
    },
    6: {
        title: "콧소리와 흐름소리",
        question: "발음할 때 코를 통해 공기가 나오는 '콧소리(비음)'에 해당하는 자음 세 가지는 'ㄴ, ㅁ' 그리고 무엇일까요?",
        answers: ["ㅇ"],
        type: "single"
    },
    7: {
        title: "소리의 세기",
        question: "다음 자음들을 소리의 세기에 따라 '예사소리-된소리-거센소리' 순서로 올바르게 배열하세요.",
        shuffledWords: ["ㄱ", "ㅋ", "ㄲ"].sort(() => Math.random() - 0.5),
        correctOrder: ["ㄱ", "ㄲ", "ㅋ"],
        type: "word_sort"
    },
    8: {
        title: "두 번째 방 탈출",
        question: "두 번째 방을 탈출하기 위한 비밀번호. (힌트: 입안이나 코안을 울려서 내는 소리로, 모든 모음과 자음 'ㄴ, ㄹ, ㅁ, ㅇ'이 여기에 속합니다.)",
        answers: ["울림소리"],
        type: "password"
    },
    // === 방 3: 모음의 세계 ===
    9: {
        title: "단모음 vs 이중 모음",
        question: "발음할 때 입술 모양이나 혀의 위치가 변하지 않는 모음을 무엇이라고 할까요?",
        answers: ["단모음"],
        type: "single"
    },
    10: {
        title: "단모음 체계",
        question: "다음 단모음들을 혀의 높이에 따라 '고모음', '중모음', '저모음'으로 바르게 분류하세요.",
        type: "word_classification",
        words: ['ㅏ', 'ㅐ', 'ㅔ', 'ㅗ', 'ㅜ', 'ㅣ', 'ㅡ', 'ㅓ'],
        categories: ['고모음', '중모음', '저모음'],
        correctClassification: {
            '고모음': ['ㅣ', 'ㅜ', 'ㅡ'],
            '중모음': ['ㅔ', 'ㅗ', 'ㅓ'],
            '저모음': ['ㅐ', 'ㅏ']
        }
    },
    11: {
        title: "혀의 앞뒤, 입술 모양",
        question: "입술을 둥글게 오므리는 '원순 모음'이면서, 혀의 최고점이 뒤쪽에 위치하는 '후설 모음' 두 가지는 'ㅗ'와 무엇일까요?",
        answers: ["ㅜ"],
        type: "single"
    },
    12: {
        title: "마지막 방 탈출",
        question: "마지막 방을 탈출하기 위한 암호. (힌트: '퐁당퐁당'과 '풍덩풍덩'처럼 양성 모음은 양성 모음끼리, 음성 모음은 음성 모음끼리 어울리는 현상)",
        answers: ["모음조화"],
        type: "password"
    }
};


// === ✨ 전체 화면 실행을 위한 함수 추가 ✨ ===
function requestFullScreen() {
    const elem = document.documentElement; // 전체 페이지를 대상으로 함
    if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(console.error);
    } else if (elem.mozRequestFullScreen) { // Firefox
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { // Chrome, Safari, Opera
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { // IE/Edge
        elem.msRequestFullscreen();
    }
}
// ===========================================

// 사운드 초기화 및 로드
function initializeSounds() {
    try {
        // 배경음악 초기화 (엔딩용)
        backgroundMusic = new Audio('sounds/ending_music.mp3');
        backgroundMusic.loop = true;
        backgroundMusic.volume = 0.6;

        // 클릭 사운드 초기화
        clickSound = new Audio('sounds/click_sound.mp3');
        clickSound.volume = 0.8;

        // 사운드 사전 로드
        const loadPromises = [
            new Promise((resolve, reject) => {
                backgroundMusic.addEventListener('canplaythrough', resolve, { once: true });
                backgroundMusic.addEventListener('error', reject, { once: true });
                backgroundMusic.load();
            }),
            new Promise((resolve, reject) => {
                clickSound.addEventListener('canplaythrough', resolve, { once: true });
                clickSound.addEventListener('error', reject, { once: true });
                clickSound.load();
            })
        ];

        Promise.all(loadPromises).then(() => {
            soundsLoaded = true;
            console.log('모든 사운드가 성공적으로 로드되었습니다.');
        }).catch(error => {
            console.log('사운드 로드 중 오류 발생:', error);
            soundsLoaded = false;
        });

    } catch (error) {
        console.log('사운드 초기화 실패:', error);
        soundsLoaded = false;
    }
}

// 클릭 사운드 재생
function playClickSound() {
    if (soundsLoaded && clickSound) {
        try {
            clickSound.currentTime = 0; // 사운드를 처음부터 재생
            clickSound.play().catch(error => {
                console.log('클릭 사운드 재생 실패:', error);
            });
        } catch (error) {
            console.log('클릭 사운드 재생 중 오류:', error);
        }
    }
}

// 배경음악 재생
function playBackgroundMusic() {
    if (soundsLoaded && backgroundMusic) {
        try {
            backgroundMusic.currentTime = 0;
            backgroundMusic.play().catch(error => {
                console.log('배경음악 재생 실패:', error);
            });
        } catch (error) {
            console.log('배경음악 재생 중 오류:', error);
        }
    }
}

// 배경음악 중지
function stopBackgroundMusic() {
    if (backgroundMusic) {
        try {
            backgroundMusic.pause();
            backgroundMusic.currentTime = 0;
        } catch (error) {
            console.log('배경음악 중지 중 오류:', error);
        }
    }
}

// 게임 시작 - 비디오 전환 포함 (텍스트 제거)
function startGame() {
    requestFullScreen(); // ✨ 시작 시 전체화면 요청
    console.log('게임 시작 버튼 클릭됨');

    // 비디오 전환 사용 (텍스트 없이)
    showTransitionWithVideo('start', () => {
        document.getElementById('startScreen').classList.add('fade-out');
        setTimeout(() => {
            document.getElementById('startScreen').style.display = 'none';
            document.getElementById('gameScreen').style.display = 'flex'; // ✨ flex로 변경
            setTimeout(() => {
                document.getElementById('gameScreen').classList.add('active');
                showRoom(1);
                startRoomTimer(); // 타이머 시작
            }, 50);
            loadGameState();
            updateUI();
        }, 800);
    });
}

// ✨ 게임 이어하기 함수 (새로 추가) ✨
function requestFullScreenAndResume() {
    requestFullScreen(); // 전체화면 요청

    // 화면 전환
    const resumeScreen = document.getElementById('resumeScreen');
    resumeScreen.style.transition = 'opacity 0.5s ease';
    resumeScreen.style.opacity = '0';

    setTimeout(() => {
        resumeScreen.style.display = 'none';
        document.getElementById('gameScreen').style.display = 'flex'; // ✨ flex로 변경
        setTimeout(() => {
            document.getElementById('gameScreen').classList.add('active');
            loadGameState();
            updateUI();
            startRoomTimer(); // 저장된 게임에서도 타이머 시작
        }, 50);
    }, 500);
}


// 타이머 초기화
function initTimer() {
    // Web Audio API를 사용해 똑딱 소리 생성
    try {
        const audioContext = new(window.AudioContext || window.webkitAudioContext)();

        function createTickSound() {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.type = 'square';

            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        }

        tickSound = createTickSound;
    } catch (error) {
        console.log('오디오 컨텍스트 생성 실패:', error);
        tickSound = null;
    }
}

// 방 타이머 시작
function startRoomTimer() {
    if (isTimerActive) return;

    timeLeft = 600; // 10분 리셋
    isTimerActive = true;
    updateTimerDisplay();
    initTimer();

    roomTimer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        // 똑딱 소리 재생 (마지막 2분)
        if (timeLeft <= 120 && tickSound) {
            try {
                tickSound();
            } catch (error) {
                console.log('똑딱 소리 재생 실패:', error);
            }
        }

        // 시간 경고
        if (timeLeft === 120) { // 2분 남음
            showTimerWarning();
        }

        // 시간 종료
        if (timeLeft <= 0) {
            gameOver();
        }
    }, 1000);
}

// 타이머 중지
function stopRoomTimer() {
    if (roomTimer) {
        clearInterval(roomTimer);
        roomTimer = null;
    }
    isTimerActive = false;
    hideTimerWarning();
}

// 타이머 디스플레이 업데이트
function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    const timerElement = document.getElementById('timer');
    timerElement.textContent = display;

    // 타이머 색상 변경
    timerElement.classList.remove('warning', 'danger');

    if (timeLeft <= 60) { // 1분 이하
        timerElement.classList.add('danger');
    } else if (timeLeft <= 120) { // 2분 이하
        timerElement.classList.add('warning');
    }
}

// 타이머 경고 표시
function showTimerWarning() {
    const warningElement = document.getElementById('timerWarning');
    warningElement.style.display = 'block';
}

// 타이머 경고 숨김
function hideTimerWarning() {
    const warningElement = document.getElementById('timerWarning');
    warningElement.style.display = 'none';
}

// 게임오버
function gameOver() {
    stopRoomTimer();
    stopBackgroundMusic(); // 배경음악 중지

    // 모든 화면 숨김
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('endingScreen').style.display = 'none';
    document.getElementById('startScreen').style.display = 'none';

    // 게임오버 화면 표시
    document.getElementById('gameOverScreen').style.display = 'flex';
    setTimeout(() => {
        document.getElementById('gameOverScreen').classList.add('active');
    }, 100);

    // 모달 닫기
    closeModal();
}

// 게임 상태 로드
function loadGameState() {
    const savedRoom = localStorage.getItem('currentRoom');
    if (savedRoom) {
        currentRoom = parseInt(savedRoom);
    }
    showRoom(currentRoom);
    completedQuizzes.forEach(quizId => {
        markQuizCompleted(quizId);
    });

    checkRoomCompletion();
}

// 퀴즈 열기 - 완료된 퀴즈도 열람 가능하도록 수정 + 클릭 사운드 추가
function openQuiz(quizId) {
    // 클릭 사운드 재생
    playClickSound();

    currentQuiz = quizId;
    const quiz = quizzes[quizId];
    const isCompleted = completedQuizzes.includes(quizId);

    const modalContent = document.querySelector('.modal-content');

    // 퀴즈 타입별로 크기 다르게 설정
    if (quiz.type === 'matching' || quiz.type === 'word_sort' || quiz.type === 'word_classification') {
        modalContent.style.maxWidth = '1300px'; // 복잡한 퀴즈는 크게
        modalContent.style.width = '95%';
    } else if (quiz.type === 'four') {
        modalContent.style.maxWidth = '1000px'; // 4개 입력은 중간
        modalContent.style.width = '95%';
    } else if (quiz.type === 'single' || quiz.type === 'password') {
        modalContent.style.maxWidth = '1000px'; // 단일 입력은 작게
        modalContent.style.width = '95%';
    } else {
        modalContent.style.maxWidth = '1000px'; // 기본 크기
        modalContent.style.width = '95%';
    }

    document.getElementById('quizTitle').style.display = 'block';
    document.getElementById('quizTitle').textContent = quiz.title;
    document.getElementById('quizQuestion').innerHTML = quiz.question;

    if (isCompleted) {
        createCompletedQuizDisplay(quiz);
    } else {
        createQuizInput(quiz.type);
    }

    document.getElementById('quizModal').style.display = 'flex';
}

// 완료된 퀴즈 표시 함수
function createCompletedQuizDisplay(quiz) {
    const inputContainer = document.getElementById('quizInput');
    inputContainer.innerHTML = '';

    const answerContainer = document.createElement('div');
    answerContainer.className = 'completed-quiz-display';

    answerContainer.innerHTML = `
        <h4 style="color: #00ff00; margin-bottom: 15px; font-size: 1.5rem;">✅ 정답 확인</h4>
        <p style="color: #ffd700; text-align: center; font-style: italic; margin-top: 15px; font-size: 1.1rem;">이미 해결한 문제입니다.</p>
    `;

    inputContainer.appendChild(answerContainer);

    const submitBtn = document.querySelector('.submit-btn');
    const closeBtn = document.querySelector('.close-btn');

    if (submitBtn) {
        submitBtn.style.display = 'none'; // 확인 버튼 숨기기
    }

    if (closeBtn) {
        closeBtn.textContent = '확인';
        closeBtn.style.background = 'linear-gradient(45deg, #4caf50, #2e7d32)';
    }
}


// 새로운 함수: 단어 분류 게임 생성
function createWordClassificationGame() {
    const inputContainer = document.getElementById('quizInput');
    inputContainer.innerHTML = '';

    const quiz = quizzes[currentQuiz];

    const gameContainer = document.createElement('div');
    gameContainer.className = 'word-classification-container';

    const unclassifiedContainer = document.createElement('div');
    unclassifiedContainer.className = 'unclassified-words-container';

    const instructionText = document.createElement('p');
    instructionText.textContent = '아래 단어들을 알맞은 곳으로 옮기세요.';
    instructionText.style.cssText = `text-align: center; color: #ffd700; font-size: 1.2rem; width: 100%; margin-bottom: 15px;`;
    unclassifiedContainer.appendChild(instructionText);

    const shuffledWords = [...quiz.words].sort(() => Math.random() - 0.5);
    shuffledWords.forEach((word, index) => {
        const wordElement = createWordElement(word, index);
        unclassifiedContainer.appendChild(wordElement);
    });

    const dropZonesContainer = document.createElement('div');
    dropZonesContainer.className = 'drop-zones-container';
    dropZonesContainer.style.cssText = `display: flex; gap: 20px; margin-top: 20px;`;

    quiz.categories.forEach(category => {
        const dropZone = document.createElement('div');
        dropZone.className = 'category-drop-zone';
        dropZone.dataset.category = category;
        dropZone.innerHTML = `<h3 style="text-align: center; color: #87ceeb; margin-bottom: 10px;">${category}</h3>`;
        dropZonesContainer.appendChild(dropZone);
    });

    gameContainer.appendChild(unclassifiedContainer);
    gameContainer.appendChild(dropZonesContainer);
    inputContainer.appendChild(gameContainer);

    setupDropZones(unclassifiedContainer, ...dropZonesContainer.querySelectorAll('.category-drop-zone'));
}


function checkWordClassificationCompletion() {
    const quiz = quizzes[currentQuiz];
    const unclassifiedContainer = document.querySelector('.unclassified-words-container');

    if (unclassifiedContainer.querySelectorAll('.word-element').length > 0) {
        return;
    }

    let allCorrect = true;
    document.querySelectorAll('.category-drop-zone').forEach(zone => {
        const category = zone.dataset.category;
        const correctWordsForCategory = [...quiz.correctClassification[category]].sort();
        const wordsInZone = Array.from(zone.querySelectorAll('.word-element')).map(el => el.dataset.word).sort();

        if (JSON.stringify(correctWordsForCategory) !== JSON.stringify(wordsInZone)) {
            allCorrect = false;
        }
    });

    if (allCorrect) {
        const wordElements = document.querySelectorAll('.category-drop-zone .word-element');
        wordElements.forEach((el, index) => {
            setTimeout(() => {
                el.style.background = 'linear-gradient(135deg, #4caf50, #2e7d32)';
                el.style.transform = 'scale(1.05)';
                setTimeout(() => { el.style.transform = 'scale(1)'; }, 200);
            }, index * 100);
        });

        setTimeout(correctAnswer, wordElements.length * 100 + 500);
    }
}


// 매칭 게임 생성
function createMatchingGame() {
    const inputContainer = document.getElementById('quizInput');
    inputContainer.innerHTML = '';

    const quiz = quizzes[currentQuiz];

    const gameContainer = document.createElement('div');
    gameContainer.className = 'matching-game-container';
    gameContainer.style.cssText = `display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: 1200px; margin: 0 auto; align-items: start;`;

    const periodsContainer = document.createElement('div');
    periodsContainer.className = 'periods-container';
    periodsContainer.style.cssText = `display: flex; flex-direction: column; gap: 15px;`;

    const lawsContainer = document.createElement('div');
    lawsContainer.className = 'laws-container';
    lawsContainer.style.cssText = `display: flex; flex-direction: column; gap: 15px;`;

    const shuffledLaws = [...quiz.laws].sort(() => Math.random() - 0.5);

    quiz.periods.forEach(period => {
        const periodItem = document.createElement('div');
        periodItem.className = 'period-item';
        periodItem.dataset.period = period;
        periodItem.textContent = period;
        periodItem.style.cssText = `background: linear-gradient(135deg, #8e24aa, #5e35b1); color: white; padding: 15px; border-radius: 10px; font-weight: bold; text-align: center; cursor: pointer; border: 3px solid transparent; transition: all 0.3s ease; font-size: 1.2rem;`;
        periodItem.addEventListener('click', () => selectPeriod(periodItem));
        periodsContainer.appendChild(periodItem);
    });

    shuffledLaws.forEach(law => {
        const lawItem = document.createElement('div');
        lawItem.className = 'law-item';
        lawItem.dataset.law = law;
        lawItem.textContent = law;
        lawItem.style.cssText = `background: linear-gradient(135deg, #4a90e2, #357abd); color: white; padding: 15px; border-radius: 10px; font-weight: bold; text-align: center; cursor: pointer; border: 3px solid transparent; transition: all 0.3s ease; font-size: 1.2rem;`;
        lawItem.addEventListener('click', () => selectLaw(lawItem));
        lawsContainer.appendChild(lawItem);
    });

    gameContainer.appendChild(periodsContainer);
    gameContainer.appendChild(lawsContainer);
    inputContainer.appendChild(gameContainer);

    window.selectedPeriod = null;
    window.currentMatches = {};
    window.correctMatches = quiz.correctMatches;
}

// 단어 정렬 게임 생성
function createWordSortGame() {
    const inputContainer = document.getElementById('quizInput');
    inputContainer.innerHTML = '';

    const quiz = quizzes[currentQuiz];

    const gameContainer = document.createElement('div');
    gameContainer.className = 'word-sort-game-container';
    gameContainer.style.cssText = `max-width: 900px; margin: 0 auto;`;

    const instructionText = document.createElement('p');
    instructionText.textContent = '단어를 드래그하여 올바른 순서로 배열하세요.';
    instructionText.style.cssText = `text-align: center; color: #ffd700; font-size: 1.2rem; margin-bottom: 30px; font-style: italic;`;

    const shuffledContainer = document.createElement('div');
    shuffledContainer.className = 'shuffled-words-container';

    const answerContainer = document.createElement('div');
    answerContainer.className = 'answer-words-container';

    const shuffledWords = [...quiz.shuffledWords].sort(() => Math.random() - 0.5);

    shuffledWords.forEach((word, index) => {
        const wordElement = createWordElement(word, index);
        shuffledContainer.appendChild(wordElement);
    });

    gameContainer.appendChild(instructionText);
    gameContainer.appendChild(shuffledContainer);
    gameContainer.appendChild(answerContainer);
    inputContainer.appendChild(gameContainer);

    setupDropZones(shuffledContainer, answerContainer);

    window.correctWordOrder = quiz.correctOrder;
}

// 단어 요소 생성
function createWordElement(word, index) {
    const wordElement = document.createElement('div');
    wordElement.className = 'word-element';
    wordElement.dataset.word = word;
    wordElement.dataset.index = index;
    wordElement.textContent = word;
    wordElement.draggable = true;

    wordElement.addEventListener('dragstart', handleDragStart);
    wordElement.addEventListener('dragend', handleDragEnd);
    wordElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    wordElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    wordElement.addEventListener('touchend', handleTouchEnd, { passive: false });

    return wordElement;
}

// 드롭 영역 설정 (가변 인자 ...containers 사용)
function setupDropZones(...containers) {
    containers.forEach(container => {
        if (container) {
            container.addEventListener('dragover', handleDragOver);
            container.addEventListener('drop', handleDrop);
        }
    });
}


// 드래그 시작
function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.index);
    e.target.classList.add('dragging');
}

// 드래그 종료
function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}


// 드래그 오버
function handleDragOver(e) {
    e.preventDefault();
}

// 드롭 처리
function handleDrop(e) {
    e.preventDefault();
    const draggedIndex = e.dataTransfer.getData('text/plain');
    const draggedElement = document.querySelector(`.word-element[data-index='${draggedIndex}']`);

    if (draggedElement && e.currentTarget.contains(draggedElement) === false) {
        e.currentTarget.appendChild(draggedElement);
    }

    const quizType = quizzes[currentQuiz].type;
    if (quizType === 'word_sort') {
        checkWordSortCompletion();
    } else if (quizType === 'word_classification') {
        checkWordClassificationCompletion();
    }
}


// === ✨ 터치 이벤트 핸들러 개선 ✨ ===
let draggedTouchElement = null;

function handleTouchStart(e) {
    e.preventDefault();
    draggedTouchElement = e.target;
    draggedTouchElement.classList.add('touch-dragging');
    document.body.style.overflow = 'hidden';
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!draggedTouchElement) return;

    const touch = e.touches[0];
    draggedTouchElement.style.left = `${touch.clientX - (draggedTouchElement.offsetWidth / 2)}px`;
    draggedTouchElement.style.top = `${touch.clientY - (draggedTouchElement.offsetHeight / 2)}px`;
}

function handleTouchEnd(e) {
    e.preventDefault();
    if (!draggedTouchElement) return;

    const touch = e.changedTouches[0];
    draggedTouchElement.style.display = 'none';
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    draggedTouchElement.style.display = '';

    const dropContainer = elementBelow?.closest('.shuffled-words-container, .answer-words-container, .category-drop-zone, .unclassified-words-container');

    draggedTouchElement.classList.remove('touch-dragging');
    draggedTouchElement.style.left = '';
    draggedTouchElement.style.top = '';
    document.body.style.overflow = '';

    if (dropContainer && !dropContainer.contains(draggedTouchElement)) {
        dropContainer.appendChild(draggedTouchElement);

        const quizType = quizzes[currentQuiz].type;
        if (quizType === 'word_sort') {
            checkWordSortCompletion();
        } else if (quizType === 'word_classification') {
            checkWordClassificationCompletion();
        }
    }

    draggedTouchElement = null;
}
// ===================================


// 단어 정렬 완료 확인
function checkWordSortCompletion() {
    const answerContainer = document.querySelector('.answer-words-container');
    const wordsInAnswer = Array.from(answerContainer.querySelectorAll('.word-element'))
        .map(el => el.dataset.word);
    const correctOrder = window.correctWordOrder;

    if (wordsInAnswer.length === correctOrder.length && JSON.stringify(wordsInAnswer) === JSON.stringify(correctOrder)) {
        const wordElements = answerContainer.querySelectorAll('.word-element');
        wordElements.forEach((el, index) => {
            setTimeout(() => {
                el.style.background = 'linear-gradient(135deg, #4caf50, #2e7d32)';
                el.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    el.style.transform = 'scale(1)';
                }, 200);
            }, index * 100);
        });

        setTimeout(correctAnswer, wordsInAnswer.length * 100 + 500);
    }
}

// 시대 선택
function selectPeriod(periodElement) {
    document.querySelectorAll('.period-item').forEach(item => {
        item.style.borderColor = 'transparent';
        item.style.boxShadow = 'none';
    });

    window.selectedPeriod = periodElement.dataset.period;
    periodElement.style.borderColor = '#ffd700';
    periodElement.style.boxShadow = '0 0 15px rgba(255,215,0,0.6)';
}

// 법 선택 및 매칭
function selectLaw(lawElement) {
    if (!window.selectedPeriod) {
        showMessage("먼저 왼쪽 항목을 선택해주세요!");
        return;
    }

    const selectedLaw = lawElement.dataset.law;
    window.currentMatches[window.selectedPeriod] = selectedLaw;

    const isCorrect = window.correctMatches[window.selectedPeriod] === selectedLaw;

    if (isCorrect) {
        lawElement.style.background = 'linear-gradient(135deg, #4caf50, #2e7d32)';
        lawElement.style.pointerEvents = 'none';

        const periodElement = document.querySelector(`[data-period="${window.selectedPeriod}"]`);
        periodElement.style.background = 'linear-gradient(135deg, #4caf50, #2e7d32)';
        periodElement.style.pointerEvents = 'none';

    } else {
        lawElement.style.background = 'linear-gradient(135deg, #f44336, #c62828)';
        setTimeout(() => {
            lawElement.style.background = 'linear-gradient(135deg, #4a90e2, #357abd)';
        }, 1000);
        delete window.currentMatches[window.selectedPeriod];
    }
    
    document.querySelector(`[data-period="${window.selectedPeriod}"]`).style.borderColor = 'transparent';
    window.selectedPeriod = null;

    if (Object.keys(window.currentMatches).length === Object.keys(window.correctMatches).length) {
        setTimeout(checkMatchingComplete, 500);
    }
}

// 매칭 완료 확인
function checkMatchingComplete() {
    let allCorrect = Object.keys(window.correctMatches).every(period => 
        window.currentMatches[period] === window.correctMatches[period]
    );

    if (allCorrect) {
        correctAnswer();
    }
}

// 퀴즈 입력 필드 생성
function createQuizInput(type) {
    const inputContainer = document.getElementById('quizInput');
    inputContainer.innerHTML = '';

    if (type === 'single' || type === 'password') {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'quizAnswer';
        input.placeholder = '정답을 입력하세요...';
        input.addEventListener('keypress', e => { if (e.key === 'Enter') checkAnswer(); });
        inputContainer.appendChild(input);
        setTimeout(() => input.focus(), 100);
    } else if (type === 'four') {
        const container = document.createElement('div');
        container.className = 'four-inputs';
        for (let i = 1; i <= 2; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.id = `answer${i}`;
            input.placeholder = `${i}번 정답`;
            input.addEventListener('keypress', e => { if (e.key === 'Enter') checkAnswer(); });
            container.appendChild(input);
        }
        inputContainer.appendChild(container);
        setTimeout(() => document.getElementById('answer1').focus(), 100);
    } else if (type === 'matching') {
        createMatchingGame();
    } else if (type === 'word_sort') {
        createWordSortGame();
    } else if (type === 'word_classification') {
        createWordClassificationGame();
    }

    const submitBtn = document.querySelector('.submit-btn');
    const closeBtn = document.querySelector('.close-btn');
    if (submitBtn) submitBtn.style.display = 'inline-block';
    if (closeBtn) {
        closeBtn.textContent = '닫기';
        closeBtn.style.background = 'linear-gradient(45deg, #f44336, #c62828)';
    }
}

// 정답 확인
function checkAnswer() {
    const quiz = quizzes[currentQuiz];
    let isCorrect = false;

    if (['matching', 'word_sort', 'word_classification'].includes(quiz.type)) return;

    if (quiz.type === 'four') {
        const answer1 = document.getElementById('answer1').value.trim();
        const answer2 = document.getElementById('answer2').value.trim();
        isCorrect = normalizeAnswer(answer1) === normalizeAnswer(quiz.answers[0]) &&
                    normalizeAnswer(answer2) === normalizeAnswer(quiz.answers[1]);
    } else {
        const userAnswer = document.getElementById('quizAnswer').value.trim();
        isCorrect = quiz.answers.some(answer => normalizeAnswer(answer) === normalizeAnswer(userAnswer));
    }

    if (isCorrect) {
        if (currentQuiz === 12) {
            correctAnswerForFinalQuiz();
        } else {
            correctAnswer();
        }
    } else {
        wrongAnswer();
    }
}

// 마지막 퀴즈 정답 처리
function correctAnswerForFinalQuiz() {
    completedQuizzes.push(currentQuiz);
    localStorage.setItem('completedQuizzes', JSON.stringify(completedQuizzes));
    markQuizCompleted(currentQuiz);
    updateUI();

    const modal = document.getElementById('quizModal');
    modal.style.transition = 'all 0.5s ease-out';
    modal.style.opacity = '0';
    modal.style.transform = 'scale(0.9)';

    setTimeout(() => {
        closeModal();
        modal.style.transition = '';
        modal.style.opacity = '1';
        modal.style.transform = 'scale(1)';
        setTimeout(startEndingSequence, 300);
    }, 500);
}

// 엔딩 시퀀스 시작
function startEndingSequence() {
    stopRoomTimer();

    const fadeOverlay = document.createElement('div');
    fadeOverlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: black; z-index: 8000; opacity: 0; transition: opacity 2s ease-in-out;`;
    document.body.appendChild(fadeOverlay);
    
    setTimeout(() => { fadeOverlay.style.opacity = '1'; }, 100);

    setTimeout(() => {
        document.getElementById('gameScreen').style.display = 'none';
        const endingScreen = document.getElementById('endingScreen');
        endingScreen.style.display = 'flex';
        endingScreen.classList.add('active');
        playBackgroundMusic();

        setTimeout(() => {
            fadeOverlay.style.opacity = '0';
            setTimeout(() => {
                fadeOverlay.remove();
                createCelebrationEffect();
                localStorage.setItem('gameCompleted', 'true');
            }, 2000);
        }, 500);
    }, 2000);
}

// 답안 정규화
function normalizeAnswer(answer) {
    return answer.toLowerCase().replace(/\s+/g, '');
}

// 정답 처리
function correctAnswer() {
    if (!completedQuizzes.includes(currentQuiz)) {
        completedQuizzes.push(currentQuiz);
    }
    localStorage.setItem('completedQuizzes', JSON.stringify(completedQuizzes));
    markQuizCompleted(currentQuiz);
    closeModal();
    updateUI();
    playCompletionEffect();
    checkRoomCompletion();
}

// 오답 처리
function wrongAnswer() {
    showMessage("다시 입력해 주세요");
    const inputs = document.querySelectorAll('#quizInput input, #quizInput textarea');
    inputs.forEach(input => input.value = '');
    if(inputs.length > 0) inputs[0].focus();
}

// 퀴즈 완료 표시
function markQuizCompleted(quizId) {
    const roomQuizzes = {
        1: [1,2,3,4], 2: [5,6,7,8], 3: [9,10,11,12]
    };
    for(const room in roomQuizzes){
        const index = roomQuizzes[room].indexOf(quizId);
        if(index > -1){
            const clickable = document.querySelectorAll(`#room${room} .clickable`)[index];
            if(clickable) clickable.classList.add('completed');
            break;
        }
    }
}

// 완료 효과
function playCompletionEffect() {
    const lastCompleted = document.querySelectorAll('.clickable.completed');
    const lastElement = lastCompleted[lastCompleted.length - 1];
    if (lastElement) {
        lastElement.style.animation = 'mysticalGlow 1s ease-in-out';
        setTimeout(() => {
            lastElement.style.animation = '';
        }, 1000);
    }
}

// 방 완료 확인
function checkRoomCompletion() {
    const roomQuizzes = getRoomQuizzes(currentRoom);
    const allCompleted = roomQuizzes.every(id => completedQuizzes.includes(id));

    if (allCompleted && currentRoom < 3) {
        document.getElementById('nextRoomBtn').style.display = 'block';
    } else {
        document.getElementById('nextRoomBtn').style.display = 'none';
    }
}

// 방별 퀴즈 ID 반환
function getRoomQuizzes(roomNum) {
    switch (roomNum) {
        case 1: return [1, 2, 3, 4];
        case 2: return [5, 6, 7, 8];
        case 3: return [9, 10, 11, 12];
        default: return [];
    }
}

// 축하 효과 생성
function createCelebrationEffect() {
    for (let i = 0; i < 50; i++) createConfetti();
    if(confettiInterval) clearInterval(confettiInterval);
    confettiInterval = setInterval(() => { for (let i = 0; i < 10; i++) createConfetti(); }, 200);
}

// 색종이 개별 생성
function createConfetti() {
    const confetti = document.createElement('div');
    const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
    confetti.style.cssText = `position: fixed; width: 10px; height: 10px; background: ${colors[Math.floor(Math.random() * colors.length)]}; top: -10px; left: ${Math.random() * 100}vw; z-index: 9999; border-radius: 2px; pointer-events: none; animation: confettiFall ${2 + Math.random() * 3}s linear forwards;`;
    document.body.appendChild(confetti);
    setTimeout(() => { if (confetti.parentNode) confetti.parentNode.removeChild(confetti); }, 5000);
}

// 다음 방으로 이동
function nextRoom() {
    const nextRoomNum = currentRoom + 1;
    stopRoomTimer();
    showTransitionWithVideo(`room${currentRoom}`, () => {
        document.getElementById(`room${currentRoom}`).classList.remove('active');
        currentRoom = nextRoomNum;
        localStorage.setItem('currentRoom', currentRoom);
        showRoom(currentRoom);
        document.getElementById('nextRoomBtn').style.display = 'none';
        updateUI();
        startRoomTimer();
    });
}

// 방 표시
function showRoom(roomNum) {
    document.querySelectorAll('.room').forEach(room => room.classList.remove('active'));
    document.getElementById(`room${roomNum}`).classList.add('active');
}


// UI 업데이트
function updateUI() {
    const totalCompleted = completedQuizzes.length;
    const roomNames = {
        1: "제1의 방: 음운의 개념",
        2: "제2의 방: 자음의 세계",
        3: "제3의 방: 모음의 세계"
    };
    document.getElementById('progress').textContent = `${totalCompleted}/12 완료`;
    document.getElementById('roomInfo').textContent = roomNames[currentRoom] || `방 ${currentRoom}`;
}

// 모달 닫기
function closeModal() {
    document.getElementById('quizModal').style.display = 'none';
    currentQuiz = null;
}

// 메시지 표시
function showMessage(text) {
    const message = document.createElement('div');
    message.className = 'message-toast'; // ✨ 새로운 클래스 이름
    message.textContent = text;
    document.body.appendChild(message);
    setTimeout(() => { if(message.parentNode) message.parentNode.removeChild(message) }, 2000);
}


// 게임 재시작
function restartGame() {
    stopRoomTimer();
    stopBackgroundMusic();
    if (confettiInterval) clearInterval(confettiInterval);

    const confettis = document.querySelectorAll('div[style*="confettiFall"]');
    confettis.forEach(c => { if(c.parentNode) c.parentNode.removeChild(c) });

    currentRoom = 1;
    completedQuizzes = [];
    currentQuiz = null;
    timeLeft = 600;
    isTimerActive = false;
    localStorage.clear();

    document.querySelectorAll('.clickable').forEach(el => el.classList.remove('completed'));
    
    document.getElementById('endingScreen').classList.remove('active');
    document.getElementById('gameOverScreen').classList.remove('active');

    setTimeout(() => {
        document.getElementById('endingScreen').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'none';

        const startScreen = document.getElementById('startScreen');
        startScreen.style.display = 'flex';
        startScreen.classList.remove('fade-out');
        document.getElementById('nextRoomBtn').style.display = 'none';
        
        hideTimerWarning();
        showRoom(1);
        updateUI();
        updateTimerDisplay(); // 타이머 표시 초기화
    }, 500);
}


// 비디오 포함 전환 효과
function showTransitionWithVideo(videoKey, callback) {
    const transition = document.getElementById('screenTransition');
    const video = document.getElementById('transitionVideo');
    video.muted = false;
    transition.classList.add('active');

    const videoSrc = transitionVideos[videoKey];
    let callbackExecuted = false;

    const executeCallback = () => {
        if (callbackExecuted) return;
        callbackExecuted = true;
        if (callback) callback();
        setTimeout(() => {
            transition.classList.remove('active');
            video.src = '';
        }, 300);
    };

    if (videoSrc) {
        video.src = videoSrc;
        const playPromise = video.play();
        if(playPromise !== undefined){
            playPromise.then(() => {
                video.addEventListener('ended', executeCallback, { once: true });
            }).catch(e => {
                console.log('비디오 자동재생 실패, 기본 전환으로 진행:', e);
                executeCallback();
            });
        }
    } else {
        console.log('비디오 파일 없음, 기본 전환 효과 사용');
        setTimeout(executeCallback, 500);
    }
}

// 키보드 이벤트 처리
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// 모달 외부 클릭 시 닫기
document.getElementById('quizModal').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });

// 페이지 로드 시 초기화
window.addEventListener('load', function() {
    initializeSounds();

    const style = document.createElement('style'); // ✨ 필요한 스타일 동적 추가
    style.textContent = `
        .message-toast {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.8);
            color: white;
            padding: 1.5rem 2.5rem;
            border-radius: 1rem;
            z-index: 10001;
            font-size: 1.5rem;
            animation: toast-fade 2s ease-in-out;
            pointer-events: none;
        }
        @keyframes toast-fade {
            0%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
            10%, 80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes confettiFall {
            to { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        .period-item.selected, .law-item.selected {
             border-color: #ffd700 !important;
             box-shadow: 0 0 15px rgba(255,215,0,0.6) !important;
        }
    `;
    document.head.appendChild(style);

    const gameCompleted = localStorage.getItem('gameCompleted');
    if (gameCompleted) {
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('endingScreen').style.display = 'flex';
        setTimeout(() => {
            document.getElementById('endingScreen').classList.add('active');
            playBackgroundMusic();
        }, 100);
    } else {
        const savedRoom = localStorage.getItem('currentRoom');
        const savedQuizzes = localStorage.getItem('completedQuizzes');

        if (savedRoom && savedQuizzes) {
            document.getElementById('startScreen').style.display = 'none';
            document.getElementById('resumeScreen').style.display = 'flex';
        } else {
            document.getElementById('startScreen').style.display = 'flex';
        }
    }
});
