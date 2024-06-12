function getCollisionArea(poly1, poly2) {
    let criticalPoints = []
    let collisionArea = []
    let points1 = rotatePoints(poly1.points, poly1.angle)
    let points2 = rotatePoints(poly2.points, poly2.angle)
    for (let pointIndex = 0; pointIndex < points1.length; pointIndex++) {
        let point1 = points1[pointIndex]
        let point2 = points1[(pointIndex + 1) % points1.length]

        let guideVec = new V2(point2.x - point1.x, point2.y - point1.y);
        let normal = unit(rotateVector(guideVec, Math.PI / 2))
        let min = Infinity
        let minNum
        for (let index = 0; index < points2.length; index++) {
            let point = points2[index]
            let dotProd = dot(normal, point)
            if (dotProd < min) {
                min = dotProd
                minNum = index
            }
        }

        criticalPoints.push(minNum)
        criticalPoints.push(minNum)
    }

    collisionArea = []
    for (let pointIndex = 1; pointIndex < points1.length + 1; pointIndex++) {
        let realIndex = pointIndex % points1.length
        let point1 = criticalPoints[pointIndex * 2 - 1]
        let point2 = criticalPoints[pointIndex * 2 % criticalPoints.length]

        let betweenIndex = point1;
        while (betweenIndex !== (point2 + 1) % points2.length) {
            collisionArea.push(new V2(points1[realIndex].x - points2[betweenIndex].x, points1[realIndex].y - points2[betweenIndex].y))
            betweenIndex++
            betweenIndex = betweenIndex % points2.length
        }
    }

    return collisionArea
}

function checkCollision(poly1, poly2) {
    //получение области столкновения
    let collisionArea = getCollisionArea(poly1, poly2)

    //прорисовка области столкновения
    let poly = new Polygon(poly1.pos, collisionArea, 'purple')
    drawPolygon(camera, poly)

    //проверка на попадание в область столкновения
    collisionArea = dislocatePoints(collisionArea, poly1.pos)
    startFromFirstPoint(collisionArea, collisionArea)
    connectPoints(collisionArea)
    if (ctx.isPointInPath(poly2.pos.x, poly2.pos.y)) {
        ctx.closePath()
        return true
    } else {
        ctx.closePath()
        return false
    }
}

function handleCollision(poly1, poly2) {
    let collisionArea = getCollisionArea(poly1, poly2)
    collisionArea = dislocatePoints(collisionArea, poly1.pos)

    for (let collisionIndex = 0; collisionIndex < collisionArea.length; collisionIndex++) {
        let point1 = collisionArea[collisionIndex]
        let point2 = collisionArea[(collisionIndex + 1) % collisionArea.length]
        let guideVec = new V2(point2.x - point1.x, point2.y - point1.y)
        let normal = unit(rotateVector(guideVec, -Math.PI / 2))
        let speed = new V2(poly2.speed.x - poly1.speed.x, poly2.speed.y - poly1.speed.y)
        let speedProjection = dot(speed, normal)
        let distance = dot(new V2(point1.x - poly2.pos.x, point1.y - poly2.pos.y), normal)
        if (distance < speedProjection) {
            let dif = speedProjection - distance
            let vecDif = unit(speed)
            vecDif.x *= dif
            vecDif.y *= dif
            poly1.speed.x += vecDif.x
            poly1.speed.y += vecDif.y
        }
    }
}