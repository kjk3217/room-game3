// ============================================
// 타이머 관리 (timer.js)
// ============================================

// 타이머 초기화
function initTimer() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
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
    
    timeLeft = 420;
    isTimerActive = true;
    updateTimerDisplay();
    initTimer();
    
    roomTimer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 120 && tickSound) {
            try {
                tickSound();
            } catch (error) {
                console.log('똑딱 소리 재생 실패:', error);
            }
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
    
    timerElement.classList.remove('warning', 'danger');
    
    if (timeLeft <= 60) {
        timerElement.classList.add('danger');
    } else if (timeLeft <= 120) {
        timerElement.classList.add('warning');
    }
}

// 타이머 경고 표시
function showTimerWarning() {
    const warningElement = document.getElementById('timerWarning');
    warningElement.style.display = 'block';
    
    setTimeout(() => {
        hideTimerWarning();
    }, 5000);
}

// 타이머 경고 숨김
function hideTimerWarning() {
    const warningElement = document.getElementById('timerWarning');
    warningElement.style.display = 'none';
}

// 게임오버
function gameOver() {
    stopRoomTimer();
    stopBackgroundMusic();
    
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('endingScreen').style.display = 'none';
    document.getElementById('startScreen').style.display = 'none';
    
    document.getElementById('gameOverScreen').style.display = 'flex';
    setTimeout(() => {
        document.getElementById('gameOverScreen').classList.add('active');
    }, 100);
    
    closeModal();
}