function vector(x, y, z = 0) {
    let vec = {
        x: x,
        y: y,
        z: z,

        add(a) {
            return vector(vec.x + a.x, vec.y + a.y);
        },

        sub(a) {
            return vector(vec.x - a.x, vec.y - a.y);
        },

        inv() {
            return vector(-vec.x, -vec.y);
        },

        mul(a) {
            return vector(vec.x * a, vec.y * a);
        },

        div(a) {
            return vector(vec.x / a, vec.y / a);
        },

        length() {
            return Math.sqrt(vec.x * vec.x + vec.y * vec.y);
        },

        rotate(angle) {
            angle += vec.angle();
            return vector(
                vec.length() * Math.cos(angle),
                vec.length() * Math.sin(angle)
            );
        },

        angle() {
            let angle = Math.atan(vec.y / vec.x);
            if (x < 0) {
                if (y < 0) {
                    angle -= Math.PI;
                } else {
                    angle += Math.PI;
                }
            }
            return angle;
        },

        dot(v) {
            return vec.x * v.x + vec.y * v.y;
        },

        perpendicular() {
            return vector(-vec.y, vec.x);
        },

        cross (v) {
            return vector(
                vec.y * v.z - vec.z * v.y,
                vec.z * v.x - vec.x * v.z,
                vec.x * v.y - vec.y * v.x
            );
        },

        perpendicularInDirection(direction) {
            let cross = vec.cross(direction);
            let normCross = vector(0, 0, Math.sign(cross.z));
            let res = normCross.cross(vec);
            return res;
        },

        norm () {
            return vec.div(vec.length());
        },
    }
    return vec;
}

function shape(canvas, ctx, mouse) {
    let shapeObj = {};
    shapeObj.vercities = [];
    shapeObj.pos = vector(0, 0);
    shapeObj.type = "none";
    shapeObj.color = "gray";

    shapeObj.draw = (ctx) => {
        let path = new Path2D();
        let point = shapeObj.vercities[0].add(shapeObj.pos);
        path.moveTo(point.x, point.y);
        for (let index = 1; index < shapeObj.vercities.length; index++) {
            point = shapeObj.vercities[index].add(shapeObj.pos);
            path.lineTo(point.x, point.y);
        }
        path.closePath();
        ctx.fillStyle = shapeObj.color;
        ctx.fill(path);
    };

    shapeObj.cordInside = (ctx, pos) => {
        let path = new Path2D();
        let point = shapeObj.vercities[0].add(shapeObj.pos);
        path.moveTo(point.x, point.y);
        for (let index = 1; index < shapeObj.vercities.length; index++) {
            point = shapeObj.vercities[index].add(shapeObj.pos);
            path.lineTo(point.x, point.y);
        }
        path.closePath();
        return ctx.isPointInPath(path, pos.x, pos.y);
    };

    shapeObj.applyDrag = (ctx, mouse) => {
        if (mouse.isDown && shapeObj.cordInside(ctx, mouse.recentPos)) {
            shapeObj.pos = shapeObj.pos.add(mouse.velocity);
            return true;
        }
        return false;
    }

    return shapeObj;
}

function rectShape(canvas, ctx, mouse, pos, size) {
    let rect = shape(canvas, ctx, mouse);
    rect.pos = pos;
    rect.size = size;
    rect.type = "rect";
    rect.func = (vec) => {
        vec = vec.norm();
        let angle = vec.angle();
        if (angle <= -Math.PI / 2) {
            return vector(-size.x / 2, -size.y / 2);
        } else if (angle < 0) {
            return vector(size.x / 2, -size.y / 2);
        } else if (angle <= Math.PI / 2) {
            return vector(size.x / 2, size.y / 2);
        } else {
            return vector(-size.x / 2, size.y / 2);
        }
    };

    rect.vercities.push(vector(-size.x / 2, -size.y / 2));
    rect.vercities.push(vector(-size.x / 2, size.y / 2));
    rect.vercities.push(vector(size.x / 2, size.y / 2));
    rect.vercities.push(vector(size.x / 2, -size.y / 2));

    return rect;
}

function circleShape(canvas, ctx, mouse, pos, radius) {
    let circle = shape(canvas, ctx, mouse);
    circle.pos = pos;
    circle.radius = radius;
    circle.type = "circle";
    circle.func = (vec) => { return vec.norm().mul(radius); }

    let count = 100;
    for (let n = 0; n < 100; n++) {
        circle.vercities.push(
            vector(
                radius * Math.cos(n * Math.PI * 2 / count),
                radius * Math.sin(n * Math.PI * 2 / count),
            )
        )
    }

    return circle;
}

function convexShape(canvas, ctx, mouse, pos, func) {
    let funcShape = shape(canvas, ctx, mouse);
    funcShape.pos = pos;
    funcShape.func = (vec) => func(vec.norm());
    funcShape.type = "convex";

    let count = 100;
    for (let n = 0; n < 100; n++) {
        let vec = vector(1,0).rotate(Math.PI * 2 / count * n);
        funcShape.vercities.push(func(vec));
    }

    return funcShape;
}

function improovedShape(canvas, ctx, mouse, pos, size) {
    let funcShape = shape(canvas, ctx, mouse);
    funcShape.pos = pos;
    funcShape.func = (vec) => {
        let angle = vec.angle();
        return vector(Math.cos(angle) * size.x / 2, Math.sin(angle) * size.y / 2);
    };
    funcShape.type = "convex";
    funcShape.size = size;

    let count = 100;
    for (let n = 0; n < 100; n++) {
        let vec = vector(1,0).rotate(Math.PI * 2 / count * n);
        funcShape.vercities.push(funcShape.func(vec));
    }

    return funcShape;
}