// ============================================
// 메인 게임 로직 (main.js)
// ============================================

// 게임 시작
function startGame() {
    requestFullScreen();
    console.log('게임 시작 버튼 클릭됨');
    
    showTransitionWithVideo('start', () => {
        document.getElementById('startScreen').classList.add('fade-out');
        setTimeout(() => {
            document.getElementById('startScreen').style.display = 'none';
            document.getElementById('gameScreen').style.display = 'block';
            setTimeout(() => {
                document.getElementById('gameScreen').classList.add('active');
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
        document.getElementById('gameScreen').style.display = 'block';
        setTimeout(() => {
            document.getElementById('gameScreen').classList.add('active');
            loadGameState();
            updateUI();
            startRoomTimer();
        }, 50);
    }, 500);
}

// 게임 상태 로드
function loadGameState() {
    const savedRoom = localStorage.getItem('currentRoom');
    if (savedRoom) {
        currentRoom = parseInt(savedRoom);
        showRoom(currentRoom, false);
    } else {
        showRoom(1);
    }
    
    completedQuizzes.forEach(quizId => {
        markQuizCompleted(quizId);
    });
    
    checkRoomCompletion();
    updateQuizObjectsState();
}

// 게임 재시작
function restartGame() {
    stopRoomTimer();
    stopBackgroundMusic();
   
    currentRoom = 1;
    completedQuizzes = [];
    currentQuiz = null;
    timeLeft = 600;
    isTimerActive = false;
   
    localStorage.removeItem('completedQuizzes');
    localStorage.removeItem('currentRoom');
    localStorage.removeItem('gameCompleted');
    localStorage.removeItem('puzzleCompleted');
    localStorage.removeItem('timeLeft');
    localStorage.removeItem('lastSavedRoom');
    puzzleCompleted = false;
    
    document.querySelectorAll('.clickable').forEach(element => {
        element.classList.remove('completed', 'locked', 'next-quiz');
        element.style.animation = '';
    });
   
    document.getElementById('endingScreen').classList.remove('active');
    document.getElementById('gameScreen').classList.remove('active');
    document.getElementById('gameOverScreen').classList.remove('active');
    document.getElementById('gameOverScreen').style.display = 'none';
   
    document.getElementById('endingScreen').style.transition = 'opacity 1s ease-out';
    document.getElementById('endingScreen').style.opacity = '0';
   
    setTimeout(() => {
        document.getElementById('endingScreen').style.display = 'none';
        document.getElementById('endingScreen').style.transition = '';
        document.getElementById('endingScreen').style.opacity = '';
        document.getElementById('endingScreen').style.transform = '';
       
        document.getElementById('startScreen').style.display = 'flex';
        document.getElementById('startScreen').classList.remove('fade-out');
        document.getElementById('nextRoomBtn').style.display = 'none';
       
        hideTimerWarning();
        showRoom(1, false);
        updateUI();
    }, 1000);
}

// 페이지 로드 시 초기화
window.addEventListener('load', function() {
    initializeSounds();
 
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
    
    // 갤럭시탭 최적화: 화면 회전 방지
    if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(() => {
            console.log('화면 회전 잠금 지원 안됨');
        });
    }
});

// 키보드 이벤트 처리
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// 모달 외부 클릭 시 닫기
document.getElementById('quizModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }

});


