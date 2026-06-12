const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initPheromones(); 
}
window.addEventListener('resize', resizeCanvas);

// --- НАСТРОЙКИ СИМУЛЯЦИИ ---
const ANT_RADIUS = 5;
let ANTS_COUNT = 67; 
let homeX = 100;
let homeY = 100;
let homeRadius = 40; 

// === [ШАГ 15 (ЭРКИН)]: КАРТА ФЕРОМОНОВ (ВИЗУАЛЬНАЯ СЕТКА) ===
const PHEROMONE_SIZE = 20; // Размер одного квадратика сетки
let pheromoneGrid = [];    // Двумерный массив для интенсивности запаха
let cols = 0;
let rows = 0;

function initPheromones() {
    cols = Math.ceil(window.innerWidth / PHEROMONE_SIZE);
    rows = Math.ceil(window.innerHeight / PHEROMONE_SIZE);
    pheromoneGrid = [];
    for (let x = 0; x < cols; x++) {
        pheromoneGrid[x] = [];
        for (let y = 0; y < rows; y++) {
            pheromoneGrid[x][y] = 0; // Изначально запаха нет, сетка пустая
        }
    }
}

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
initPheromones();

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
panel.style.alignItems = 'center'; 
panel.style.gap = '15px';
panel.style.zIndex = '10';

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
function initAnts() {
    ants = [];
    for (let i = 0; i < ANTS_COUNT; i++) {
        ants.push({
            x: canvas.width / 2,         
            y: canvas.height / 2,
            speedX: (Math.random() - 0.5) * 6,         
            speedY: (Math.random() - 0.5) * 6,
            hasFood: false 
        });
    }
}
initAnts();

// Кнопки
let isSimulationRunning = true; 
document.getElementById('stopBtn').addEventListener('click', () => isSimulationRunning = false);
document.getElementById('startBtn').addEventListener('click', () => isSimulationRunning = true);
document.getElementById('resetBtn').addEventListener('click', () => {
    ANTS_COUNT = parseInt(slider.value);
    initAnts(); 
    initPheromones(); 
});

// Слайдер
const slider = document.getElementById('antSlider');
const label = document.getElementById('antCountLabel');
slider.addEventListener('input', (e) => {
    const newValue = parseInt(e.target.value);
    label.innerText = newValue; 
    ANTS_COUNT = newValue; 
    if (ants.length < ANTS_COUNT) {
        while (ants.length < ANTS_COUNT) {
            ants.push({
                x: canvas.width / 2, y: canvas.height / 2,
                speedX: (Math.random() - 0.5) * 6, speedY: (Math.random() - 0.5) * 6,
                hasFood: false 
            });
        }
    } else if (ants.length > ANTS_COUNT) {
        ants.length = ANTS_COUNT;
    }
});

// --- ФУНКЦИИ ОТРИСОВКИ ---

// === [ШАГ 15 (ЭРКИН)]: ОТРИСОВКА ПОЛУПРОЗРАЧНЫХ СИНИХ КВАДРАТИКОВ ===
function drawPheromones() {
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            // Тонкая сеточка на фоне, чтобы препод видел структуру карты
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.03)'; 
            ctx.lineWidth = 1;
            ctx.strokeRect(x * PHEROMONE_SIZE, y * PHEROMONE_SIZE, PHEROMONE_SIZE, PHEROMONE_SIZE);

            // Если в ячейке появится запах — рисуем полупрозрачный синий квадрат
            if (pheromoneGrid[x] && pheromoneGrid[x][y] > 0) {
                let intensity = pheromoneGrid[x][y];
                ctx.fillStyle = `rgba(59, 130, 246, ${intensity * 0.4})`; 
                ctx.fillRect(x * PHEROMONE_SIZE, y * PHEROMONE_SIZE, PHEROMONE_SIZE, PHEROMONE_SIZE);
            }
        }
    }
}

function drawAnts(antsArray) {
    for (let i = 0; i < antsArray.length; i++) {
        let ant = antsArray[i];
        ctx.beginPath(); 
        ctx.fillStyle = ant.hasFood ? '#ef4444' : '#ffffff'; 
        ctx.arc(ant.x, ant.y, ANT_RADIUS, 0, Math.PI * 2); 
        ctx.fill();                
    }
}

function drawHome(x, y, radius) {
    ctx.fillStyle = '#1e3a8a'; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 3; ctx.stroke();
}

function drawFood(x, y, radius) {
    ctx.fillStyle = '#065f46'; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#10b981'; ctx.lineWidth = 3; ctx.stroke();
}

// --- ИГРОВОЙ ЦИКЛ ---
function animationLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let foodX = canvas.width - 100;
    let foodY = canvas.height - 100;
    let foodRadius = 40;

    drawPheromones();

    drawHome(homeX, homeY, homeRadius);
    drawFood(foodX, foodY, foodRadius);

    if (isSimulationRunning) {
        // === [ШАГ 15 (ЭРКИН)]: ПЛАВНОЕ ИСПАРЕНИЕ ЯЧЕЕК ===
        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                if (pheromoneGrid[x] && pheromoneGrid[x][y] > 0) {
                    pheromoneGrid[x][y] -= 0.005; // Каждым кадром уменьшаем интенсивность
                    if (pheromoneGrid[x][y] < 0) {
                        pheromoneGrid[x][y] = 0; 
                    }
                }
            }
        }

        for (let i = 0; i < ants.length; i++) {
            let ant = ants[i];
            ant.x += ant.speedX;
            ant.y += ant.speedY;

            if (ant.x + ANT_RADIUS > canvas.width || ant.x - ANT_RADIUS < 0) ant.speedX = -ant.speedX;
            if (ant.y + ANT_RADIUS > canvas.height || ant.y - ANT_RADIUS < 0) ant.speedY = -ant.speedY;

            let dxFood = ant.x - foodX; let dyFood = ant.y - foodY;
            if (Math.sqrt(dxFood * dxFood + dyFood * dyFood) < foodRadius + ANT_RADIUS) {
                ant.hasFood = true;
            }

            let dxHome = ant.x - homeX; let dyHome = ant.y - homeY;
            if (ant.hasFood && Math.sqrt(dxHome * dxHome + dyHome * dyHome) < homeRadius + ANT_RADIUS) {
                ant.hasFood = false;
            }
        }
    }

    drawAnts(ants);
    requestAnimationFrame(animationLoop);
}

animationLoop();