const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// 1. ТВОЯ ФУНКЦИЯ РИСОВАНИЯ (Шаг 3)
function drawAnt(x, y) {
    ctx.fillStyle = '#ffffff'; 
    ctx.beginPath();           
    ctx.arc(x, y, 5, 0, Math.PI * 2); 
    ctx.fill();                
}

// 2. ИГРОВОЙ ЦИКЛ РУСЛАНА (Шаг 2)
function animationLoop() {
    // Ластик Руслана стирает холст
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Твой вызов рисует точку прямо внутри этого цикла
    drawAnt(canvas.width / 2, canvas.height / 2);

    // Запрос на следующий кадр
    requestAnimationFrame(animationLoop);
}

// Запуск движка
animationLoop();