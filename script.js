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
const ANTS_COUNT = 67; 
let homeX = 100;
let homeY = 100;

// === [ШАГ 7]: ПАНЕЛЬ УПРАВЛЕНИЯ (Интерфейс) ===
const panel = document.createElement('div');
panel.style.position = 'absolute';
panel.style.top = '20px';                 // Отступ сверху
panel.style.left = '50%';                 // Сдвигаем на центр экрана
panel.style.transform = 'translateX(-50%)'; // Выравниваем ровно по центру
panel.style.background = 'rgba(31, 41, 55, 0.9)';
panel.style.padding = '15px';
panel.style.borderRadius = '8px';
panel.style.display = 'flex';
panel.style.gap = '10px';
panel.style.zIndex = '10';

// Создаем кнопки
panel.innerHTML = `
    <button id="startBtn" style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold;">Старт</button>
    <button id="stopBtn" style="background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold;">Стоп</button>
    <button id="resetBtn" style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold;">Сброс</button>
`;
document.body.appendChild(panel);

// --- МАССИВ МУРАВЬЕВ ---
let ants = [];

// Функция для создания муравьев (нужна для сброса)
function initAnts() {
    ants = [];
    for (let i = 0; i < ANTS_COUNT; i++) {
        ants.push({
            x: canvas.width / 2,         
            y: canvas.height / 2,
            speedX: (Math.random() - 0.5) * 6,         
            speedY: (Math.random() - 0.5) * 6          
        });
    }
}
initAnts();


// === [ШАГ 8]: ОЖИВЛЕНИЕ КНОПОК (Логика) ===
let isSimulationRunning = true; // Флаг: идет симуляция или стоит на паузе

// Кнопка СТОП
document.getElementById('stopBtn').addEventListener('click', () => {
    isSimulationRunning = false;
});

// Кнопка СТАРТ
document.getElementById('startBtn').addEventListener('click', () => {
    isSimulationRunning = true;
});

// Кнопка СБРОС
document.getElementById('resetBtn').addEventListener('click', () => {
    initAnts(); // Возвращаем всех в центр и даем новые случайные направления
});


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

    let foodX = canvas.width - 100;
    let foodY = canvas.height - 100;
    drawHome(homeX, homeY, 40);
    drawFood(foodX, foodY, 40);

    for (let i = 0; i < ants.length; i++) {
        let ant = ants[i];

        // Если симуляция запущена — двигаем муравьев. Если Стоп — они замирают.
        if (isSimulationRunning) {
            ant.x += ant.speedX;
            ant.y += ant.speedY;

            if (ant.x + ANT_RADIUS > canvas.width || ant.x - ANT_RADIUS < 0) {
                ant.speedX = -ant.speedX;
            }

            if (ant.y + ANT_RADIUS > canvas.height || ant.y - ANT_RADIUS < 0) {
                ant.speedY = -ant.speedY;
            }
        }

        // Рисуются муравьи всегда (даже на паузе)
        drawAnt(ant.x, ant.y);
    }

    requestAnimationFrame(animationLoop);
}

// Запуск
animationLoop();