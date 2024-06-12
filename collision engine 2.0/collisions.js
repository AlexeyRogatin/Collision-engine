function AABB(rect1, rect2) {
    let left = rect1.pos.x - rect2.pos.x - rect1.size.x / 2 - rect2.size.x / 2;
    let right = rect1.pos.x - rect2.pos.x + rect1.size.x / 2 + rect2.size.x / 2;
    let top = rect1.pos.y - rect2.pos.y - rect1.size.y / 2 - rect2.size.y / 2;
    let bottom = rect1.pos.y - rect2.pos.y + rect1.size.y / 2 + rect2.size.y / 2;
    return (
        0 >= left && 0 <= right
        && 0 >= top && 0 <= bottom
    )
}

function CircleCircle(circle1, circle2) {
    return circle1.pos.sub(circle2.pos).length() < circle1.radius + circle2.radius;
}

function CollideConvex(convex1, convex2, ctx) {
    // ctx.beginPath();
    // ctx.arc(100, 100, 5, 0, Math.PI * 2);
    // ctx.closePath();
    // ctx.fillStyle = "green";
    // ctx.fill();

    let cso = (vector) => {
        let vec1 = convex1.func(vector);
        let vec2 = convex2.func(vector);
        let pos1 = convex1.pos;
        let pos2 = convex2.pos;
        let res = pos2.sub(pos1).add(vec1.add(vec2));

        // ctx.beginPath();
        // ctx.arc(pos1.add(vec1).x, pos1.add(vec1).y, 5, 0, Math.PI * 2);
        // ctx.closePath();
        // ctx.fillStyle = "red";
        // ctx.fill();

        // ctx.beginPath();
        // ctx.arc(pos2.add(vec2).x, pos2.add(vec2).y, 5, 0, Math.PI * 2);
        // ctx.closePath();
        // ctx.fillStyle = "red";
        // ctx.fill();

        return res;
    };
    
    let support = cso(vector(1, 0));
    let simplex = [support];
    let direction = support.inv();
    let count = 0;

    while (true) {
        count++;
        support = cso(direction);

        let d = support.dot(direction);
        if (d < 0) {
            return false;
        }
        simplex.push(support);
        let res;
        [direction, res] = DoSimplex(simplex, direction);
        if (res) {
            return res;
        }
    }
}

function DoSimplex(simplex, direction) {
    if (simplex.length === 2) {
        let vec = simplex[1].sub(simplex[0]);
        direction = vec.perpendicularInDirection(simplex[0].inv());
    } else if (simplex.length === 3) {
        for (let index = 0; index < 3; index++) {
            let index1 = index;
            let index2 = (index + 1) % 3;
            let index3 = (index + 2) % 3;
            let dir = simplex[index3].sub(simplex[index1]);
            if (!OriginInLineDirection(simplex[index1], simplex[index2], dir)) {
                let vec = simplex[index2].sub(simplex[index1]);
                direction = vec.perpendicularInDirection(dir.inv());
                simplex.splice(index3, 1);
                break;
            }
        }
        if (simplex.length === 3) {
            return [direction, true];
        }
    } else {
        direction = simplex[0].inv();
    } 
    if (direction.length() === 0) {
        return [direction, true];
    }
    return [direction, false];
}

function OriginInLineDirection(point1, point2, direction) {
    let vec = point2.sub(point1);
    let perp = vec.perpendicularInDirection(direction);
    let res = point1.inv().dot(perp) > 0;
    return res;
}

function OriginInLineDirectionPoint(point1, point2, directionPoint) {
    let direction = directionPoint.sub(point1);
    return OriginInLineDirection(point1, point2, direction);
}

function SimplexContainsOrigin(simplex) {
    return (
        OriginInLineDirection(simplex[0], simplex[1], simplex[2])
        && OriginInLineDirection(simplex[0], simplex[1], simplex[2])
    );
} 

function ImproovedCollision(improoved1, improoved2) {
    let col = AABB(improoved1, improoved2);
    if (!col) {
        col = CollideConvex(improoved1, improoved2);
    }
    return col;
}

function Collision(type, collided, shape1Type, shape2Type, time) {
    this.type = type;
    this.collided = collided;
    this.shape1 = shape1Type;
    this.shape2 = shape2Type;
    this.time = time;
}

function shapeCollider(shape1, shape2, ctx) {
    let collisions = [];
    if (shape1.type === "rect" && shape2.type === "rect") {
        let time = performance.now();
        let collided = AABB(shape1, shape2);
        collisions.push(new Collision("AABB", collided, shape1.type, shape2.type, performance.now() - time));
    } 
    if (shape1.type === "circle" && shape2.type === "circle") {
        let time = performance.now();
        let collided = CircleCircle(shape1, shape2);
        collisions.push(new Collision("CircleCircle", collided, shape1.type, shape2.type, performance.now() - time));
    } 
    let time = performance.now();
    let collided = CollideConvex(shape1, shape2, ctx);
    collisions.push(new Collision("Convex", collided, shape1.type, shape2.type, performance.now() - time));
    return collisions;
}