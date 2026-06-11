const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// --- НАСТРОЙКИ СИМУЛЯЦИИ ---
const ANT_RADIUS = 5;
let homeX = 100;
let homeY = 100;

// --- КООРДИНАТЫ И СКОРОСТЬ МУРАВЬЯ ---
// Спавним его в центре экрана
let antX = canvas.width / 2;
let antY = canvas.height / 2;

// Скорость движения: 4 пикселя за кадр в случайном направлении
let speedX = (Math.random() - 0.5) * 8; 
let speedY = (Math.random() - 0.5) * 8; 


// --- ФУНКЦИИ ОТРИСОВКИ ---

// Функция рисования муравья (Шаг 3 Эркина)
function drawAnt(x, y) {
    ctx.fillStyle = '#ffffff'; 
    ctx.beginPath();           
    ctx.arc(x, y, ANT_RADIUS, 0, Math.PI * 2); 
    ctx.fill();                
}

// Функция рисования Муравейника (Синий круг) - Шаг 5 Эркина
function drawHome(x, y, radius) {
    ctx.fillStyle = '#1e3a8a'; 
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3b82f6'; 
    ctx.lineWidth = 3;
    ctx.stroke();
}

// Функция рисования Еды (Зеленый круг) - Шаг 5 Эркина
function drawFood(x, y, radius) {
    ctx.fillStyle = '#065f46'; 
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#10b981'; 
    ctx.lineWidth = 3;
    ctx.stroke();
}


// --- ИГРОВОЙ ЦИКЛ ---
function animationLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Логика зон: они просто рисуются
    let foodX = canvas.width - 100;
    let foodY = canvas.height - 100;
    drawHome(homeX, homeY, 40);
    drawFood(foodX, foodY, 40);


    // === ОБНОВЛЕНИЕ ЛОГИКИ МУРАВЬЯ (Шаг 6: Отскоки) ===
    
    // 1. Двигаем муравья
    antX += speedX;
    antY += speedY;

    // 2. Проверяем столкновение с правой или левой границей
    if (antX + ANT_RADIUS > canvas.width || antX - ANT_RADIUS < 0) {
        speedX = -speedX; // Меняем направление по оси X на противоположное
    }

    // 3. Проверяем столкновение с верхней или нижней границей
    if (antY + ANT_RADIUS > canvas.height || antY - ANT_RADIUS < 0) {
        speedY = -speedY; // Меняем направление по оси Y на противоположное
    }


    // Отрисовка муравья на новых координатах
    drawAnt(antX, antY);

    requestAnimationFrame(animationLoop);
}

// Запуск
animationLoop();