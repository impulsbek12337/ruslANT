// Проверяем canvas
const canvas = document.getElementById('simulationCanvas');
if (!canvas) {
    alert("Критическая ошибка: В твоем HTML файле нет тега <canvas id='simulationCanvas'></canvas>!");
}
const ctx = canvas.getContext('2d');

// --- НАСТРОЙКИ СИМУЛЯЦИИ ---
const ANT_RADIUS = 5;
let ANTS_COUNT = 67;
let homeX = 100;
let homeY = 100;
let homeRadius = 40;

// === ПЕРЕМЕННАЯ СКОРОСТИ ИСПАРЕНИЯ ===
let evaporationSpeed = 0.005;

// === КАРТА ФЕРОМОНОВ (ВИЗУАЛЬНАЯ СЕТКА) ===
const PHEROMONE_SIZE = 20; 
let pheromoneGrid = [];    
let cols = 0;
let rows = 0;

function initPheromones() {
    let w = window.innerWidth > 0 ? window.innerWidth : 800;
    let h = window.innerHeight > 0 ? window.innerHeight : 600;
    cols = Math.ceil(w / PHEROMONE_SIZE);
    rows = Math.ceil(h / PHEROMONE_SIZE);
    
    pheromoneGrid = [];
    for (let x = 0; x < cols; x++) {
        pheromoneGrid[x] = [];
        for (let y = 0; y < rows; y++) {
            pheromoneGrid[x][y] = 0; 
        }
    }
}

// Принудительно ставим размеры окон
canvas.width = window.innerWidth > 0 ? window.innerWidth : 800;
canvas.height = window.innerHeight > 0 ? window.innerHeight : 600;
initPheromones();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth > 0 ? window.innerWidth : 800;
    canvas.height = window.innerHeight > 0 ? window.innerHeight : 600;
    initPheromones();
    generateDirtTexture(); // Перегенерируем текстуру под новый размер
});

// === ГЕНЕРАЦИЯ ТЕКСТУРЫ ЗЕМЛИ (чтобы не лагало в цикле) ===
let dirtCanvas = document.createElement('canvas');
let dirtCtx = dirtCanvas.getContext('2d');

function generateDirtTexture() {
    dirtCanvas.width = canvas.width;
    dirtCanvas.height = canvas.height;
    
    // Основной цвет земли
    dirtCtx.fillStyle = '#4a3525';
    dirtCtx.fillRect(0, 0, dirtCanvas.width, dirtCanvas.height);
    
    // Рисуем песчинки и текстуру почты
    for (let i = 0; i < (dirtCanvas.width * dirtCanvas.height) / 100; i++) {
        let x = Math.random() * dirtCanvas.width;
        let y = Math.random() * dirtCanvas.height;
        let size = Math.random() * 2 + 1;
        
        // Разные оттенки земли/песка
        let colors = ['#3d2b1f', '#5c4331', '#2e1f16', '#6e503b'];
        dirtCtx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        dirtCtx.fillRect(x, y, size, size);
    }
    
    // Мелкие камушки
    for (let i = 0; i < 30; i++) {
        let x = Math.random() * dirtCanvas.width;
        let y = Math.random() * dirtCanvas.height;
        let r = Math.random() * 4 + 2;
        dirtCtx.beginPath();
        dirtCtx.fillStyle = '#7a6b58';
        dirtCtx.arc(x, y, r, 0, Math.PI * 2);
        dirtCtx.fill();
    }
}
generateDirtTexture();

// === ПАНЕЛЬ УПРАВЛЕНИЯ ===
const panel = document.createElement('div');
panel.style.position = 'absolute';
panel.style.top = '20px';                
panel.style.left = '50%';                
panel.style.transform = 'translateX(-50%)';
panel.style.background = 'rgba(31, 41, 55, 0.9)';
panel.style.padding = '15px';
panel.style.borderRadius = '8px';
panel.style.display = 'flex';
panel.style.alignItems = 'center';
panel.style.gap = '15px';
panel.style.zIndex = '10';

panel.innerHTML = `
    <button id="startBtn" style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold;">Старт</button>
    <button id="stopBtn" style="background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold;">Стоп</button>
    <button id="resetBtn" style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold;">Сброс</button>
   
    <div style="width: 1px; height: 25px; background: #4b5563;"></div>
   
    <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
        <label style="color: white; font-size: 11px; font-family: sans-serif;">Муравьи: <span id="antCountLabel" style="font-weight: bold; color: #3b82f6;">67</span></label>
        <input id="antSlider" type="range" min="1" max="300" value="67" style="cursor: pointer; width: 120px;">
    </div>

    <div style="width: 1px; height: 25px; background: #4b5563;"></div>

    <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
        <label style="color: white; font-size: 11px; font-family: sans-serif;">Испарение: <span id="evaporationLabel" style="font-weight: bold; color: #10b981;">0.005</span></label>
        <input id="evaporationSlider" type="range" min="0.001" max="0.05" step="0.001" value="0.005" style="cursor: pointer; width: 120px;">
    </div>
`;
document.body.appendChild(panel);

// --- МАССИВ МУРАВЬЕВ ---
let ants = [];
function initAnts() {
    ants = [];
    for (let i = 0; i < ANTS_COUNT; i++) {
        let sx = (Math.random() - 0.5) * 6;
        let sy = (Math.random() - 0.5) * 6;
        if (Math.abs(sx) < 0.2) sx = 2;
        if (Math.abs(sy) < 0.2) sy = 2;

        ants.push({
            x: canvas.width / 2,        
            y: canvas.height / 2,
            speedX: sx,        
            speedY: sy,
            hasFood: false,
            pheromoneTimer: 0
        });
    }
}
initAnts();

// БЕЗОПАСНАЯ ПРИВЯЗКА КНОПОК И СЛАЙДЕРОВ
let isSimulationRunning = true;
try {
    document.getElementById('stopBtn').addEventListener('click', () => isSimulationRunning = false);
    document.getElementById('startBtn').addEventListener('click', () => isSimulationRunning = true);
    
    const slider = document.getElementById('antSlider');
    const label = document.getElementById('antCountLabel');
    
    document.getElementById('resetBtn').addEventListener('click', () => {
        if(slider) ANTS_COUNT = parseInt(slider.value);
        initAnts();
        initPheromones();
    });

    if(slider && label) {
        slider.addEventListener('input', (e) => {
            const newValue = parseInt(e.target.value);
            label.innerText = newValue;
            ANTS_COUNT = newValue;
            while (ants.length < ANTS_COUNT) {
                ants.push({
                    x: canvas.width / 2, y: canvas.height / 2,
                    speedX: (Math.random() - 0.5) * 6, speedY: (Math.random() - 0.5) * 6,
                    hasFood: false,
                    pheromoneTimer: 0
                });
            }
            if (ants.length > ANTS_COUNT) ants.length = ANTS_COUNT;
        });
    }

    const evapSlider = document.getElementById('evaporationSlider');
    const evapLabel = document.getElementById('evaporationLabel');
    if(evapSlider && evapLabel) {
        evapSlider.addEventListener('input', (e) => {
            const newValue = parseFloat(e.target.value);
            evapLabel.innerText = newValue;
            evaporationSpeed = newValue; 
        });
    }
} catch(e) {
    console.log("Внешние элементы интерфейса обрабатываются автоматически", e);
}

// --- ФУНКЦИИ ОТРИСОВКИ ---
function drawPheromones() {
    if (cols <= 0 || rows <= 0 || !pheromoneGrid.length) return;
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            if (pheromoneGrid[x] && pheromoneGrid[x][y] > 0) {
                let intensity = pheromoneGrid[x][y];
                // Сделали след чуть более мягким и неоновым (бирюзово-синим)
                ctx.fillStyle = `rgba(56, 189, 248, ${intensity * 0.35})`;
                ctx.fillRect(x * PHEROMONE_SIZE, y * PHEROMONE_SIZE, PHEROMONE_SIZE, PHEROMONE_SIZE);
            }
        }
    }
}

function drawAnts() {
    for (let i = 0; i < ants.length; i++) {
        let ant = ants[i];
        
        // Считаем угол поворота муравья по вектору его скорости
        let angle = Math.atan2(ant.speedY, ant.speedX);
        
        ctx.save();
        ctx.translate(ant.x, ant.y);
        ctx.rotate(angle);
        
        // Анимация движения лапок (зависит от координат, чтобы у каждого была своя фаза)
        let legWiggle = Math.sin((ant.x + ant.y) * 0.5) * 0.3;
        
        // Рисуем лапки (3 пары)
        ctx.strokeStyle = ant.hasFood ? '#4a2310' : '#111111';
        ctx.lineWidth = 1.2;
        
        for (let side of [-1, 1]) {
            // Передние
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(3, side * 5 + legWiggle); ctx.stroke();
            // Средние
            ctx.beginPath(); ctx.moveTo(-2, 0); ctx.lineTo(-2, side * 5 - legWiggle); ctx.stroke();
            // Задние
            ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(-6, side * 6 + legWiggle); ctx.stroke();
        }
        
        // Цвет тела: обычный — черный/темно-серый, с едой — слегка красноватый лесной муравей
        ctx.fillStyle = ant.hasFood ? '#8b261b' : '#1a1a1a';
        
        // Брюшко (задняя часть)
        ctx.beginPath(); ctx.arc(-4, 0, 2.5, 0, Math.PI * 2); ctx.fill();
        // Грудь (средняя часть)
        ctx.beginPath(); ctx.arc(-1, 0, 1.8, 0, Math.PI * 2); ctx.fill();
        // Голова
        ctx.beginPath(); ctx.arc(2, 0, 1.8, 0, Math.PI * 2); ctx.fill();
        
        // Усики
        ctx.strokeStyle = ant.hasFood ? '#8b261b' : '#1a1a1a';
        ctx.beginPath(); ctx.moveTo(3, -0.5); ctx.lineTo(5, -2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(3, 0.5); ctx.lineTo(5, 2); ctx.stroke();
        
        // Если муравей тащит еду — рисуем листочек перед ним
        if (ant.hasFood) {
            ctx.fillStyle = '#22c55e'; // Зеленый кусочек
            ctx.beginPath();
            ctx.arc(5, 0, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}

// --- ИГРОВОЙ ЦИКЛ ---
function animationLoop() {
    // Вместо clearRect накладываем заготовленный холст с текстурой земли
    ctx.drawImage(dirtCanvas, 0, 0);

    let foodX = canvas.width - 100;
    let foodY = canvas.height - 100;
    let foodRadius = 40;

    drawPheromones();
    
    // --- ОТРИСОВКА ДОМА (НОРКА В ЗЕМЛЕ) ---
    // Внешнее кольцо (насыпь)
    ctx.fillStyle = '#3a281c'; ctx.beginPath(); ctx.arc(homeX, homeY, homeRadius, 0, Math.PI * 2); ctx.fill();
    // Темный вход в нору с градиентом глубины
    let homeGrad = ctx.createRadialGradient(homeX, homeY, 5, homeX, homeY, homeRadius - 10);
    homeGrad.addColorStop(0, '#0a0503');
    homeGrad.addColorStop(1, '#2b1d14');
    ctx.fillStyle = homeGrad; ctx.beginPath(); ctx.arc(homeX, homeY, homeRadius - 10, 0, Math.PI * 2); ctx.fill();

    // --- ОТРИСОВКА ИСТОЧНИКА ЕДЫ (КУЧА ТРАВЫ/ЯГОД) ---
    ctx.fillStyle = '#15803d'; ctx.beginPath(); ctx.arc(foodX, foodY, foodRadius, 0, Math.PI * 2); ctx.fill();
    // Добавим текстурных вкраплений на источник еды
    for(let r = 5; r < foodRadius; r += 10) {
        ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(foodX + (Math.sin(r)*4), foodY + (Math.cos(r)*4), r, 0, Math.PI * 0.5); ctx.stroke();
    }

    if (isSimulationRunning) {
        // Испарение феромонов
        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                if (pheromoneGrid[x] && pheromoneGrid[x][y] > 0) {
                    pheromoneGrid[x][y] -= evaporationSpeed;
                    if (pheromoneGrid[x][y] < 0) pheromoneGrid[x][y] = 0;
                }
            }
        }

        // Логика муравьев
        for (let i = 0; i < ants.length; i++) {
            let ant = ants[i];

            let cx = Math.floor(ant.x / PHEROMONE_SIZE);
            let cy = Math.floor(ant.y / PHEROMONE_SIZE);

            if (ant.hasFood) {
                // === МУРАВЕЙ С ЕДОЙ: Целенаправленно бежит к дому ===
                let dirX = homeX - ant.x;
                let dirY = homeY - ant.y;
                let dist = Math.sqrt(dirX * dirX + dirY * dirY);
                
                if (dist > 0) {
                    ant.speedX = (dirX / dist) * 3.5 + (Math.random() - 0.5) * 0.7;
                    ant.speedY = (dirY / dist) * 3.5 + (Math.random() - 0.5) * 0.7;
                }
            } else {
                // === МУРАВЕЙ БЕЗ ЕДЫ: Ищет след феромона ===
                if (cols > 0 && rows > 0) {
                    let sX = Math.sign(ant.speedX);
                    let sY = Math.sign(ant.speedY);

                    let checkGrid = (x, y) => {
                        if (x >= 0 && x < cols && y >= 0 && y < rows && pheromoneGrid[x]) {
                            return pheromoneGrid[x][y] || 0;
                        }
                        return 0;
                    };

                    let smellCenter = checkGrid(cx + sX, cy + sY);
                    let smellLeft   = checkGrid(cx + (sX - sY), cy + (sY + sX));
                    let smellRight  = checkGrid(cx + (sX + sY), cy + (sY - sX));

                    if (smellCenter > 0 || smellLeft > 0 || smellRight > 0) {
                        // Плавно корректируем курс в сторону максимального запаха
                        if (smellLeft > smellCenter && smellLeft > smellRight) {
                            ant.speedX += -sY * 0.6;
                            ant.speedY += sX * 0.6;
                        } else if (smellRight > smellCenter && smellRight > smellLeft) {
                            ant.speedX += sY * 0.6;
                            ant.speedY += -sX * 0.6;
                        } else {
                            ant.speedX += sX * 0.3;
                            ant.speedY += sY * 0.3;
                        }
                    } else {
                        // Запаха нет — обычное хаотичное блуждание
                        ant.speedX += (Math.random() - 0.5) * 0.5;
                        ant.speedY += (Math.random() - 0.5) * 0.5;
                    }
                }
            }

            // Ограничение скорости
            let speed = Math.sqrt(ant.speedX * ant.speedX + ant.speedY * ant.speedY);
            if (speed > 3.5) {
                ant.speedX = (ant.speedX / speed) * 3.5;
                ant.speedY = (ant.speedY / speed) * 3.5;
            }

            ant.x += ant.speedX;
            ant.y += ant.speedY;

            // Стены
            if (ant.x < 0 || ant.x > canvas.width) { 
                ant.speedX = -ant.speedX; 
                ant.x = Math.max(0, Math.min(canvas.width, ant.x)); 
            }
            if (ant.y < 0 || ant.y > canvas.height) { 
                ant.speedY = -ant.speedY; 
                ant.y = Math.max(0, Math.min(canvas.height, ant.y)); 
            }

            // Еда и дом
            if (!ant.hasFood && Math.sqrt((ant.x - foodX)**2 + (ant.y - foodY)**2) < foodRadius) {
                ant.hasFood = true;
            }
            if (ant.hasFood && Math.sqrt((ant.x - homeX)**2 + (ant.y - homeY)**2) < homeRadius) {
                ant.hasFood = false;
            }

            // Оставление следа
            if (ant.hasFood) {
                ant.pheromoneTimer++;
                if (ant.pheromoneTimer >= 5) {
                    if (cx >= 0 && cx < cols && cy >= 0 && cy < rows && pheromoneGrid[cx]) {
                        pheromoneGrid[cx][cy] = 1.0;
                    }
                    ant.pheromoneTimer = 0;
                }
            }
        }
    }

    drawAnts();
    requestAnimationFrame(animationLoop);
}

animationLoop();