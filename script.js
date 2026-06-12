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
let homeRadius = 40; // Вынесли радиус дома в переменную для удобства расчетов (Шаг 14)

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

// Функция для создания муравьев (Шаг 13: Добавлен статус еды hasFood)
function initAnts() {
    ants = [];
    for (let i = 0; i < ANTS_COUNT; i++) {
        ants.push({
            x: canvas.width / 2,         
            y: canvas.height / 2,
            speedX: (Math.random() - 0.5) * 6,         
            speedY: (Math.random() - 0.5) * 6,
            hasFood: false // Изначально пустой (белый) (Шаг 13)
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
    // При сбросе возвращаем количество к тому, что сейчас на слайдере
    ANTS_COUNT = parseInt(slider.value);
    initAnts(); 
});


// === [ШАГ 11 + ШАГ 12 (РУСЛАН)]: СВЯЗЫВАНИЕ СЛАЙДЕРА С КОДОМ ===
const slider = document.getElementById('antSlider');
const label = document.getElementById('antCountLabel');

slider.addEventListener('input', (e) => {
    const newValue = parseInt(e.target.value);
    label.innerText = newValue; // Обновляем циферку на панели (Шаг 11)
    
    ANTS_COUNT = newValue; // Обновляем глобальную переменную

    // Динамически меняем размер массива в памяти на лету (Шаг 12) (Шаг 13: Добавлен hasFood для новых муравьев)
    if (ants.length < ANTS_COUNT) {
        / * Изменение в рамках Шага 12 * /
        while (ants.length < ANTS_COUNT) {
            ants.push({
                x: canvas.width / 2,
                y: canvas.height / 2,
                speedX: (Math.random() - 0.5) * 6,
                speedY: (Math.random() - 0.5) * 6,
                hasFood: false 
            });
        }
    } else if (ants.length > ANTS_COUNT) {
        ants.length = ANTS_COUNT;
    }
});


// --- ФУНКЦИИ ОТРИСОВКИ ---

// === [ШАГ 13 (ЭРКИН)]: ИЗМЕНЕНИЕ ЦВЕТА ОТ СТАТУСА ===
function drawAnts(antsArray) {
    for (let i = 0; i < antsArray.length; i++) {
        let ant = antsArray[i];
        ctx.beginPath(); 
        
        // Проверяем: если дошел до еды — красим в красный, если нет — в белый
        if (ant.hasFood) {
            ctx.fillStyle = '#ef4444'; // Красный
        } else {
            ctx.fillStyle = '#ffffff'; // Белый
        }
        
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
    let foodRadius = 40;

    drawHome(homeX, homeY, homeRadius);
    drawFood(foodX, foodY, foodRadius);

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

            // === [ШАГ 13 (ЭРКИН)]: ПРОВЕРКА НА СТОЛКНОВЕНИЕ С ЕДОЙ ===
            let dxFood = ant.x - foodX;
            let dyFood = ant.y - foodY;
            let distanceToFood = Math.sqrt(dxFood * dxFood + dyFood * dyFood);

            // Если муравей пересёк границу еды, он берет её и становится красным
            if (distanceToFood < foodRadius + ANT_RADIUS) {
                ant.hasFood = true;
            }

            // === [ШАГ 14 (РУСЛАН)]: ПРОВЕРКА НА СТОЛКНОВЕНИЕ С ДОМОМ ===
            // Считаем расстояние от муравья до центра синего круга (дома)
            let dxHome = ant.x - homeX;
            let dyHome = ant.y - homeY;
            let distanceToHome = Math.sqrt(dxHome * dxHome + dyHome * dyHome);

            // Если красный муравей добежал до дома, он сбрасывает еду и снова белеет
            if (ant.hasFood && distanceToHome < homeRadius + ANT_RADIUS) {
                ant.hasFood = false;
            }
        }
    }

    // ТВОЙ ВЫЗОВ ИЗ ШАГА 9: Передаем массив в функцию отрисовки
    drawAnts(ants);

    requestAnimationFrame(animationLoop);
}

// Запуск
animationLoop();