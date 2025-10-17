// ============================================
// 사운드 관리 (sound.js)
// ============================================

// 사운드 초기화
function initializeSounds() {
    try {
        backgroundMusic = new Audio('sounds/ending_music.mp3');
        backgroundMusic.loop = true;
        backgroundMusic.volume = 0.6;
        
        clickSound = new Audio('sounds/click_sound.mp3');
        clickSound.volume = 0.8;
        
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
            clickSound.currentTime = 0;
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