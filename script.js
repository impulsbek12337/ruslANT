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
const ANTS_COUNT = 67; // ТВОЁ ОБНОВЛЕНИЕ: Количество муравьев
let homeX = 100;
let homeY = 100;

// ===================================================
// === ТВОЙ НОВЫЙ КОД: ШАГ 7 — МАССИВ МУРАВЬЕВ ===
// ===================================================

let ants = [];

// Циклом создаем 100 индивидуальных муравьев
for (let i = 0; i < ANTS_COUNT; i++) {
    ants.push({
        x: canvas.width / 2,                          // Все стартуют из центра
        y: canvas.height / 2,
        speedX: (Math.random() - 0.5) * 6,            // Случайная скорость по X
        speedY: (Math.random() - 0.5) * 6             // Случайная скорость по Y
    });
}

// --- ФУНКЦИИ ОТРИСОВКИ ---

function drawAnt(x, y) {
    ctx.fillStyle = '#ffffff'; 
    ctx.beginPath();           
    ctx.arc(x, y, ANT_RADIUS, 0, Math.PI * 2); 
    ctx.fill();                
}

function drawHome(x, y, radius) {
    ctx.fillStyle = '#1e3a8a'; 
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3b82f6'; 
    ctx.lineWidth = 3;
    ctx.stroke();
}

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

    // Логика зон
    let foodX = canvas.width - 100;
    let foodY = canvas.height - 100;
    drawHome(homeX, homeY, 40);
    drawFood(foodX, foodY, 40);


    // ===================================================
    // === ТВОЙ НОВЫЙ КОД: ОБСЛУЖИВАЕМ ВСЮ ТОЛПУ В ЦИКЛЕ ===
    // ===================================================
    
    for (let i = 0; i < ants.length; i++) {
        let ant = ants[i]; // Берем одного конкретного муравья из массива

        // 1. Двигаем именно этого муравья
        ant.x += ant.speedX;
        ant.y += ant.speedY;

        // 2. Проверяем его личный отскок от левой/правой стены
        if (ant.x + ANT_RADIUS > canvas.width || ant.x - ANT_RADIUS < 0) {
            ant.speedX = -ant.speedX;
        }

        // 3. Проверяем его личный отскок от верхней/нижней стены
        if (ant.y + ANT_RADIUS > canvas.height || ant.y - ANT_RADIUS < 0) {
            ant.speedY = -ant.speedY;
        }

        // 4. Рисуем этого муравья на его новых координатах
        drawAnt(ant.x, ant.y);
    }

    requestAnimationFrame(animationLoop);
}

// Запуск
animationLoop();