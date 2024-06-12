const ROTATION_SPEED = Math.PI / 180 * 3
const SPEED = 5

let camera = {
    pos: new V2(0, 0),
    scale: 1
}

class Polygon {
    constructor(pos, points, color) {
        this.pos = pos
        this.points = points.map((p) => p)
        this.color = color
        this.angle = 0
        this.speed = new V2(0, 0)
    }
}

let player = new Polygon(new V2(100, 300),
    [new V2(150, 50), new V2(-50, 50),
    new V2(-30, -70), new V2(50, -50)],
    'red'
)

let enemy = new Polygon(new V2(300, 300),
    [new V2(60, 20), new V2(30, 50),
    new V2(-70, -20), new V2(50, -70),
    new V2(80, -50)],
    'green'
)

enemy.angle = Math.PI / 180 * 324

function moveCamera() {
    camera.pos.x = player.pos.x;
    camera.pos.y = player.pos.y;
}

function handleInput() {
    player.speed = new V2(0, 0)
    if (keyLeft.isDown) {
        player.angle += ROTATION_SPEED
    }
    if (keyRight.isDown) {
        player.angle -= ROTATION_SPEED
    }
    if (keyUp.isDown) {
        player.speed = rotatedVector(SPEED, player.angle)
    }
    if (keyDown.isDown) {
        player.speed = rotatedVector(-SPEED, player.angle)
    }
    if (keyPlus.isDown) {
        camera.scale += 0.01
    }
    if (keyMinus.isDown) {
        camera.scale -= 0.01
    }

    clearKeys()
}

enemy.speed.x = 0
enemy.speed.y = 0

function movePlayer() {
    player.pos.x += player.speed.x
    player.pos.y += player.speed.y
    moveCamera()
}

function drawingLoop() {
    drawPolygon(camera, player)
    drawPolygon(camera, enemy)
}

function loop() {
    enemy.angle += ROTATION_SPEED

    clearScreen()

    handleInput()

    if (checkCollision(player, enemy)) {
        player.color = 'white'
    } else {
        player.color = 'red'
    }
    // handleCollision(player, enemy)

    movePlayer()

    drawingLoop()

    requestAnimationFrame(loop)
}
requestAnimationFrame(loop)