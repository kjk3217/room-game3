// ============================================
// 퀴즈 관리 (quiz.js)
// ============================================

// 퀴즈 열기
function openQuiz(quizId) {
    playClickSound();

    const lastCompletedQuiz = completedQuizzes.length > 0 ? Math.max(...completedQuizzes) : 0;
    const isLocked = quizId > lastCompletedQuiz + 1;

    if (isLocked) {
        showMessage("이전 퀴즈를 먼저 풀어주세요!");
        return;
    }

    currentQuiz = quizId;
    const quiz = quizzes[quizId];
    const isCompleted = completedQuizzes.includes(quizId);
    
    const modalContent = document.querySelector('.modal-content');
    
    if (quiz.type === 'matching' || quiz.type === 'word_sort' || quiz.type === 'word_classification') {
        modalContent.style.maxWidth = '1300px';
        modalContent.style.width = '95%';
    } else if (quiz.type === 'four') {
        modalContent.style.maxWidth = '1000px';
        modalContent.style.width = '95%';
    } else if (quiz.type === 'single' || quiz.type === 'password') {
        modalContent.style.maxWidth = '1000px';
        modalContent.style.width = '95%';
    } else {
        modalContent.style.maxWidth = '1000px';
        modalContent.style.width = '95%';
    }
    
    document.getElementById('quizTitle').style.display = 'none';
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
    inputContainer.innerHTML = '';
    
    const answerContainer = document.createElement('div');
    answerContainer.className = 'completed-quiz-display';
    
    const answerTitle = document.createElement('h4');
    answerTitle.textContent = '✅ 정답:';
    answerTitle.style.color = '#00ff00';
    answerTitle.style.marginBottom = '15px';
    answerTitle.style.fontSize = '1.5rem';
    answerContainer.appendChild(answerTitle);
    
    if (quiz.type === 'matching') {
        const matchingAnswerContainer = document.createElement('div');
        matchingAnswerContainer.style.cssText = `
            display: grid;
            grid-template-columns: 1fr;
            gap: 8px;
            margin-bottom: 20px;
        `;
        
        Object.entries(quiz.correctMatches).forEach(([period, law]) => {
            const matchItem = document.createElement('div');
            matchItem.style.cssText = `
                background: rgba(0,255,0,0.1);
                border: 2px solid #00ff00;
                border-radius: 8px;
                padding: 12px;
                text-align: center;
                font-size: 1.2rem;
                color: #00ff00;
                font-weight: bold;
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;
            matchItem.innerHTML = `
                <span>${period}</span>
                <span style="color: #ffd700;">➜</span>
                <span>${law}</span>
            `;
            matchingAnswerContainer.appendChild(matchItem);
        });
        
        answerContainer.appendChild(matchingAnswerContainer);
    } else if (quiz.type === 'word_sort') {
        const correctSentence = quiz.correctOrder.join(' ');
        const answerBox = document.createElement('div');
        answerBox.className = 'completed-answer-box';
        answerBox.style.background = 'rgba(0,255,0,0.1)';
        answerBox.style.border = '2px solid #00ff00';
        answerBox.style.borderRadius = '8px';
        answerBox.style.padding = '15px';
        answerBox.style.textAlign = 'center';
        answerBox.style.fontSize = '1.5rem';
        answerBox.style.color = '#00ff00';
        answerBox.style.fontWeight = 'bold';
        answerBox.style.wordBreak = 'keep-all';
        answerBox.style.lineHeight = '1.4';
        answerBox.textContent = `"${correctSentence}"`;
        answerContainer.appendChild(answerBox);
    } else if (quiz.type === 'word_classification') {
        const classificationContainer = document.createElement('div');
        classificationContainer.style.cssText = `
            display: flex;
            justify-content: space-around;
            gap: 20px;
            margin-bottom: 20px;
        `;

        Object.entries(quiz.correctClassification).forEach(([category, words]) => {
            const categoryBox = document.createElement('div');
            categoryBox.style.cssText = `
                flex: 1;
                background: rgba(0,255,0,0.1);
                border: 2px solid #00ff00;
                border-radius: 8px;
                padding: 15px;
            `;

            const categoryTitle = document.createElement('h5');
            categoryTitle.textContent = category;
            categoryTitle.style.cssText = `
                color: #00ff00;
                font-size: 1.4rem;
                text-align: center;
                margin-bottom: 10px;
            `;
            categoryBox.appendChild(categoryTitle);

            words.forEach(word => {
                const wordItem = document.createElement('div');
                wordItem.textContent = word;
                wordItem.style.cssText = `
                    background: rgba(0,255,0,0.2);
                    padding: 8px;
                    text-align: center;
                    border-radius: 5px;
                    margin-top: 5px;
                    font-size: 1.2rem;
                    color: #fff;
                `;
                categoryBox.appendChild(wordItem);
            });
            classificationContainer.appendChild(categoryBox);
        });
        answerContainer.appendChild(classificationContainer);
    } else if (quiz.type === 'four') {
        const answersGrid = document.createElement('div');
        answersGrid.className = 'completed-answers-grid';
        answersGrid.style.display = 'grid';
        answersGrid.style.gridTemplateColumns = '1fr 1fr';
        answersGrid.style.gap = '10px';
        answersGrid.style.marginBottom = '20px';
        
        quiz.answers.forEach((answer, index) => {
            const answerBox = document.createElement('div');
            answerBox.className = 'completed-answer-box';
            answerBox.style.background = 'rgba(0,255,0,0.1)';
            answerBox.style.border = '2px solid #00ff00';
            answerBox.style.borderRadius = '8px';
            answerBox.style.padding = '10px';
            answerBox.style.textAlign = 'center';
            answerBox.style.fontSize = '1.3rem';
            answerBox.style.color = '#00ff00';
            answerBox.style.fontWeight = 'bold';
            answerBox.textContent = `${index + 1}. ${answer}`;
            answersGrid.appendChild(answerBox);
        });
        
        answerContainer.appendChild(answersGrid);
    } else {
        const answerBox = document.createElement('div');
        answerBox.className = 'completed-answer-box';
        answerBox.style.background = 'rgba(0,255,0,0.1)';
        answerBox.style.border = '2px solid #00ff00';
        answerBox.style.borderRadius = '8px';
        answerBox.style.padding = '15px';
        answerBox.style.textAlign = 'center';
        answerBox.style.fontSize = '1.8rem';
        answerBox.style.color = '#00ff00';
        answerBox.style.fontWeight = 'bold';
        answerBox.style.wordBreak = 'keep-all';
        answerBox.style.lineHeight = '1.4';
        answerBox.textContent = quiz.answers[0];
        answerContainer.appendChild(answerBox);
    }
    
    const completedMessage = document.createElement('p');
    completedMessage.textContent = '이미 완료된 퀴즈입니다. 참고용으로 정답을 확인할 수 있습니다.';
    completedMessage.style.color = '#ffd700';
    completedMessage.style.textAlign = 'center';
    completedMessage.style.fontStyle = 'italic';
    completedMessage.style.marginTop = '15px';
    completedMessage.style.fontSize = '1.1rem';
    answerContainer.appendChild(completedMessage);
    
    inputContainer.appendChild(answerContainer);
    
    const submitBtn = document.querySelector('.submit-btn');
    const closeBtn = document.querySelector('.close-btn');
    
    if (submitBtn) {
        submitBtn.style.display = 'none';
    }
    
    if (closeBtn) {
        closeBtn.textContent = '확인';
        closeBtn.style.background = 'linear-gradient(45deg, #4caf50, #2e7d32)';
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
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') checkAnswer();
        });
        inputContainer.appendChild(input);
        setTimeout(() => input.focus(), 100);
    } else if (type === 'four') {
        const container = document.createElement('div');
        container.className = 'four-inputs';
        for (let i = 1; i <= 4; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.id = `answer${i}`;
            input.placeholder = `${i}번 정답`;
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') checkAnswer();
            });
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
    } else if (type === 'textarea') {
        const textarea = document.createElement('textarea');
        textarea.id = 'quizAnswer';
        textarea.placeholder = '정답을 정확히 입력하세요...';
        textarea.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                checkAnswer();
            }
        });
        inputContainer.appendChild(textarea);
        setTimeout(() => textarea.focus(), 100);
    }
   
    const submitBtn = document.querySelector('.submit-btn');
    const closeBtn = document.querySelector('.close-btn');
   
    if (submitBtn) {
        submitBtn.style.display = 'inline-block';
    }
   
    if (closeBtn) {
        closeBtn.textContent = '닫기';
        closeBtn.style.background = 'linear-gradient(45deg, #f44336, #c62828)';
    }
}

// 정답 확인
function checkAnswer() {
    const quiz = quizzes[currentQuiz];
    let userAnswer = '';
   
    if (quiz.type === 'matching' || quiz.type === 'word_sort' || quiz.type === 'word_classification') {
        return;
    } else if (quiz.type === 'four') {
        const answers = [];
        for (let i = 1; i <= 4; i++) {
            const value = document.getElementById(`answer${i}`).value.trim();
            answers.push(value);
        }
       
        const correctAnswers = quiz.answers;
        let isCorrect = true;
       
        for (let i = 0; i < 4; i++) {
            if (normalizeAnswer(answers[i]) !== normalizeAnswer(correctAnswers[i])) {
                isCorrect = false;
                break;
            }
        }
       
        if (isCorrect) {
            correctAnswer();
        } else {
            wrongAnswer();
        }
        return;
    } else {
        userAnswer = document.getElementById('quizAnswer').value.trim();
    }
   
    const normalizedAnswer = normalizeAnswer(userAnswer);
    const isCorrect = quiz.answers.some(answer => 
        normalizeAnswer(answer) === normalizedAnswer
    );
   
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
    updateQuizObjectsState();
}

// 오답 처리
function wrongAnswer() {
    showMessage("다시 입력해 주세요");
   
    const quiz = quizzes[currentQuiz];
    if (quiz.type === 'matching') {
        return;
    } else if (quiz.type === 'four') {
        for (let i = 1; i <= 4; i++) {
            document.getElementById(`answer${i}`).value = '';
        }
        document.getElementById('answer1').focus();
    } else {
        document.getElementById('quizAnswer').value = '';
        document.getElementById('quizAnswer').focus();
    }
}

// 퀴즈 완료 표시
function markQuizCompleted(quizId) {
    const element = document.querySelector(`.clickable[onclick="openQuiz(${quizId})"]`);
    if (element) {
        element.classList.add('completed');
    }
}

// 완료 효과
function playCompletionEffect() {
    const elements = document.querySelectorAll('.clickable.completed');
    const lastElement = elements[elements.length - 1];
    if (lastElement) {
        lastElement.style.animation = 'none';
        setTimeout(() => {
            lastElement.style.animation = 'glow 1s ease-in-out';
        }, 10);
    }
}

// 모달 닫기
function closeModal() {
    document.getElementById('quizModal').style.display = 'none';
    currentQuiz = null;
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
        modal.style.opacity = '';
        modal.style.transform = '';
       
        setTimeout(() => {
            startEndingSequence();
        }, 300);
    }, 500);
}

// 힌트 열기
function openHint() {
    playClickSound();
    
    const requiredQuizzes = [5, 6, 7];
    const allCompleted = requiredQuizzes.every(id => completedQuizzes.includes(id));
    
    if (!allCompleted) {
        showMessage("이전 퀴즈를 먼저 풀어주세요!");
        return;
    }
    
    document.getElementById('hintContent').textContent = "ㅈㅇ+ㅁㅇ";
    document.getElementById('hintModal').style.display = 'flex';
}

// 힌트 모달 닫기
function closeHintModal() {
    document.getElementById('hintModal').style.display = 'none';
}

// ============================================
// 게임 타입별 특수 기능
// ============================================

// 단어 분류 게임 생성
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
    instructionText.style.cssText = `
        text-align: center;
        color: #ffd700;
        font-size: 1.4rem;
        width: 100%;
        margin-bottom: 14px;
    `;
    unclassifiedContainer.appendChild(instructionText);

    const shuffledWords = [...quiz.words].sort(() => Math.random() - 0.5);
    shuffledWords.forEach((word, index) => {
        const wordElement = createWordElement(word, index);
        unclassifiedContainer.appendChild(wordElement);
    });

    const dropZonesContainer = document.createElement('div');
    dropZonesContainer.className = 'drop-zones-container';

    quiz.categories.forEach(category => {
        const dropZone = document.createElement('div');
        dropZone.className = 'category-drop-zone';
        dropZone.dataset.category = category;

        const title = document.createElement('h3');
        title.textContent = category;
        dropZone.appendChild(title);
        
        dropZonesContainer.appendChild(dropZone);
    });

    gameContainer.appendChild(unclassifiedContainer);
    gameContainer.appendChild(dropZonesContainer);
    inputContainer.appendChild(gameContainer);

    setupDropZones(unclassifiedContainer, ...dropZonesContainer.querySelectorAll('.category-drop-zone'));
}

// 단어 분류 완료 확인
function checkWordClassificationCompletion() {
    const quiz = quizzes[currentQuiz];
    const unclassifiedContainer = document.querySelector('.unclassified-words-container');

    if (unclassifiedContainer.querySelectorAll('.word-element').length > 0) {
        return;
    }

    let allCorrect = true;
    document.querySelectorAll('.category-drop-zone').forEach(zone => {
        const category = zone.dataset.category;
        const correctWordsForCategory = quiz.correctClassification[category];
        const wordsInZone = Array.from(zone.querySelectorAll('.word-element')).map(el => el.dataset.word);

        if (wordsInZone.length !== correctWordsForCategory.length) {
            allCorrect = false;
        } else {
            for (const word of wordsInZone) {
                if (!correctWordsForCategory.includes(word)) {
                    allCorrect = false;
                    break;
                }
            }
        }
    });

    if (allCorrect) {
        const wordElements = document.querySelectorAll('.category-drop-zone .word-element');
        wordElements.forEach((el, index) => {
            setTimeout(() => {
                el.style.background = 'linear-gradient(135deg, #4caf50, #2e7d32)';
                el.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    el.style.transform = 'scale(1)';
                }, 200);
            }, index * 100);
        });
        
        setTimeout(() => {
            correctAnswer();
        }, wordElements.length * 100 + 500);
    }
}

// 매칭 게임 생성
function createMatchingGame() {
    const inputContainer = document.getElementById('quizInput');
    inputContainer.innerHTML = '';
    
    const quiz = quizzes[currentQuiz];
    
    const gameContainer = document.createElement('div');
    gameContainer.className = 'matching-game-container';
    gameContainer.style.cssText = `
        display: grid;
        grid-template-columns: 1fr 50px 1fr;
        gap: 20px;
        max-width: 1200px;
        margin: 0 auto;
        align-items: start;
    `;
    
    const periodsContainer = document.createElement('div');
    periodsContainer.className = 'periods-container';
    periodsContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 15px;
    `;
    
    const arrowContainer = document.createElement('div');
    arrowContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
        padding-top: 20px;
    `;
    
    const lawsContainer = document.createElement('div');
    lawsContainer.className = 'laws-container';
    lawsContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 15px;
    `;
    
    const shuffledLaws = [...quiz.laws].sort(() => Math.random() - 0.5);
    
    quiz.periods.forEach((period, index) => {
        const periodItem = document.createElement('div');
        periodItem.className = 'period-item';
        periodItem.dataset.period = period;
        periodItem.textContent = period;
        
        periodItem.style.cssText = `
            background: linear-gradient(135deg, #8e24aa, #5e35b1);
            color: white;
            padding: 15px;
            border-radius: 10px;
            font-weight: bold;
            text-align: center;
            cursor: pointer;
            border: 3px solid transparent;
            transition: all 0.3s ease;
            font-size: 1.2rem;
        `;
        
        periodItem.addEventListener('click', () => selectPeriod(periodItem));
        periodsContainer.appendChild(periodItem);
    });
    
    shuffledLaws.forEach((law, index) => {
        const lawItem = document.createElement('div');
        lawItem.className = 'law-item';
        lawItem.dataset.law = law;
        lawItem.textContent = law;
        
        lawItem.style.cssText = `
            background: linear-gradient(135deg, #4a90e2, #357abd);
            color: white;
            padding: 15px;
            border-radius: 10px;
            font-weight: bold;
            text-align: center;
            cursor: pointer;
            border: 3px solid transparent;
            transition: all 0.3s ease;
            font-size: 1.2rem;
        `;
        
        lawItem.addEventListener('click', () => selectLaw(lawItem));
        lawsContainer.appendChild(lawItem);
    });
    
    gameContainer.appendChild(periodsContainer);
    gameContainer.appendChild(arrowContainer);
    gameContainer.appendChild(lawsContainer);
    
    inputContainer.appendChild(gameContainer);
    
    window.selectedPeriod = null;
    window.currentMatches = {};
    window.correctMatches = quiz.correctMatches;
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
        showMessage("먼저 품사를 선택해주세요!");
        return;
    }
   
    const selectedLaw = lawElement.dataset.law;
   
    window.currentMatches[window.selectedPeriod] = selectedLaw;
   
    const isCorrect = window.correctMatches[window.selectedPeriod] === selectedLaw;
   
    if (isCorrect) {
        lawElement.style.background = 'linear-gradient(135deg, #4caf50, #2e7d32)';
        lawElement.style.borderColor = '#00ff00';
        lawElement.style.pointerEvents = 'none';
       
        const periodElement = document.querySelector(`[data-period="${window.selectedPeriod}"]`);
        periodElement.style.background = 'linear-gradient(135deg, #4caf50, #2e7d32)';
        periodElement.style.borderColor = '#00ff00';
        periodElement.style.pointerEvents = 'none';
       
        createConnectionLine(periodElement, lawElement);
    } else {
        lawElement.style.background = 'linear-gradient(135deg, #f44336, #c62828)';
        setTimeout(() => {
            lawElement.style.background = 'linear-gradient(135deg, #4a90e2, #357abd)';
        }, 1000);
       
        delete window.currentMatches[window.selectedPeriod];
    }
   
    document.querySelectorAll('.period-item').forEach(item => {
        if (!item.style.pointerEvents || item.style.pointerEvents === 'auto') {
            item.style.borderColor = 'transparent';
            item.style.boxShadow = 'none';
        }
    });
    window.selectedPeriod = null;
   
    const totalMatchesNeeded = Object.keys(window.correctMatches).length;
    if (Object.keys(window.currentMatches).length === totalMatchesNeeded) {
        setTimeout(() => {
            checkMatchingComplete();
        }, 500);
    }
}

// 연결선 생성
function createConnectionLine(periodElement, lawElement) {
    const checkMark = document.createElement('div');
    checkMark.textContent = '✓';
    checkMark.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #00ff00;
        font-size: 2rem;
        font-weight: bold;
        z-index: 100;
        animation: checkmarkPop 0.5s ease-out;
        pointer-events: none;
    `;
   
    periodElement.style.position = 'relative';
    periodElement.appendChild(checkMark);
   
    if (!document.querySelector('#checkmarkAnimation')) {
        const style = document.createElement('style');
        style.id = 'checkmarkAnimation';
        style.textContent = `
            @keyframes checkmarkPop {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
}

// 매칭 완료 확인
function checkMatchingComplete() {
    let allCorrect = true;
   
    for (const [period, law] of Object.entries(window.currentMatches)) {
        if (window.correctMatches[period] !== law) {
            allCorrect = false;
            break;
        }
    }
   
    if (allCorrect && Object.keys(window.currentMatches).length === Object.keys(window.correctMatches).length) {
        correctAnswer();
    }
}

// 단어 정렬 게임 생성
function createWordSortGame() {
    const inputContainer = document.getElementById('quizInput');
    inputContainer.innerHTML = '';
    
    const quiz = quizzes[currentQuiz];
    
    const gameContainer = document.createElement('div');
    gameContainer.className = 'word-sort-game-container';
    gameContainer.style.cssText = `
        max-width: 900px;
        margin: 0 auto;
    `;
    
    const instructionText = document.createElement('p');
    instructionText.textContent = '단어를 드래그하여 올바른 순서로 배열하세요.';
    instructionText.style.cssText = `
        text-align: center;
        color: #ffd700;
        font-size: 1.2rem;
        margin-bottom: 30px;
        font-style: italic;
    `;
    
    const shuffledContainer = document.createElement('div');
    shuffledContainer.className = 'shuffled-words-container';
    shuffledContainer.style.cssText = `
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        padding: 20px;
        background: rgba(0,0,0,0.3);
        border-radius: 15px;
        margin-bottom: 30px;
        border: 2px solid #6a1b9a;
        min-height: 100px;
        justify-content: center;
        align-items: flex-start;
        width: 100%;
    `;
    
    const answerContainer = document.createElement('div');
    answerContainer.className = 'answer-words-container';
    answerContainer.style.cssText = `
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        padding: 30px;
        background: rgba(0,100,0,0.2);
        border-radius: 15px;
        border: 2px dashed #4caf50;
        min-height: 120px;
        align-items: flex-start;
        justify-content: center;
        width: 100%;
    `;
   
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
   
    window.currentWordOrder = [];
    window.correctWordOrder = quiz.correctOrder;
}

// 단어 정렬 완료 확인
function checkWordSortCompletion() {
    const answerContainer = document.querySelector('.answer-words-container');
    const wordsInAnswer = Array.from(answerContainer.querySelectorAll('.word-element'))
        .map(el => el.dataset.word);
   
    if (wordsInAnswer.length === window.correctWordOrder.length) {
        const isCorrectOrder = wordsInAnswer.every((word, index) => 
            word === window.correctWordOrder[index]
        );
       
        if (isCorrectOrder) {
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
           
            setTimeout(() => {
                correctAnswer();
            }, wordsInAnswer.length * 100 + 500);
        }
    }
}

// 단어 요소 생성
function createWordElement(word, index) {
    const wordElement = document.createElement('div');
    wordElement.className = 'word-element';
    wordElement.dataset.word = word;
    wordElement.dataset.index = index;
    wordElement.textContent = word;
    wordElement.draggable = true;
   
    wordElement.style.cssText = `
        background: linear-gradient(135deg, #4a90e2, #357abd);
        color: white;
        padding: 10px 20px;
        border-radius: 8px;
        cursor: grab;
        user-select: none;
        font-weight: bold;
        font-size: 1.5rem;
        border: 2px solid transparent;
        transition: all 0.3s ease;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
   
    wordElement.addEventListener('dragstart', handleDragStart);
    wordElement.addEventListener('dragend', handleDragEnd);
    
    wordElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    wordElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    wordElement.addEventListener('touchend', handleTouchEnd, { passive: false });
   
    return wordElement;
}

// 드롭 영역 설정
function setupDropZones(...containers) {
    containers.forEach(container => {
        if (container) {
            container.addEventListener('dragover', handleDragOver);
            container.addEventListener('drop', handleDrop);
        }
    });
}

// 드래그 이벤트 핸들러
function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.index);
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    if (e.currentTarget.classList.contains('answer-words-container') || e.currentTarget.classList.contains('category-drop-zone')) {
        e.currentTarget.style.background = 'rgba(0,150,0,0.3)';
    } else {
        e.currentTarget.style.background = 'rgba(0,0,0,0.4)';
    }
}

function handleDrop(e) {
    e.preventDefault();
    const draggedIndex = e.dataTransfer.getData('text/plain');
    const draggedElement = document.querySelector(`.word-element[data-index='${draggedIndex}']`);
    
    if (draggedElement && e.currentTarget !== draggedElement.parentNode) {
        if (draggedElement.tagName.toLowerCase() !== 'p') {
            e.currentTarget.appendChild(draggedElement);
        }
        
        const quizType = quizzes[currentQuiz].type;
        if (quizType === 'word_sort') {
            checkWordSortCompletion();
        } else if (quizType === 'word_classification') {
            checkWordClassificationCompletion();
        }
    }
    
    resetDropZoneBackground(e.currentTarget);
}

function resetDropZoneBackground(container) {
    if (container.classList.contains('answer-words-container') || container.classList.contains('category-drop-zone')) {
        container.style.background = 'rgba(0,100,0,0.2)';
    } else if (container.classList.contains('unclassified-words-container')) {
        container.style.background = 'rgba(0,0,0,0.3)';
    } else {
        container.style.background = 'rgba(0,0,0,0.3)';
    }
}

// 터치 이벤트 핸들러
let draggedTouchElement = null;
let touchOffsetX = 0;
let touchOffsetY = 0;

function handleTouchStart(e) {
    e.preventDefault();
    draggedTouchElement = e.target;
    const touch = e.touches[0];
    const rect = e.target.getBoundingClientRect();

    touchOffsetX = touch.clientX - rect.left;
    touchOffsetY = touch.clientY - rect.top;

    draggedTouchElement.classList.add('touch-dragging');
    draggedTouchElement.style.left = `${rect.left}px`;
    draggedTouchElement.style.top = `${rect.top}px`;

    document.body.style.overflow = 'hidden';
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!draggedTouchElement) return;
    
    const touch = e.touches[0];
    const x = touch.clientX - touchOffsetX;
    const y = touch.clientY - touchOffsetY;
    draggedTouchElement.style.left = `${x}px`;
    draggedTouchElement.style.top = `${y}px`;
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

    if (dropContainer && dropContainer !== draggedTouchElement.parentNode) {
        if (draggedTouchElement.tagName.toLowerCase() !== 'p') {
            dropContainer.appendChild(draggedTouchElement);
        }
        
        const quizType = quizzes[currentQuiz].type;
        if (quizType === 'word_sort') {
            checkWordSortCompletion();
        } else if (quizType === 'word_classification') {
            checkWordClassificationCompletion();
        }
    }

    draggedTouchElement = null;

}


