"use strict";

let requestAnimFrame = (function(){
    return window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
})();

let canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");
canvas.width = 520;
canvas.height = 480;
document.body.appendChild(canvas);

let playerSpeed = 5;
let bulletSpeed = 6;
let backgroundFon = 'black';
let bullets = [];
let bulletsEnemies = [];
let isGameOver = false;
let moveLeftRight = true;
let moveDown = true;
let gameTime = 0;

let lastFire = Date.now();
let lastTime;

function main() {
    let now = Date.now();
    let dt = (now - lastTime) / 1000.0;

    update(dt);
    render();

    lastTime = now;
    if(!isGameOver) {
        requestAnimFrame(main);
    }
};

let player = {
    pos: [canvas.width/2 - 10, canvas.height - 30],
    blockGame: new BlockGame([0, 0], [20, 20], 'yellow', '1')
};

let enemies = [];

for(let i= 1; i<= 3; i++) {
    for(let j= 1; j<= 5; j++) {
        let enemy = {
            pos: [80 * j ,40 * i],
            blockGame: new BlockGame([0, 0], [30, 20] , 'white', '2')
        };
        enemies.push(enemy);
    }
    
}

function update(dt) {
        handleInput();
        updateEntities();
        positionEmenies(dt);
        checkCollisions();
};

function init() {
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    lastTime = Date.now();
    main();
}


function handleInput() {
    if(input.isDown('LEFT') || input.isDown('a')) {
        player.pos[0] -= playerSpeed;
    }

    if(input.isDown('RIGHT') || input.isDown('d')) {
        player.pos[0] += playerSpeed;
    }
    if(input.isDown('SPACE') && Date.now() - lastFire > 500) {
        let x = player.pos[0] + player.blockGame.size[0] / 2 - 5;
        let y = player.pos[1];

        blockShot(x, y, 'yellow', '1', 'up');
        lastFire = Date.now();
    }

}

function blockShot(x, y, color, yourStranger, direction) {
    bullets.push({ 
        pos: [x, y],
        blockGame: new BlockGame([0, 0], [10, 10] , color, yourStranger, direction),
    });
}

function updateEntities() {
    for(let i=0; i<bullets.length; i++) {
        let bullet = bullets[i];

        if(bullets[i].blockGame.direction === 'up') {
            bullet.pos[1] -= bulletSpeed;
        } 
        else if(bullets[i].blockGame.direction === 'down') {
            bullet.pos[1] -= -bulletSpeed;
        }
        

        if(bullet.pos[1] < 0 || bullet.pos[1] > canvas.height ||
           bullet.pos[0] > canvas.width) {
            bullets.splice(i, 1);
            i--;
        }
    }
}

function render() {
    ctx.fillStyle = backgroundFon;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    renderEntity(player);
    
    renderEntities(enemies);
    renderEntities(bullets);
};

function renderEntities(list) {
    for(let i=0; i<list.length; i++) {
        renderEntity(list[i]);
    }    
}

function renderEntity(entity) {
    ctx.save();
    ctx.translate(entity.pos[0], entity.pos[1]);
    entity.blockGame.render(ctx);
    ctx.restore();
}

function checkPlayerBounds() {
    if(player.pos[0] < 10) {
        player.pos[0] = 10;
    }
    else if(player.pos[0] > canvas.width - player.blockGame.size[0] - 10) {
        player.pos[0] = canvas.width - player.blockGame.size[0] - 10;
    }
}

//----------------------------

function positionEmenies(dt) {
    let enemiesPos = {
        arr: [],
        left: true,
        right: true
    };

    for(let i= 0; i< enemies.length; i++) {
        enemiesPos.arr.push(enemies[i].pos[0]);
    }

    enemiesPos.left = Math.min.apply(null, enemiesPos.arr);
    enemiesPos.right = Math.max.apply(null, enemiesPos.arr);

    checkEnemiesBounds(enemiesPos, dt);
}

function checkEnemiesBounds(enemiesMove, dt) {
    gameTime += dt;

    if(moveLeftRight) {
        moveEnemise(1 + gameTime / 5);
        if(enemiesMove.right > canvas.width - 40) {
            moveLeftRight = false;
            moveDown = true;
        }
    }
    else {
        moveEnemise(-1 - gameTime / 5);
        if(enemiesMove.left < 10) {
            moveLeftRight = true;
            moveDown = true;
        }
    }

    if(Math.random() < 1 - Math.pow(.993, gameTime)) {
        enemiesFire();
    }
}

function enemiesFire() {
    if(!isGameOver) {
        let randEnemies = randomInteger(0, enemies.length - 1);

        let x = enemies[randEnemies].pos[0] + enemies[randEnemies].blockGame.size[0] / 2 - 10;
        let y = enemies[randEnemies].pos[1];

        bullets.push({
            pos: [x, y],
            blockGame: new BlockGame([0, 0], [10, 10] , 'blue', '2', 'down')
        });
    }
}


function moveEnemise(num, dt) {
    for(let i= 0; i< enemies.length; i++) {
        enemies[i].pos[0] += num;
    }
    if(moveDown) {
        for(let i= 0; i< enemies.length; i++) {
            enemies[i].pos[1] += Math.abs(num* 2);
        }
        moveDown = false;
    }
    
}

// Collisions

function collides(x, y, r, b, x2, y2, r2, b2, ysu, ysb) {
    let newCollides = !(r <= x2 || x > r2 || b <= y2 || y > b2);

    if(newCollides && ysu !== ysb) {
        return true;
    }
    else if(newCollides && ysu === ysb) {
        return false;
    }
}

function boxCollides(pos, size, pos2, size2, ysu, ysb) {
    return collides(pos[0], pos[1],
                    pos[0] + size[0], pos[1] + size[1],
                    pos2[0], pos2[1],
                    pos2[0] + size2[0], pos2[1] + size2[1], ysu, ysb);
}

function checkCollisions() {
    checkPlayerBounds();

    if(!enemies.length) {
        gameOver();
    }

    for(let i=0; i<enemies.length; i++) {
        let posEnemies = enemies[i].pos;
        let sizeEnemies = enemies[i].blockGame.size;
        let posPlayer = player.pos;
        let sizePlayer = player.blockGame.size;
        let ysPlayer = player.blockGame.yourStranger;
        let ysEnemies = enemies[i].blockGame.yourStranger;

        for(let j=0; j<bullets.length; j++) {
            let ysBoullet = bullets[j].blockGame.yourStranger;
            let posBullets = bullets[j].pos;
            let sizeBullets = bullets[j].blockGame.size;


            if(boxCollides(posPlayer, sizePlayer, posBullets, sizeBullets, ysPlayer, ysBoullet)) {
                gameOver();
            } else if(boxCollides(posPlayer, sizePlayer, posEnemies, sizeEnemies, ysEnemies, ysPlayer)) {
                gameOver();
            }
            if(boxCollides(posEnemies, sizeEnemies, posBullets, sizeBullets, ysEnemies, ysBoullet)) {
                enemies.splice(i, 1);
                i--;

                bullets.splice(j, 1);
                break;
            }
        }
        if(posEnemies[1] > canvas.height) {
            gameOver();
        }
    }

}

function randomInteger(min, max) {
    let rand = min + Math.random() * (max + 1 - min);
    rand = Math.floor(rand);
    return rand;
}

function gameOver() {
    isGameOver = true;
}

init();