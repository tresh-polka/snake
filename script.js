// --- Получение элементов DOM ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const bestScoreElement = document.getElementById('bestScore');
const gameStatusDiv = document.getElementById('gameStatus');
const gameOverModal = document.getElementById('gameOverModal');
const finalScoreMessage = document.getElementById('finalScoreMessage');
const restartButton = document.getElementById('restartButton');

// --- Игровые переменные ---
let snake = [
    {x: 150, y: 150},
    {x: 140, y: 150},
    {x: 130, y: 150},
    {x: 120, y: 150},
    {x: 110, y: 150}
];
let dx = 0;
let dy = 0;
let foodX = 0;
let foodY = 0;
let score = 0;
let changingDirection = false;
let gameStarted = false;
let gameActive = true;      // активна ли игра (не закончена)

// Настройки скорости
let delay = 150;
const MIN_DELAY = 50;
const SPEED_INCREASE_STEP = 5;
const SCORE_THRESHOLD = 30;

// Лучший счёт
let bestScore = localStorage.getItem('snakeBestScore') ? parseInt(localStorage.getItem('snakeBestScore')) : 0;
bestScoreElement.innerText = `🏆 Лучший: ${bestScore}`;

// --- Вспомогательные функции ---
function randomTen(min, max) {
    return Math.round((Math.random() * (max - min) + min) / 10) * 10;
}

function createFood() {
    foodX = randomTen(0, canvas.width - 10);
    foodY = randomTen(0, canvas.height - 10);
    for (let part of snake) {
        if (part.x === foodX && part.y === foodY) {
            createFood();
            return;
        }
    }
}

// --- Отрисовка ---
function clearCanvas() {
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

function drawSnakePart(part) {
    ctx.fillStyle = '#2e7d32';
    ctx.strokeStyle = '#1b5e20';
    ctx.fillRect(part.x, part.y, 10, 10);
    ctx.strokeRect(part.x, part.y, 10, 10);
}

function drawSnake() {
    snake.forEach(drawSnakePart);
}

function drawFood() {
    ctx.fillStyle = '#d32f2f';
    ctx.strokeStyle = '#b71c1c';
    ctx.fillRect(foodX, foodY, 10, 10);
    ctx.strokeRect(foodX, foodY, 10, 10);
}

// --- Движение змейки ---
function advanceSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);

    const didEat = (snake[0].x === foodX && snake[0].y === foodY);
    if (didEat) {
        score += 10;
        scoreElement.innerText = score;
        increaseSpeed();
        createFood();
    } else {
        snake.pop();
    }

    changingDirection = false;
}

function increaseSpeed() {
    const targetDelay = Math.max(MIN_DELAY, 150 - Math.floor(score / SCORE_THRESHOLD) * SPEED_INCREASE_STEP);
    if (targetDelay !== delay) {
        delay = targetDelay;
        console.log(`Скорость увеличена! Задержка: ${delay} мс`);
    }
}

// --- Проверка окончания игры ---
function didGameEnd() {
    // Столкновение с собой
    for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            return true;
        }
    }
    // Столкновение со стенами
    const hitLeft = snake[0].x < 0;
    const hitRight = snake[0].x > canvas.width - 10;
    const hitTop = snake[0].y < 0;
    const hitBottom = snake[0].y > canvas.height - 10;
    return hitLeft || hitRight || hitTop || hitBottom;
}

// --- Показать модальное окно окончания игры ---
function showGameOverModal() {
    // Обновляем лучший счёт
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('snakeBestScore', bestScore);
        bestScoreElement.innerText = `🏆 Лучший: ${bestScore}`;
    }
    finalScoreMessage.innerText = `Ваш счёт: ${score}  |  Лучший: ${bestScore}`;
    gameOverModal.style.display = 'flex';
    gameActive = false;
}

// Скрыть модальное окно (перезагрузка)
restartButton.addEventListener('click', () => {
    location.reload();
});

// --- Управление с клавиатуры ---
function changeDirection(event) {
    const LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40;
    const key = event.keyCode;
    
    if (!gameStarted && (key === LEFT || key === UP || key === RIGHT || key === DOWN)) {
        gameStarted = true;
        gameActive = true;
        gameStatusDiv.innerText = '🎮 Игра идёт...';
        if (key === LEFT) { dx = -10; dy = 0; }
        if (key === UP)   { dx = 0; dy = -10; }
        if (key === RIGHT) { dx = 10; dy = 0; }
        if (key === DOWN)  { dx = 0; dy = 10; }
        return;
    }
    
    if (!gameStarted || !gameActive) return;
    if (changingDirection) return;
    changingDirection = true;

    const goingUp = (dy === -10);
    const goingDown = (dy === 10);
    const goingLeft = (dx === -10);
    const goingRight = (dx === 10);

    if (key === LEFT && !goingRight) { dx = -10; dy = 0; }
    if (key === UP && !goingDown)    { dx = 0; dy = -10; }
    if (key === RIGHT && !goingLeft) { dx = 10; dy = 0; }
    if (key === DOWN && !goingUp)    { dx = 0; dy = 10; }
}

// --- Игровой цикл ---
function main() {
    if (!gameActive) return;  // игра окончена, ничего не делаем
    
    if (didGameEnd()) {
        showGameOverModal();
        return;
    }

    setTimeout(function onTick() {
        if (!gameActive) return;
        clearCanvas();
        drawFood();
        if (gameStarted) {
            advanceSnake();
        }
        drawSnake();
        main();
    }, delay);
}

// --- Запуск игры ---
createFood();
document.addEventListener("keydown", changeDirection);
main();