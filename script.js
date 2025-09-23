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

// 퀴즈 데이터 ('음운의 세계' 내용으로 수정 및 오류 해결)
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
        question: "음운은 크게 OOO과 OOO으로 나눌 수 있습니다. 빈칸에 들어갈 말은 무엇일까요? (순서대로 입력)",
        answers: ["자음", "모음"],
        type: "four" // 2개 입력이지만 UI 재활용
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
            '모음이 바뀜': ['돌', '들'] // '바낌' -> '바뀜' 오탈자 수정
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
        elem.requestFullscreen().catch(err => console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`));
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
        backgroundMusic = new Audio('sounds/ending_music.mp3');
        backgroundMusic.loop = true;
        backgroundMusic.volume = 0.6;

        clickSound = new Audio('sounds/click_sound.mp3');
        clickSound.volume = 0.8;

        const sounds = [backgroundMusic, clickSound];
        let loadedCount = 0;

        sounds.forEach(sound => {
            sound.addEventListener('canplaythrough', () => {
                loadedCount++;
                if (loadedCount === sounds.length) {
                    soundsLoaded = true;
                    console.log('모든 사운드가 성공적으로 로드되었습니다.');
                }
            }, { once: true });

            sound.addEventListener('error', (e) => {
                console.log('사운드 로드 중 오류 발생:', e);
                soundsLoaded = false;
            }, { once: true });
            sound.load();
        });

    } catch (error) {
        console.log('사운드 초기화 실패:', error);
        soundsLoaded = false;
    }
}

// 클릭 사운드 재생
function playClickSound() {
    if (soundsLoaded && clickSound) {
        clickSound.currentTime = 0;
        clickSound.play().catch(error => console.log('클릭 사운드 재생 실패:', error));
    }
}

// 배경음악 재생
function playBackgroundMusic() {
    if (soundsLoaded && backgroundMusic) {
        backgroundMusic.currentTime = 0;
        backgroundMusic.play().catch(error => console.log('배경음악 재생 실패:', error));
    }
}

// 배경음악 중지
function stopBackgroundMusic() {
    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }
}

// 게임 시작
function startGame() {
    requestFullScreen();
    console.log('게임 시작 버튼 클릭됨');
    showTransitionWithVideo('start', () => {
        document.getElementById('startScreen').classList.add('fade-out');
        setTimeout(() => {
            document.getElementById('startScreen').style.display = 'none';
            const gameScreen = document.getElementById('gameScreen');
            gameScreen.style.display = 'flex'; // display flex로 변경
            setTimeout(() => {
                gameScreen.classList.add('active');
                showRoom(1);
                startRoomTimer();
            }, 50);
            loadGameState();
            updateUI();
        }, 800);
    });
}

// 게임 이어하기
function requestFullScreenAndResume() {
    requestFullScreen();
    const resumeScreen = document.getElementById('resumeScreen');
    resumeScreen.style.transition = 'opacity 0.5s ease';
    resumeScreen.style.opacity = '0';
    setTimeout(() => {
        resumeScreen.style.display = 'none';
        const gameScreen = document.getElementById('gameScreen');
        gameScreen.style.display = 'flex'; // display flex로 변경
        setTimeout(() => {
            gameScreen.classList.add('active');
            loadGameState();
            updateUI();
            startRoomTimer();
        }, 50);
    }, 500);
}


// 타이머 초기화
function initTimer() {
    try {
        const audioContext = new(window.AudioContext || window.webkitAudioContext)();
        tickSound = () => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        };
    } catch (e) {
        console.log('오디오 컨텍스트 생성 실패:', e);
        tickSound = null;
    }
}

// 방 타이머 시작
function startRoomTimer() {
    if (isTimerActive) return;
    timeLeft = 600; // 10분
    isTimerActive = true;
    updateTimerDisplay();
    if (!tickSound) initTimer();

    roomTimer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 120 && tickSound) {
            tickSound();
        }
        if (timeLeft === 120) {
            showTimerWarning();
        }
        if (timeLeft <= 0) {
            gameOver();
        }
    }, 1000);
}

// 타이머 중지
function stopRoomTimer() {
    clearInterval(roomTimer);
    isTimerActive = false;
    hideTimerWarning();
}

// 타이머 디스플레이 업데이트
function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timerElement = document.getElementById('timer');
    timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    timerElement.classList.toggle('danger', timeLeft <= 60);
    timerElement.classList.toggle('warning', timeLeft > 60 && timeLeft <= 120);
}

// 타이머 경고 표시/숨김
function showTimerWarning() {
    document.getElementById('timerWarning').style.display = 'block';
}
function hideTimerWarning() {
    document.getElementById('timerWarning').style.display = 'none';
}


// 게임오버
function gameOver() {
    stopRoomTimer();
    stopBackgroundMusic();
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('endingScreen').style.display = 'none';
    const gameOverScreen = document.getElementById('gameOverScreen');
    gameOverScreen.style.display = 'flex';
    setTimeout(() => gameOverScreen.classList.add('active'), 100);
    closeModal();
}

// 게임 상태 로드
function loadGameState() {
    const savedRoom = localStorage.getItem('currentRoom');
    if (savedRoom) {
        currentRoom = parseInt(savedRoom, 10);
    }
    showRoom(currentRoom);
    completedQuizzes.forEach(markQuizCompleted);
    checkRoomCompletion();
}

// 퀴즈 열기
function openQuiz(quizId) {
    playClickSound();
    currentQuiz = quizId;
    const quiz = quizzes[quizId];
    const isCompleted = completedQuizzes.includes(quizId);
    const modalContent = document.querySelector('.modal-content');

    if (quiz.type === 'matching' || quiz.type === 'word_classification') {
        modalContent.style.maxWidth = '1300px';
    } else {
        modalContent.style.maxWidth = '1000px';
    }

    document.getElementById('quizTitle').textContent = quiz.title;
    document.getElementById('quizQuestion').innerHTML = quiz.question;

    if (isCompleted) {
        createCompletedQuizDisplay(quiz);
    } else {
        createQuizInput(quiz.type);
    }
    document.getElementById('quizModal').style.display = 'flex';
}

// 완료된 퀴즈 표시
function createCompletedQuizDisplay(quiz) {
    const inputContainer = document.getElementById('quizInput');
    inputContainer.innerHTML = '<h4 style="color: #00ff00; margin-bottom: 15px; font-size: 1.5rem;">✅ 완료된 퀴즈</h4>' +
        '<p style="color: #ffd700; text-align: center; font-style: italic; margin-top: 15px; font-size: 1.1rem;">' +
        '이미 해결한 문제입니다.</p>';
    document.querySelector('.submit-btn').style.display = 'none';
    const closeBtn = document.querySelector('.close-btn');
    closeBtn.textContent = '확인';
    closeBtn.style.background = 'linear-gradient(45deg, #4caf50, #2e7d32)';
}

// 단어 분류 게임 생성
function createWordClassificationGame() {
    const inputContainer = document.getElementById('quizInput');
    const quiz = quizzes[currentQuiz];
    const shuffledWords = [...quiz.words].sort(() => Math.random() - 0.5);

    let gameHTML = `
        <div class="unclassified-words-container">
            <p style="text-align: center; color: #ffd700; font-size: 1.2rem; width: 100%; margin-bottom: 15px;">
                아래 단어들을 알맞은 곳으로 옮기세요.
            </p>
            ${shuffledWords.map((word, index) => `<div class="word-element" draggable="true" data-word="${word}" data-index="${index}">${word}</div>`).join('')}
        </div>
        <div class="drop-zones-container" style="display: flex; gap: 20px; margin-top: 20px;">
            ${quiz.categories.map(category => `
                <div class="category-drop-zone" data-category="${category}">
                    <h3 style="text-align: center; color: #87ceeb; margin-bottom: 10px;">${category}</h3>
                </div>
            `).join('')}
        </div>
    `;
    inputContainer.innerHTML = gameHTML;
    setupDragAndDrop();
}

// 단어 분류 정답 확인
function checkWordClassificationCompletion() {
    const quiz = quizzes[currentQuiz];
    if (document.querySelector('.unclassified-words-container .word-element')) return;

    let allCorrect = true;
    document.querySelectorAll('.category-drop-zone').forEach(zone => {
        const category = zone.dataset.category;
        const correctWords = quiz.correctClassification[category].slice().sort();
        const wordsInZone = Array.from(zone.querySelectorAll('.word-element')).map(el => el.dataset.word).sort();

        if (JSON.stringify(correctWords) !== JSON.stringify(wordsInZone)) {
            allCorrect = false;
        }
    });

    if (allCorrect) {
        document.querySelectorAll('.category-drop-zone .word-element').forEach((el, index) => {
            setTimeout(() => {
                el.style.background = 'linear-gradient(135deg, #4caf50, #2e7d32)';
            }, index * 100);
        });
        setTimeout(correctAnswer, 500);
    }
}

// 매칭 게임 생성
function createMatchingGame() {
    const inputContainer = document.getElementById('quizInput');
    const quiz = quizzes[currentQuiz];
    const shuffledLaws = [...quiz.laws].sort(() => Math.random() - 0.5);

    let gameHTML = `
        <div class="matching-game-container" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start;">
            <div class="periods-container" style="display: flex; flex-direction: column; gap: 15px;">
                ${quiz.periods.map(period => `<div class="period-item" data-period="${period}">${period}</div>`).join('')}
            </div>
            <div class="laws-container" style="display: flex; flex-direction: column; gap: 15px;">
                ${shuffledLaws.map(law => `<div class="law-item" data-law="${law}">${law}</div>`).join('')}
            </div>
        </div>`;
    inputContainer.innerHTML = gameHTML;

    window.selectedPeriod = null;
    window.currentMatches = {};

    document.querySelectorAll('.period-item').forEach(p => p.addEventListener('click', () => selectPeriod(p)));
    document.querySelectorAll('.law-item').forEach(l => l.addEventListener('click', () => selectLaw(l)));
}

// 단어 정렬 게임 생성
function createWordSortGame() {
    const inputContainer = document.getElementById('quizInput');
    const quiz = quizzes[currentQuiz];
    const shuffledWords = [...quiz.shuffledWords].sort(() => Math.random() - 0.5);

    let gameHTML = `
        <div class="word-sort-game-container" style="max-width: 900px; margin: 0 auto;">
            <p style="text-align: center; color: #ffd700; margin-bottom: 30px;">단어를 드래그하여 올바른 순서로 배열하세요.</p>
            <div class="shuffled-words-container">${shuffledWords.map((word, index) => `<div class="word-element" draggable="true" data-word="${word}" data-index="${index}">${word}</div>`).join('')}</div>
            <div class="answer-words-container"></div>
        </div>`;
    inputContainer.innerHTML = gameHTML;
    setupDragAndDrop();
}

// 드래그 앤 드롭 설정
function setupDragAndDrop() {
    const draggables = document.querySelectorAll('.word-element');
    const containers = document.querySelectorAll('.shuffled-words-container, .answer-words-container, .category-drop-zone, .unclassified-words-container');

    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', () => draggable.classList.add('dragging'));
        draggable.addEventListener('dragend', () => draggable.classList.remove('dragging'));
    });

    containers.forEach(container => {
        container.addEventListener('dragover', e => {
            e.preventDefault();
            const draggable = document.querySelector('.dragging');
            container.appendChild(draggable);
        });
        container.addEventListener('drop', () => {
             if (quizzes[currentQuiz].type === 'word_sort') checkWordSortCompletion();
             if (quizzes[currentQuiz].type === 'word_classification') checkWordClassificationCompletion();
        });
    });
}


// 단어 정렬 완료 확인
function checkWordSortCompletion() {
   const answerContainer = document.querySelector('.answer-words-container');
   const wordsInAnswer = Array.from(answerContainer.querySelectorAll('.word-element')).map(el => el.dataset.word);
   const correctOrder = quizzes[currentQuiz].correctOrder;

   if (wordsInAnswer.length === correctOrder.length && JSON.stringify(wordsInAnswer) === JSON.stringify(correctOrder)) {
       answerContainer.querySelectorAll('.word-element').forEach((el, index) => {
           setTimeout(() => {
                el.style.background = 'linear-gradient(135deg, #4caf50, #2e7d32)';
           }, index * 100);
       });
       setTimeout(correctAnswer, 500);
   }
}

// 매칭 게임: 항목 선택
function selectPeriod(periodElement) {
    document.querySelectorAll('.period-item').forEach(item => item.classList.remove('selected'));
    periodElement.classList.add('selected');
    window.selectedPeriod = periodElement;
}

function selectLaw(lawElement) {
    if (!window.selectedPeriod) {
        showMessage("먼저 왼쪽 항목을 선택해주세요!");
        return;
    }
    const period = window.selectedPeriod.dataset.period;
    const law = lawElement.dataset.law;
    const correctLaw = quizzes[currentQuiz].correctMatches[period];

    if (law === correctLaw) {
        window.selectedPeriod.classList.add('matched');
        lawElement.classList.add('matched');
        window.selectedPeriod.style.pointerEvents = 'none';
        lawElement.style.pointerEvents = 'none';
        window.currentMatches[period] = law;

        if (Object.keys(window.currentMatches).length === Object.keys(quizzes[currentQuiz].correctMatches).length) {
            setTimeout(correctAnswer, 300);
        }
    } else {
        lawElement.classList.add('incorrect');
        setTimeout(() => lawElement.classList.remove('incorrect'), 500);
    }
    window.selectedPeriod.classList.remove('selected');
    window.selectedPeriod = null;
}

// 퀴즈 입력 필드 생성
function createQuizInput(type) {
    const inputContainer = document.getElementById('quizInput');
    inputContainer.innerHTML = ''; // Clear previous inputs

    if (type === 'single' || type === 'password') {
        inputContainer.innerHTML = '<input type="text" id="quizAnswer" placeholder="정답을 입력하세요...">';
        document.getElementById('quizAnswer').addEventListener('keypress', e => { if (e.key === 'Enter') checkAnswer(); });
        setTimeout(() => document.getElementById('quizAnswer').focus(), 100);
    } else if (type === 'four') { // 2개 정답용
        inputContainer.innerHTML = `
            <div class="four-inputs">
                <input type="text" id="answer1" placeholder="1번 정답">
                <input type="text" id="answer2" placeholder="2번 정답">
            </div>`;
        document.getElementById('answer2').addEventListener('keypress', e => { if (e.key === 'Enter') checkAnswer(); });
        setTimeout(() => document.getElementById('answer1').focus(), 100);
    } else if (type === 'matching') {
        createMatchingGame();
    } else if (type === 'word_sort') {
        createWordSortGame();
    } else if (type === 'word_classification') {
        createWordClassificationGame();
    }

    document.querySelector('.submit-btn').style.display = 'inline-block';
    const closeBtn = document.querySelector('.close-btn');
    closeBtn.textContent = '닫기';
    closeBtn.style.background = 'linear-gradient(45deg, #f44336, #c62828)';
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
    if (!completedQuizzes.includes(currentQuiz)) {
        completedQuizzes.push(currentQuiz);
        localStorage.setItem('completedQuizzes', JSON.stringify(completedQuizzes));
    }
    markQuizCompleted(currentQuiz);
    updateUI();
    const modal = document.getElementById('quizModal');
    modal.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
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

// 엔딩 시퀀스
function startEndingSequence() {
    stopRoomTimer();
    const fadeOverlay = document.createElement('div');
    Object.assign(fadeOverlay.style, {
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        background: 'black', zIndex: 8000, opacity: 0, transition: 'opacity 2s ease-in-out'
    });
    document.body.appendChild(fadeOverlay);
    setTimeout(() => fadeOverlay.style.opacity = '1', 100);

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
    checkRoomCompletion();
}

// 오답 처리
function wrongAnswer() {
    showMessage("정답이 아닙니다. 다시 시도해보세요!");
    const quizInput = document.getElementById('quizInput');
    quizInput.classList.add('incorrect-shake');
    setTimeout(() => quizInput.classList.remove('incorrect-shake'), 500);

    const inputs = quizInput.querySelectorAll('input');
    if (inputs.length > 0) {
        inputs.forEach(input => input.value = '');
        inputs[0].focus();
    }
}

// 퀴즈 완료 표시
function markQuizCompleted(quizId) {
    const roomNum = Math.ceil(quizId / 4);
    const quizIndexInRoom = (quizId - 1) % 4;
    const roomElement = document.getElementById(`room${roomNum}`);
    if (roomElement) {
        const clickable = roomElement.querySelectorAll('.clickable')[quizIndexInRoom];
        if(clickable) clickable.classList.add('completed');
    }
}

// 방 완료 확인
function checkRoomCompletion() {
    const roomQuizzes = [1, 2, 3, 4].map(q => q + (currentRoom - 1) * 4);
    const allCompleted = roomQuizzes.every(id => completedQuizzes.includes(id));
    if (allCompleted && currentRoom < 3) {
        document.getElementById('nextRoomBtn').style.display = 'block';
    } else {
        document.getElementById('nextRoomBtn').style.display = 'none';
    }
}

// 축하 효과 생성
function createCelebrationEffect() {
    if (confettiInterval) clearInterval(confettiInterval);
    confettiInterval = setInterval(createConfetti, 200);
}

function createConfetti() {
    const confetti = document.createElement('div');
    const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1'];
    confetti.style.cssText = `
        position: fixed; width: 10px; height: 10px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        top: -10px; left: ${Math.random() * 100}vw;
        z-index: 9999; border-radius: 2px; pointer-events: none;
        animation: confettiFall ${2 + Math.random() * 3}s linear forwards;
    `;
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 5000);
}

// 다음 방으로
function nextRoom() {
    stopRoomTimer();
    showTransitionWithVideo(`room${currentRoom}`, () => {
        document.getElementById(`room${currentRoom}`).classList.remove('active');
        currentRoom++;
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
    const roomNames = ["제1의 방: 음운의 개념", "제2의 방: 자음의 세계", "제3의 방: 모음의 세계"];
    document.getElementById('progress').textContent = `${completedQuizzes.length}/12 완료`;
    document.getElementById('roomInfo').textContent = roomNames[currentRoom - 1];
}

// 모달 닫기
function closeModal() {
    document.getElementById('quizModal').style.display = 'none';
    currentQuiz = null;
}

// 메시지 표시
function showMessage(text) {
    const existingMessage = document.querySelector('.message');
    if(existingMessage) existingMessage.remove();

    const message = document.createElement('div');
    message.className = 'message';
    message.textContent = text;
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 2000);
}

// 게임 재시작
function restartGame() {
    stopRoomTimer();
    stopBackgroundMusic();
    if (confettiInterval) clearInterval(confettiInterval);
    document.querySelectorAll('div[style*="confettiFall"]').forEach(c => c.remove());

    currentRoom = 1;
    completedQuizzes = [];
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

        showRoom(1);
        updateUI();
        updateTimerDisplay(); // 타이머 표시 초기화
    }, 500);
}


// 비디오 전환
function showTransitionWithVideo(videoKey, callback) {
    const transition = document.getElementById('screenTransition');
    const video = document.getElementById('transitionVideo');
    const videoSrc = transitionVideos[videoKey];

    if (!videoSrc) {
        // 비디오 없을 시 기본 전환
        setTimeout(() => {
            if (callback) callback();
        }, 500);
        return;
    }
    
    transition.classList.add('active');
    video.src = videoSrc;
    
    const onVideoEnd = () => {
        if(callback) callback();
        setTimeout(() => {
            transition.classList.remove('active');
            video.removeEventListener('ended', onVideoEnd);
        }, 300);
    };

    video.play().then(() => {
        video.addEventListener('ended', onVideoEnd, { once: true });
    }).catch(e => {
        console.error("Video play failed:", e);
        onVideoEnd(); // 비디오 재생 실패 시 콜백 바로 실행
    });
}

// 이벤트 리스너
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
});
document.getElementById('quizModal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
});

// 페이지 로드 시
window.addEventListener('load', () => {
    initializeSounds();
    const style = document.createElement('style');
    style.textContent = `
        @keyframes confettiFall { to { transform: translateY(100vh) rotate(360deg); opacity: 0; } }
        .selected { border-color: #ffd700 !important; box-shadow: 0 0 15px rgba(255,215,0,0.6) !important; }
        .matched { background: linear-gradient(135deg, #4caf50, #2e7d32) !important; border-color: #00ff00 !important; }
        .incorrect { animation: shake 0.5s; background: linear-gradient(135deg, #f44336, #c62828) !important; }
        .incorrect-shake { animation: shake 0.5s; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .message { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(255, 61, 61, 0.85); color: white; padding: 1rem 2rem; border-radius: 0.5rem; z-index: 10001; font-size: 1.5rem; animation: fadeOut 2s forwards; }
        @keyframes fadeOut { 0% { opacity: 1; } 80% { opacity: 1; } 100% { opacity: 0; } }
        .period-item, .law-item { padding: 15px; border-radius: 10px; font-weight: bold; text-align: center; cursor: pointer; border: 3px solid transparent; transition: all 0.2s ease-in-out; }
        .period-item { background: linear-gradient(135deg, #8e24aa, #5e35b1); color: white; }
        .law-item { background: linear-gradient(135deg, #4a90e2, #357abd); color: white; }
    `;
    document.head.appendChild(style);

    if (localStorage.getItem('gameCompleted')) {
        const endingScreen = document.getElementById('endingScreen');
        document.getElementById('startScreen').style.display = 'none';
        endingScreen.style.display = 'flex';
        endingScreen.classList.add('active');
        playBackgroundMusic();
    } else if (localStorage.getItem('currentRoom') && localStorage.getItem('completedQuizzes')) {
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('resumeScreen').style.display = 'flex';
    } else {
        document.getElementById('startScreen').style.display = 'flex';
    }
});
