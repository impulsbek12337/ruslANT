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

// Функция рисования муравья (Шаг 3)
function drawAnt(x, y) {
    ctx.fillStyle = '#ffffff'; 
    ctx.beginPath();           
    ctx.arc(x, y, 5, 0, Math.PI * 2); 
    ctx.fill();                
}

// ==========================================
// === ТВОЙ НОВЫЙ КОД: ШАГ 5 (ЭРКИН) ===
// ==========================================

// 1. Функция рисования Муравейника (Синий круг)
function drawHome(x, y, radius) {
    ctx.fillStyle = '#1e3a8a'; // Красивый темно-синий цвет
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Делаем аккуратную обводку, чтобы выглядело сочнее
    ctx.strokeStyle = '#3b82f6'; 
    ctx.lineWidth = 3;
    ctx.stroke();
}

// 2. Функция рисования Еды (Зеленый круг)
function drawFood(x, y, radius) {
    ctx.fillStyle = '#065f46'; // Темно-зеленый цвет
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Обводка для еды
    ctx.strokeStyle = '#10b981'; 
    ctx.lineWidth = 3;
    ctx.stroke();
}


// ИГРОВОЙ ЦИКЛ (Шаг 2 + Шаг 4 + Твой Шаг 5)
function animationLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // === ТВОЙ НОВЫЙ КОД: Рисуем зоны на холсте ===
    // Муравейник рисуем в левом верхнем углу (отступив по 100 пикселей, радиус 40)
    drawHome(100, 100, 40);
    
    // Еду рисуем в правом нижнем углу холста (радиус 40)
    drawFood(canvas.width - 100, canvas.height - 100, 40);


    // Изменение координат для движения (Логика Руслана)
    antX += speedX; 
    antY += speedY; 

    // Отрисовка муравья на новых координатах
    drawAnt(antX, antY);

    requestAnimationFrame(animationLoop);
}

// Запуск
animationLoop();