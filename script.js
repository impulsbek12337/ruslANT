// Находим холст и контекст для рисования
const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');

// Функция, которая подстраивает размер холста под экран
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Временная заливка, чтобы проверить, что всё работает (сделаем серый экран)
    ctx.fillStyle = '#2d2d2d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Выведем текст по центру для красоты
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Холст готов. Ждем муравьев от Руслана!', canvas.width / 2, canvas.height / 2);
}

// Запускаем настройку при старте
resizeCanvas();

// Если пользователь изменит размер окна — холст подстроится под него
window.addEventListener('resize', resizeCanvas);