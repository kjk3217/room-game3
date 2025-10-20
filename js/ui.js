// ============================================
// UI 관리 (ui.js)
// ============================================

// UI 업데이트
function updateUI() {
    const totalCompleted = completedQuizzes.length;
    const roomNames = {
        1: "ROOM 1",
        2: "ROOM 2", 
        3: "ROOM 3"
    };
   
    document.getElementById('progress').textContent = `${totalCompleted}/12 완료`;
    document.getElementById('roomInfo').textContent = roomNames[currentRoom] || `방 ${currentRoom}`;
    updateQuizObjectsState();
}

// 퀴즈 오브젝트 상태 업데이트
function updateQuizObjectsState() {
    const lastCompletedQuiz = completedQuizzes.length > 0 ? Math.max(...completedQuizzes) : 0;
    const nextQuizId = lastCompletedQuiz + 1;

    document.querySelectorAll('.clickable').forEach(element => {
        if (element.classList.contains('book')) {
            const requiredQuizzes = [5, 6, 7];
            const allCompleted = requiredQuizzes.every(id => completedQuizzes.includes(id));
            
            element.classList.remove('locked', 'next-quiz');
            
            if (!allCompleted) {
                element.classList.add('locked');
            } else if (!completedQuizzes.includes(8)) {
                element.classList.add('next-quiz');
            }
            return;
        }
        
        const onclickAttr = element.getAttribute('onclick');
        if (!onclickAttr || !onclickAttr.includes('openQuiz')) return;
        
        const quizId = parseInt(onclickAttr.match(/\d+/)[0]);

        element.classList.remove('locked', 'next-quiz');

        if (quizId > nextQuizId) {
            element.classList.add('locked');
        } else if (quizId === nextQuizId) {
            if (nextQuizId <= 12) {
                element.classList.add('next-quiz');
            }
        }
    });
}

// 메시지 표시
function showMessage(text) {
    const message = document.createElement('div');
    message.className = 'message';
    message.textContent = text;
    document.body.appendChild(message);
   
    setTimeout(() => {
        if (message.parentNode) {
            message.parentNode.removeChild(message);
        }
    }, 1500);
}


// 전체 화면 실행 함수
function requestFullScreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(console.error);
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    }
}

// 비디오 포함 전환 효과
function showTransitionWithVideo(videoKey, callback) {
    const transition = document.getElementById('screenTransition');
    const video = document.getElementById('transitionVideo');
    video.muted = false;
    transition.classList.add('active');
   
    const videoSrc = transitionVideos[videoKey];
    let videoLoaded = false;
    let callbackExecuted = false;
   
    if (videoSrc) {
        video.removeEventListener('loadeddata', handleVideoLoad);
        video.removeEventListener('ended', handleVideoEnd);
        video.removeEventListener('error', handleVideoError);
       
        video.src = videoSrc;
       
        function handleVideoLoad() {
            videoLoaded = true;
            video.play().catch(e => {
                console.log('비디오 자동재생 실패, 기본 전환으로 진행:', e);
                executeCallback();
            });
        }
       
        function handleVideoEnd() {
            executeCallback();
        }
       
        function handleVideoError() {
            console.log('비디오 로드 실패, 기본 전환으로 진행');
            executeCallback();
        }
       
        function executeCallback() {
            if (callbackExecuted) return;
            callbackExecuted = true;
           
            if (callback) callback();
           
            setTimeout(() => {
                transition.classList.remove('active');
                video.src = '';
                video.removeEventListener('loadeddata', handleVideoLoad);
                video.removeEventListener('ended', handleVideoEnd);
                video.removeEventListener('error', handleVideoError);
            }, 300);
        }
       
        video.addEventListener('loadeddata', handleVideoLoad, { once: true });
        video.addEventListener('ended', handleVideoEnd, { once: true });
        video.addEventListener('error', handleVideoError, { once: true });
       
        video.load();
       
        setTimeout(() => {
            if (!videoLoaded && !callbackExecuted) {
                console.log('비디오 로드 시간 초과, 기본 전환으로 진행');
                executeCallback();
            }
        }, 3000);
       
    } else {
        console.log('비디오 파일 없음, 기본 전환 효과 사용');
        setTimeout(() => {
            if (callback) callback();
            setTimeout(() => {
                transition.classList.remove('active');
            }, 500);
        }, 1500);
    }
   
    setTimeout(() => {
        if (!callbackExecuted) {
            console.log('최대 대기 시간 초과, 강제 진행');
            if (callback) callback();
            setTimeout(() => {
                transition.classList.remove('active');
                video.src = '';
            }, 500);
        }
    }, 7000);

}
