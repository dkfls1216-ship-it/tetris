document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    let squares = Array.from(document.querySelectorAll('.grid div'));
    const scoreDisplay = document.querySelector('#score');
    const startBtn = document.querySelector('#start-btn');
    const width = 10;
    let nextRandom = 0;
    let timerId;
    let score = 0;
    
    // 그리드 생성 (200개 셀 + 바닥 10개)
    for (let i = 0; i < 200; i++) {
        const div = document.createElement('div');
        grid.appendChild(div);
    }
    // 바닥 역할을 할 hidden div 10개 추가
    for (let i = 0; i < 10; i++) {
        const div = document.createElement('div');
        div.classList.add('taken');
        div.style.display = 'none'; // 화면엔 안 보임
        grid.appendChild(div);
    }
    squares = Array.from(document.querySelectorAll('.grid div'));

    // 테트리스 블록 모양 정의 (L, Z, T, O, I)
    const lTetromino = [ [1, width+1, width*2+1, 2], [width, width+1, width+2, width*2+2], [1, width+1, width*2+1, width*2], [width, width*2, width*2+1, width*2+2] ];
    const zTetromino = [ [0, width, width+1, width*2+1], [width+1, width+2, width*2, width*2+1], [0, width, width+1, width*2+1], [width+1, width+2, width*2, width*2+1] ];
    const tTetromino = [ [1, width, width+1, width+2], [1, width+1, width+2, width*2+1], [width, width+1, width+2, width*2+1], [1, width, width+1, width*2+1] ];
    const oTetromino = [ [0, 1, width, width+1], [0, 1, width, width+1], [0, 1, width, width+1], [0, 1, width, width+1] ];
    const iTetromino = [ [1, width+1, width*2+1, width*3+1], [width, width+1, width+2, width+3], [1, width+1, width*2+1, width*3+1], [width, width+1, width+2, width+3] ];

    const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino];

    let currentPosition = 4;
    let currentRotation = 0;
    
    // 랜덤으로 블록 선택
    let random = Math.floor(Math.random()*theTetrominoes.length);
    let current = theTetrominoes[random][currentRotation];

    // 블록 그리기
    function draw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.add('tetromino');
            // 색상 랜덤화 로직 추가 가능
            squares[currentPosition + index].style.backgroundColor = '';
        });
    }

    // 블록 지우기
    function undraw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.remove('tetromino');
        });
    }

    // 아래로 이동
    function moveDown() {
        undraw();
        currentPosition += width;
        draw();
        freeze();
    }

    // 바닥이나 다른 블록에 닿았을 때 멈춤
    function freeze() {
        if(current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
            current.forEach(index => squares[currentPosition + index].classList.add('taken'));
            // 새 블록 생성
            random = Math.floor(Math.random() * theTetrominoes.length);
            current = theTetrominoes[random][currentRotation];
            currentPosition = 4;
            draw();
            addScore();
            gameOver();
        }
    }

    // 좌측 이동
    function moveLeft() {
        undraw();
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);
        if(!isAtLeftEdge) currentPosition -= 1;
        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition += 1;
        }
        draw();
    }

    // 우측 이동
    function moveRight() {
        undraw();
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width -1);
        if(!isAtRightEdge) currentPosition += 1;
        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition -= 1;
        }
        draw();
    }

    // 회전 (벽 뚫기 방지 로직 포함)
    function rotate() {
        undraw();
        currentRotation++;
        if(currentRotation === current.length) { 
            currentRotation = 0;
        }
        current = theTetrominoes[random][currentRotation];
        checkRotatedPosition(); 
        draw();
    }

    // 회전 시 가장자리를 넘어가면 위치 보정
    function checkRotatedPosition(P){
        P = P || currentPosition;       
        if ((P+1) % width < 4) {             
            if (isAtRight()){            
                currentPosition += 1;    
                checkRotatedPosition(P); 
            }
        }
        else if (P % width > 5) {
            if (isAtLeft()){
                currentPosition -= 1;
                checkRotatedPosition(P);
            }
        }
    }
    
    function isAtRight() {
        return current.some(index=> (currentPosition + index + 1) % width === 0)  
    }
    
    function isAtLeft() {
        return current.some(index=> (currentPosition + index) % width === 0)
    }

    // 점수 계산 및 줄 제거
    function addScore() {
        for (let i = 0; i < 199; i +=width) {
            const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9];
            if(row.every(index => squares[index].classList.contains('taken'))) {
                score += 10;
                scoreDisplay.innerHTML = score;
                row.forEach(index => {
                    squares[index].classList.remove('taken');
                    squares[index].classList.remove('tetromino');
                    squares[index].style.backgroundColor = '';
                });
                const squaresRemoved = squares.splice(i, width);
                squares = squaresRemoved.concat(squares);
                squares.forEach(cell => grid.appendChild(cell));
            }
        }
    }

    // 게임 오버
    function gameOver() {
        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            scoreDisplay.innerHTML = '끝';
            clearInterval(timerId);
        }
    }

    // 버튼 이벤트 연결
    startBtn.addEventListener('click', () => {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
        } else {
            draw();
            timerId = setInterval(moveDown, 1000);
        }
    });

    // 키보드 컨트롤 (PC 테스트용)
    function control(e) {
        if(e.keyCode === 37) moveLeft();
        else if (e.keyCode === 38) rotate();
        else if (e.keyCode === 39) moveRight();
        else if (e.keyCode === 40) moveDown();
    }
    document.addEventListener('keyup', control);

    // 모바일 터치 컨트롤
    document.getElementById('left').addEventListener('click', moveLeft);
    document.getElementById('right').addEventListener('click', moveRight);
    document.getElementById('down').addEventListener('click', moveDown);
    document.getElementById('rotate').addEventListener('click', rotate);
});