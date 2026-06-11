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
let ANTS_COUNT = 67; // Теперь это let, так как число будет меняться слайдером
let homeX = 100;
let homeY = 100;

// === [ШАГ 7 + ШАГ 11 (ЭРКИН)]: ПАНЕЛЬ УПРАВЛЕНИЯ СО СЛАЙДЕРОМ ===
const panel = document.createElement('div');
panel.style.position = 'absolute';
panel.style.top = '20px';                 
panel.style.left = '50%';                 
panel.style.transform = 'translateX(-50%)'; 
panel.style.background = 'rgba(31, 41, 55, 0.9)';
panel.style.padding = '15px';
panel.style.borderRadius = '8px';
panel.style.display = 'flex';
panel.style.alignItems = 'center'; // Выравнивание элементов по центру
panel.style.gap = '15px';
panel.style.zIndex = '10';

// Кнопки Руслана + Твой новый слайдер количества муравьев
panel.innerHTML = `
    <button id="startBtn" style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold;">Старт</button>
    <button id="stopBtn" style="background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold;">Стоп</button>
    <button id="resetBtn" style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold;">Сброс</button>
    
    <div style="width: 1px; height: 25px; background: #4b5563;"></div>
    
    <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
        <label for="antSlider" style="color: white; font-size: 11px; font-family: sans-serif;">Муравьи: <span id="antCountLabel" style="font-weight: bold; color: #3b82f6;">67</span></label>
        <input id="antSlider" type="range" min="1" max="300" value="67" style="cursor: pointer; width: 120px;">
    </div>
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


// === [ШАГ 8]: ОЖИВЛЕНИЕ КНОПОК ===
let isSimulationRunning = true; 

document.getElementById('stopBtn').addEventListener('click', () => {
    isSimulationRunning = false;
});

document.getElementById('startBtn').addEventListener('click', () => {
    isSimulationRunning = true;
});

document.getElementById('resetBtn').addEventListener('click', () => {
    initAnts(); 
});


// === [ШАГ 11 (ЭРКИН)]: СЛУШАТЕЛЬ ДЛЯ СЛАЙДЕРА ===
const slider = document.getElementById('antSlider');
const label = document.getElementById('antCountLabel');

slider.addEventListener('input', (e) => {
    const newValue = parseInt(e.target.value);
    label.innerText = newValue; // Обновляем циферку на панели
    
    // ПРИМЕЧАНИЕ: Сам массив муравьев тут пока не меняется. 
    // Наш Шаг 11 — это чисто интерфейс. Логику изменения количества в памяти напишет Руслан на Шаге 12.
});


// --- ФУНКЦИИ ОТРИСОВКИ ---

// === [ШАГ 9 (ЭРКИН)]: ОБНОВЛЕННАЯ ФУНКЦИЯ ОТРИСОВКИ ===
// Принимает массив и рисует всех муравьев разом
function drawAnts(antsArray) {
    ctx.fillStyle = '#ffffff'; 
    for (let i = 0; i < antsArray.length; i++) {
        let ant = antsArray[i];
        ctx.beginPath();           
        ctx.arc(ant.x, ant.y, ANT_RADIUS, 0, Math.PI * 2); 
        ctx.fill();                
    }
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

    // Логика движения Руслана
    if (isSimulationRunning) {
        for (let i = 0; i < ants.length; i++) {
            let ant = ants[i];
            
            ant.x += ant.speedX;
            ant.y += ant.speedY;

            if (ant.x + ANT_RADIUS > canvas.width || ant.x - ANT_RADIUS < 0) {
                ant.speedX = -ant.speedX;
            }

            if (ant.y + ANT_RADIUS > canvas.height || ant.y - ANT_RADIUS < 0) {
                ant.speedY = -ant.speedY;
            }
        }
    }

    // ТВОЙ ВЫЗОВ ИЗ ШАГА 9: Передаем массив в функцию отрисовки
    drawAnts(ants);

    requestAnimationFrame(animationLoop);
}

// Запуск
animationLoop();