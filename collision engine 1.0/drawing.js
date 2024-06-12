'use strict'

let canvas = document.getElementById("canvas")
let ctx = canvas.getContext("2d")

canvas.width = 800
canvas.height = 800

function startDrawing(x, y) {
    ctx.beginPath()
    ctx.moveTo(x, y)
}

function startFromFirstPoint(points) {
    startDrawing(points[0].x, points[0].y)
}

function fillDrawing(color) {
    ctx.fillStyle = color
    ctx.fill()
}

function connectPoints(points) {
    points.forEach(elem => {
        ctx.lineTo(elem.x, elem.y)
    })
}

function rotatePoints(points, angle) {
    return points.map(point => {
        return rotateVector(point, angle)
    })
}

function dislocatePoints(points, pos) {
    return points.map(point => {
        point.x += pos.x
        point.y += pos.y
        return point
    })
}

function drawPolygon(camera, poly) {
    ctx.save()

    //масштабирование от центра
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.scale(camera.scale, camera.scale)

    //перевод на координаты игрока по сравнению с камерой
    ctx.translate(-camera.pos.x + poly.pos.x, -camera.pos.y + poly.pos.y)

    //поворот игрока
    ctx.rotate(-poly.angle)

    //прорисовка точек игрока онтосительно его центра
    startFromFirstPoint(poly.points)
    connectPoints(poly.points)
    fillDrawing(poly.color)

    ctx.restore()
}

function clearScreen() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.height)
}