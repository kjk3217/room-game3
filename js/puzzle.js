// ============================================
// 퍼즐 게임 관리 (puzzle.js)
// ============================================

// 퍼즐 힌트 열기
function openPuzzleHint() {
    playClickSound();
    
    const requiredQuizzes = [9, 10, 11];
    const allCompleted = requiredQuizzes.every(id => completedQuizzes.includes(id));
    
    if (!allCompleted) {
        showMessage("이전 퀴즈를 먼저 풀어주세요!");
        return;
    }
    
    if (puzzleCompleted || localStorage.getItem('puzzleCompleted') === 'true') {
        puzzleCompleted = true;
        showCompletedPuzzle();
        return;
    }
    
    initializePuzzle();
    document.getElementById('puzzleModal').style.display = 'flex';
}

// 완성된 퍼즐 보여주기
function showCompletedPuzzle() {
    const puzzleSource = document.getElementById('puzzleSource');
    const puzzleTarget = document.getElementById('puzzleTarget');
    const puzzleGrid = puzzleTarget.parentElement;
    
    puzzleSource.innerHTML = '';
    puzzleTarget.innerHTML = '';
    
    puzzleTarget.classList.add('completed');
    puzzleTarget.style.cssText = `
        background: transparent !important;
        border: none !important;
        gap: 0 !important;
    `;
    
    if (puzzleGrid) {
        puzzleGrid.classList.add('completed');
        puzzleGrid.style.cssText = `
            background: transparent !important;
            padding: 0 !important;
            gap: 0 !important;
            box-shadow: 0 10px 30px rgba(255,215,0,0.3) !important;
        `;
    }
    
    const completedMessage = document.createElement('div');
    completedMessage.style.cssText = `
        color: #4caf50;
        font-size: 1.5rem;
        text-align: center;
        margin-bottom: 1rem;
        font-weight: bold;
    `;
    completedMessage.textContent = '✓ 완성된 퍼즐';
    puzzleSource.appendChild(completedMessage);
    
    for (let i = 0; i < 25; i++) {
        const slot = document.createElement('div');
        slot.className = 'puzzle-slot completed';
        slot.dataset.targetIndex = i;
        
        slot.style.cssText = `
            background: transparent !important;
            border: none !important;
            border-radius: 0 !important;
        `;
        
        const piece = createPuzzlePiece(i, i, false);
        piece.style.cssText += `
            border: none !important;
            box-shadow: none !important;
        `;
        piece.draggable = false;
        piece.style.cursor = 'default';
        
        slot.appendChild(piece);
        puzzleTarget.appendChild(slot);
    }
    
    document.getElementById('puzzleModal').style.display = 'flex';
}

// 퍼즐 초기화
function initializePuzzle() {
    const puzzleSource = document.getElementById('puzzleSource');
    const puzzleTarget = document.getElementById('puzzleTarget');
    puzzleSource.innerHTML = '';
    puzzleTarget.innerHTML = '';
    
    puzzlePieces = Array.from({length: 25}, (_, i) => i);
    
    for (let i = puzzlePieces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [puzzlePieces[i], puzzlePieces[j]] = [puzzlePieces[j], puzzlePieces[i]];
    }
    
    puzzlePieces.forEach((pieceIndex, position) => {
        const piece = createPuzzlePiece(pieceIndex, position, true);
        puzzleSource.appendChild(piece);
    });
    
    for (let i = 0; i < 25; i++) {
        const slot = document.createElement('div');
        slot.className = 'puzzle-slot';
        slot.dataset.targetIndex = i;
        
        slot.addEventListener('dragover', handlePuzzleDragOver);
        slot.addEventListener('drop', handlePuzzleDrop);
        slot.addEventListener('dragleave', handlePuzzleDragLeave);
        
        puzzleTarget.appendChild(slot);
    }
}

// 퍼즐 조각 생성
function createPuzzlePiece(pieceIndex, position, isSource) {
    const piece = document.createElement('div');
    piece.className = 'puzzle-piece';
    if (isSource) piece.classList.add('from-source');
    piece.dataset.pieceIndex = pieceIndex;
    piece.dataset.position = position;
    piece.draggable = true;
    
    const row = Math.floor(pieceIndex / 5);
    const col = pieceIndex % 5;
    
    piece.style.backgroundImage = 'url("images/puzzle.png")';
    piece.style.backgroundPosition = `${col * 25}% ${row * 25}%`;
    
    piece.addEventListener('dragstart', handlePuzzleDragStart);
    piece.addEventListener('dragend', handlePuzzleDragEnd);
    piece.addEventListener('touchstart', handlePuzzleTouchStart, { passive: false });
    piece.addEventListener('touchmove', handlePuzzleTouchMove, { passive: false });
    piece.addEventListener('touchend', handlePuzzleTouchEnd, { passive: false });
    
    return piece;
}

// 퍼즐 드래그 이벤트 핸들러
function handlePuzzleDragStart(e) {
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', e.target.dataset.pieceIndex);
}

function handlePuzzleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handlePuzzleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (e.currentTarget.classList.contains('puzzle-slot') && 
        !e.currentTarget.querySelector('.puzzle-piece')) {
        e.currentTarget.classList.add('drop-highlight');
    }
}

function handlePuzzleDragLeave(e) {
    e.currentTarget.classList.remove('drop-highlight');
}

// 퍼즐 드롭 이벤트 수정
function handlePuzzleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drop-highlight');
    
    const pieceIndex = e.dataTransfer.getData('text/plain');
    const draggedPiece = document.querySelector(`[data-piece-index="${pieceIndex}"]`);
    
    if (e.currentTarget.classList.contains('puzzle-slot') && draggedPiece) {
        const existingPiece = e.currentTarget.querySelector('.puzzle-piece');
        
        if (existingPiece) {
            // 이미 조각이 있는 경우 - 서로 위치 교환
            const draggedParent = draggedPiece.parentElement;
            
            // 임시로 조각들을 저장
            const tempContainer = document.createElement('div');
            tempContainer.appendChild(draggedPiece);
            
            // 기존 조각을 드래그한 조각이 있던 위치로 이동
            draggedParent.appendChild(existingPiece);
            draggedParent.classList.add('filled');
            
            // 드래그한 조각을 타겟 위치로 이동
            e.currentTarget.appendChild(tempContainer.firstChild);
            e.currentTarget.classList.add('filled');
            
            existingPiece.classList.remove('from-source');
            draggedPiece.classList.remove('from-source');
            
            playClickSound();
            checkPuzzleCompletion();
        } else {
            // 빈 칸인 경우 - 기존 로직
            e.currentTarget.appendChild(draggedPiece);
            e.currentTarget.classList.add('filled');
            draggedPiece.classList.remove('from-source');
            
            playClickSound();
            checkPuzzleCompletion();
        }
    }
}

// 퍼즐 터치 이벤트 핸들러
function handlePuzzleTouchStart(e) {
    e.preventDefault();
    puzzleTouchElement = e.target;
    puzzleInitialParent = e.target.parentElement;
    
    const touch = e.touches[0];
    const rect = e.target.getBoundingClientRect();
    
    puzzleTouchOffsetX = touch.clientX - rect.left;
    puzzleTouchOffsetY = touch.clientY - rect.top;
    
    puzzleTouchElement.classList.add('touch-dragging');
    puzzleTouchElement.style.left = `${rect.left}px`;
    puzzleTouchElement.style.top = `${rect.top}px`;
    puzzleTouchElement.style.width = `${rect.width}px`;
    puzzleTouchElement.style.height = `${rect.height}px`;
    
    document.body.style.overflow = 'hidden';
}

function handlePuzzleTouchMove(e) {
    e.preventDefault();
    if (!puzzleTouchElement) return;
    
    const touch = e.touches[0];
    const x = touch.clientX - puzzleTouchOffsetX;
    const y = touch.clientY - puzzleTouchOffsetY;
    
    puzzleTouchElement.style.left = `${x}px`;
    puzzleTouchElement.style.top = `${y}px`;
}

// 퍼즐 터치 종료 이벤트 수정
function handlePuzzleTouchEnd(e) {
    e.preventDefault();
    if (!puzzleTouchElement) return;
    
    const touch = e.changedTouches[0];
    
    puzzleTouchElement.style.display = 'none';
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    puzzleTouchElement.style.display = '';
    
    const targetSlot = elementBelow?.closest('.puzzle-slot');
    
    puzzleTouchElement.classList.remove('touch-dragging');
    puzzleTouchElement.style.left = '';
    puzzleTouchElement.style.top = '';
    puzzleTouchElement.style.width = '';
    puzzleTouchElement.style.height = '';
    document.body.style.overflow = '';
    
    if (targetSlot) {
        const existingPiece = targetSlot.querySelector('.puzzle-piece');
        
        if (existingPiece && existingPiece !== puzzleTouchElement) {
            // 이미 조각이 있는 경우 - 서로 위치 교환
            const draggedParent = puzzleInitialParent;
            
            // 임시로 조각들을 저장
            const tempContainer = document.createElement('div');
            tempContainer.appendChild(puzzleTouchElement);
            
            // 기존 조각을 드래그한 조각이 있던 위치로 이동
            if (draggedParent) {
                draggedParent.appendChild(existingPiece);
                draggedParent.classList.add('filled');
            }
            
            // 드래그한 조각을 타겟 위치로 이동
            targetSlot.appendChild(tempContainer.firstChild);
            targetSlot.classList.add('filled');
            
            existingPiece.classList.remove('from-source');
            puzzleTouchElement.classList.remove('from-source');
            
            playClickSound();
            checkPuzzleCompletion();
        } else if (!existingPiece) {
            // 빈 칸인 경우 - 기존 로직
            targetSlot.appendChild(puzzleTouchElement);
            targetSlot.classList.add('filled');
            puzzleTouchElement.classList.remove('from-source');
            
            playClickSound();
            checkPuzzleCompletion();
        } else {
            // 자기 자신에게 드롭한 경우
            if (puzzleInitialParent) {
                puzzleInitialParent.appendChild(puzzleTouchElement);
            }
        }
    } else {
        // 유효하지 않은 위치에 드롭한 경우 원래 위치로
        if (puzzleInitialParent) {
            puzzleInitialParent.appendChild(puzzleTouchElement);
        }
    }
    
    puzzleTouchElement = null;
    puzzleInitialParent = null;
}

// 퍼즐 완성 확인
function checkPuzzleCompletion() {
    const slots = document.querySelectorAll('#puzzleTarget .puzzle-slot');
    let correctCount = 0;
    let allFilled = true;
    
    slots.forEach((slot) => {
        const piece = slot.querySelector('.puzzle-piece');
        const targetIndex = parseInt(slot.dataset.targetIndex);
        
        slot.classList.remove('correct');
        
        if (piece) {
            const pieceIndex = parseInt(piece.dataset.pieceIndex);
            
            if (pieceIndex === targetIndex) {
                slot.classList.add('correct');
                correctCount++;
            }
        } else {
            allFilled = false;
        }
    });
    
    if (allFilled && correctCount === 25) {
        puzzleCompleted = true;
        localStorage.setItem('puzzleCompleted', 'true');
        
        const puzzleTarget = document.getElementById('puzzleTarget');
        const puzzleGrid = puzzleTarget.parentElement;
        
        puzzleTarget.classList.add('completed');
        puzzleTarget.style.cssText = `
            background: transparent !important;
            border: none !important;
            gap: 0 !important;
        `;
        
        if (puzzleGrid) {
            puzzleGrid.classList.add('completed');
            puzzleGrid.style.cssText = `
                background: transparent !important;
                padding: 0 !important;
                gap: 0 !important;
                box-shadow: 0 10px 30px rgba(255,215,0,0.3) !important;
            `;
        }
        
        slots.forEach(slot => {
            slot.classList.add('completed');
            slot.style.cssText = `
                background: transparent !important;
                border: none !important;
                border-radius: 0 !important;
            `;
            
            const piece = slot.querySelector('.puzzle-piece');
            if (piece) {
                piece.style.cssText += `
                    border: none !important;
                    box-shadow: none !important;
                `;
            }
        });
        
        puzzleTarget.style.animation = 'puzzleComplete 1s ease';
        
    }
}

// 퍼즐 힌트 메시지 표시
function showPuzzleHintMessage() {
    const hintMessage = document.createElement('div');
    hintMessage.className = 'puzzle-hint-message';
    hintMessage.innerHTML = `
        <div class="hint-message-content">
            <h3>🎉 퍼즐 완성! 🎉</h3>
            <p style="font-size: 1.6rem; line-height: 1.8; margin: 1.5rem 0;">
                마지막 문을 열기 위한 <span style="color: #ffd700; font-weight: bold;">암호의 힌트</span>를 발견했습니다!
            </p>
            <div style="background: rgba(0,0,0,0.5); padding: 1.5rem; border-radius: 10px; margin: 1rem 0;">
                <p style="font-size: 1.4rem; color: #87ceeb;">
                    "자세히 들려다 보자!"
                </p>
            </div>
            <button class="challenge-btn" onclick="closeHintMessage()" style="margin-top: 1rem; padding: 1rem 2rem; font-size: 1.4rem;">확인</button>
        </div>
    `;
    
    hintMessage.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        z-index: 5000;
        display: flex;
        justify-content: center;
        align-items: center;
        animation: fadeIn 0.5s ease;
    `;
    
    const content = hintMessage.querySelector('.hint-message-content');
    content.style.cssText = `
        background: linear-gradient(135deg, #1a237e, #4a148c);
        padding: 2.5rem;
        border-radius: 20px;
        text-align: center;
        color: white;
        max-width: 90%;
        box-shadow: 0 0 50px rgba(255,215,0,0.6);
    `;
    
    document.body.appendChild(hintMessage);
}

// 힌트 메시지 닫기
function closeHintMessage() {
    const hintMessage = document.querySelector('.puzzle-hint-message');
    if (hintMessage) {
        hintMessage.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            hintMessage.remove();
        }, 300);
    }
}

// 퍼즐 모달 닫기
function closePuzzleModal() {
    document.getElementById('puzzleModal').style.display = 'none';
    puzzleTouchElement = null;
    puzzleInitialParent = null;

}

