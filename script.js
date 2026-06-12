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
});

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
                ctx.fillStyle = `rgba(59, 130, 246, ${intensity * 0.4})`;
                ctx.fillRect(x * PHEROMONE_SIZE, y * PHEROMONE_SIZE, PHEROMONE_SIZE, PHEROMONE_SIZE);
            }
        }
    }
}

function drawAnts() {
    for (let i = 0; i < ants.length; i++) {
        let ant = ants[i];
        ctx.beginPath();
        ctx.fillStyle = ant.hasFood ? '#ef4444' : '#ffffff';
        ctx.arc(ant.x, ant.y, ANT_RADIUS, 0, Math.PI * 2);
        ctx.fill();                
    }
}

// --- ИГРОВОЙ ЦИКЛ ---
function animationLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let foodX = canvas.width - 100;
    let foodY = canvas.height - 100;
    let foodRadius = 40;

    // Сначала всегда рисуем базу
    drawPheromones();
    ctx.fillStyle = '#1e3a8a'; ctx.beginPath(); ctx.arc(homeX, homeY, homeRadius, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#065f46'; ctx.beginPath(); ctx.arc(foodX, foodY, foodRadius, 0, Math.PI * 2); ctx.fill();

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