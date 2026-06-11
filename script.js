const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Переменные для позиции и скорости муравья
let antX = canvas.width / 2;
let antY = canvas.height / 2;
let speedX = 2; 
let speedY = 1; 

// 1. ФУНКЦИЯ РИСОВАНИЯ (Шаг 3)
function drawAnt(x, y) {
    ctx.fillStyle = '#ffffff'; 
    ctx.beginPath();           
    ctx.arc(x, y, 5, 0, Math.PI * 2); 
    ctx.fill();                
}

// 2. ИГРОВОЙ ЦИКЛ (Шаг 2 + Шаг 4)
function animationLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Изменение координат для движения
    antX += speedX; 
    antY += speedY; 

    // Отрисовка муравья на новых координатах
    drawAnt(antX, antY);

    requestAnimationFrame(animationLoop);
}

// Запуск
animationLoop();