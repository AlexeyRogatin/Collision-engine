class Key {
    isDown = false
    wentDown = false
    wentUp = false
}

let keys = []

let keyUp = new Key()
let keyDown = new Key()
let keyLeft = new Key()
let keyRight = new Key()
let keyPlus = new Key()
let keyMinus = new Key()

const UP_KEY = 87
const DOWN_KEY = 83
const LEFT_KEY = 65
const RIGHT_KEY = 68
const PLUS_KEY = 107
const MINUS_KEY = 109

function handleKeyDown(event, keyCode, key) {
    if (event.keyCode === keyCode) {
        if (!key.isDown) {
            key.isDown = true;
            key.wentDown = true;
        }
    }
}

function handleKeyUp(event, keyCode, key) {
    if (event.keyCode === keyCode) {
        if (key.isDown) {
            key.isDown = false;
            key.wentDown = true;
        }
    }
}

window.onkeydown = (event => {
    handleKeyDown(event, UP_KEY, keyUp);
    handleKeyDown(event, DOWN_KEY, keyDown);
    handleKeyDown(event, LEFT_KEY, keyLeft);
    handleKeyDown(event, RIGHT_KEY, keyRight);
    handleKeyDown(event, PLUS_KEY, keyPlus);
    handleKeyDown(event, MINUS_KEY, keyMinus);
})

window.onkeyup = (event => {
    handleKeyUp(event, UP_KEY, keyUp);
    handleKeyUp(event, DOWN_KEY, keyDown);
    handleKeyUp(event, LEFT_KEY, keyLeft);
    handleKeyUp(event, RIGHT_KEY, keyRight);
    handleKeyUp(event, PLUS_KEY, keyPlus);
    handleKeyUp(event, MINUS_KEY, keyMinus);
})

function clearKey(key) {
    key.wentDown = false;
    key.wentUp = false;
}

function clearKeys() {
    clearKey(keyUp)
    clearKey(keyDown)
    clearKey(keyLeft)
    clearKey(keyRight)
    clearKey(keyPlus)
    clearKey(keyMinus)
}