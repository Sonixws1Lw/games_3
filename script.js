const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = 1000;
canvas.height = 600;

let score = 0;
let gameState = "PLAYING";
let keys = {};

class Dragon {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.w = 40; this.h = 30;
        this.speed = 6; 
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Тіло (Дракоша-Пакет)
        ctx.fillStyle = "#535353";
        ctx.fillRect(-20, -15, 40, 30);
        
        // Шипи на спині
        ctx.fillStyle = "#333";
        for(let i=0; i<3; i++) {
            ctx.beginPath();
            ctx.moveTo(-15 + i*12, -15);
            ctx.lineTo(-10 + i*12, -26);
            ctx.lineTo(-5 + i*12, -15);
            ctx.fill();
        }

        // Червоні Вушка
        ctx.fillStyle = "#f00";
        ctx.fillRect(-24, -22, 10, 10);
        ctx.fillRect(14, -22, 10, 10);

        // Очі
        ctx.fillStyle = "#fff";
        ctx.fillRect(-12, -6, 7, 7);
        ctx.fillRect(5, -6, 7, 7);

        // Хвіст, що махає
        let tailSwing = Math.sin(Date.now()/150) * 12;
        ctx.fillStyle = "#535353";
        ctx.beginPath();
        ctx.moveTo(-20, 0);
        ctx.lineTo(-45, tailSwing);
        ctx.lineTo(-20, 12);
        ctx.fill();

        ctx.restore();
    }
}

class Hunter {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.speed = 3.5; 
    }

    update(tx, ty) {
        let dx = tx - this.x;
        let dy = ty - this.y;
        let angle = Math.atan2(dy, dx);
        this.x += Math.cos(angle) * this.speed;
        this.y += Math.sin(angle) * this.speed;
    }

    draw() {
        ctx.fillStyle = "rgba(0,0,0,0.8)";
        ctx.beginPath(); ctx.arc(this.x, this.y, 45, 0, Math.PI*2); ctx.fill();
        
        // Глітч-рамка
        ctx.strokeStyle = "#f00"; ctx.lineWidth = 2;
        ctx.strokeRect(this.x - 48 + Math.random()*6, this.y - 48 + Math.random()*6, 96, 96);

        // Око Шредера
        ctx.fillStyle = "#f00";
        ctx.beginPath(); ctx.arc(this.x, this.y, 18, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#000"; ctx.fillRect(this.x - 3, this.y - 12, 6, 24);
    }
}

let player = new Dragon(500, 300);
let hunter = new Hunter(0, 0);
let food = [];

function spawnFood() {
    food.push({ x: Math.random()*900+50, y: Math.random()*500+50 });
}

for(let i=0; i<6; i++) spawnFood();

window.onkeydown = e => keys[e.code] = true;
window.onkeyup = e => keys[e.code] = false;

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === "PLAYING") {
        if (keys['KeyW'] || keys['ArrowUp']) player.y -= player.speed;
        if (keys['KeyS'] || keys['ArrowDown']) player.y += player.speed;
        if (keys['KeyA'] || keys['ArrowLeft']) player.x -= player.speed;
        if (keys['KeyD'] || keys['ArrowRight']) player.x += player.speed;

        // Обмеження поля
        if(player.x < 20) player.x = 20; if(player.x > 980) player.x = 980;
        if(player.y < 20) player.y = 20; if(player.y > 580) player.y = 580;

        hunter.update(player.x, player.y);

        // Перевірка на зіткнення з мисливцем
        if (Math.hypot(player.x - hunter.x, player.y - hunter.y) < 55) gameState = "OVER";

        // Перевірка на збір кешу
        food.forEach((f, i) => {
            if (Math.hypot(player.x - f.x, player.y - f.y) < 35) {
                food.splice(i, 1);
                score++;
                document.getElementById('counter').innerText = "CACHE_COLLECTED: " + score + "/10";
                spawnFood();
                if (score >= 10) gameState = "WIN";
            }
        });
    }

    // Малюємо кеш (01)
    food.forEach(f => {
        ctx.fillStyle = "#535353";
        ctx.strokeRect(f.x-12, f.y-12, 24, 24);
        ctx.font = "bold 10px monospace";
        ctx.fillText("01", f.x-6, f.y+4);
    });

    hunter.draw();
    player.draw();

    // Екран результату
    if (gameState !== "PLAYING") {
        ctx.fillStyle = "rgba(0,0,0,0.9)"; ctx.fillRect(0,0,1000,600);
        ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.font = "bold 35px monospace";
        ctx.fillText(gameState === "WIN" ? "СИСТЕМУ ОЧИЩЕНО УСПІШНО!" : "ВІРУС ВИДАЛИВ ДАНІ", 500, 300);
        ctx.font = "18px monospace"; ctx.fillText("КЛІКНІТЬ ДЛЯ RESTART", 500, 350);
    }

    requestAnimationFrame(loop);
}

canvas.addEventListener('mousedown', () => { 
    if(gameState !== "PLAYING") location.reload(); 
});

loop();