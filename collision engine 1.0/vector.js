class V2 {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
    length() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2))
    }
    angle() {
        let angle = Math.atan((-this.y) / this.x)
        if (this.x < 0) {
            angle += Math.PI
        }
        return angle
    }
}

function angleBetweenPoints(centerPoint, point) {
    let vec = new V2(point.x - centerPoint.x, point.y - centerPoint.y)
    return Math.atan(vec.y / vec.x)
}

function rotateVector(vec, angle) {
    let radius = vec.length()
    angle += vec.angle()
    return new V2(radius * Math.cos(angle), -radius * Math.sin(angle))
}

function rotatedVector(radius, angle) {
    return new V2(radius * Math.cos(angle), -radius * Math.sin(angle))
}

function dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y
}

function unit(vec) {
    let len = vec.length()
    return new V2(vec.x / len, vec.y / len)
}