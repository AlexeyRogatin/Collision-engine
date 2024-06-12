let canvas = document.getElementById("canvas");
canvas.width = 1920;
canvas.height = 1080;
canvas.style.clientWidth = window.innerWidth;
canvas.style.clientHeight = window.innerHeight;
let ctx = canvas.getContext("2d");

const MENU_STATE_CHOOSE = 1;
const MENU_STATE_SINGLE_OBJECT = 2;
const MENU_STATE_MANY_OBJECTS = 3;
const MENU_STATE_IMPROOVED_OBJECTS = 4;

//переменная, хранящая все глобальные переменные
let state = {
    formState: MENU_STATE_CHOOSE,
    mouse: makeMouse(canvas),
    shapes: [],
    methodCollisions: {
        AABB: {
            count: 0,
            avgTime: 0,
        },
        CircleCircle: {
            count: 0,
            avgTime: 0,
        },
        Convex: {
            count: 0,
            avgTime: 0,
        },
    },
    shapeCollisions: {
        rect: {
            count: 0,
            rect: 0,
            circle: 0,
            convex: 0,
        },
        circle: {
            count: 0,
            rect: 0,
            circle: 0,
            convex: 0,
        },
        convex: {
            count: 0,
            rect: 0,
            circle: 0,
            convex: 0,
        }
    },
    improovedCollisions: {
        Convex: {
            count: 0,
            avgTime: 0,
        },
        Improoved: {
            count: 0,
            avgTime: 0,
        },
    }
}

function makeLoopable(func) {
    return function loop() {
        func();
        requestAnimationFrame(loop);
    }
}

function drawButton(x, y, width, height, text, callback) {
    ctx.fillStyle = "blue";
    ctx.fillRect(x, y, width, height);

    ctx.font = "16px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(text, x + 10, y + 25);

    if (state.mouse.isDown && !state.mouse.prevDown) {
        const mouseX = state.mouse.pos.x;
        const mouseY = state.mouse.pos.y;

        if (mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height) {
            callback();
        }
    }
}

//loopMenu хранит начальные значения инициализации каждого состояния
function loopMenu() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawButton(50, 50, 150, 50, "Single Object", function() {
        state.formState = MENU_STATE_SINGLE_OBJECT;
        state.shapes = [];
        state.shapes.push(
            rectShape(canvas, ctx, state.mouse, vector(100, 100), vector(50, 50)),
            rectShape(canvas, ctx, state.mouse, vector(200, 100), vector(50, 50)),
            circleShape(canvas, ctx, state.mouse, vector(100, 200), 25),
            circleShape(canvas, ctx, state.mouse, vector(200, 200), 25),
            convexShape(canvas, ctx, state.mouse, vector(100, 300), (vec) => vec.mul(25 + Math.cos(vec.y * 2) * 10)),
            convexShape(canvas, ctx, state.mouse, vector(200, 300), (vec) => vec.mul(25 + Math.cos(vec.x * 2) * 10))
        )
    });

    drawButton(50, 150, 150, 50, "Many Objects", function() {
        state.formState = MENU_STATE_MANY_OBJECTS;
        state.shapes = [];
        for (let index = 0; index < 200; index++) {
            let shape = rectShape(canvas, ctx, state.mouse, vector(700, 400), vector(Math.random(), Math.random()));
            state.shapes.push(shape);
        }
        for (let index = 0; index < 200; index++) {
            let shape = circleShape(canvas, ctx, state.mouse, vector(700, 400), Math.random());
            state.shapes.push(shape);
        }
        for (let index = 0; index < 200; index++) {
            let random1 = Math.random();
            let random2 = Math.random();
            let random3 = Math.random();
            let shape = convexShape(canvas, ctx, state.mouse, vector(700, 400), (vector) => vector.mul(random1 * Math.sin(vector.mul(random2).length())* Math.cos(vector.mul(random3).length())));
            state.shapes.push(shape);
        }
    });

    drawButton(50, 250, 150, 50, "Improoved Objects", function() {
        state.formState = MENU_STATE_IMPROOVED_OBJECTS;
        state.shapes = [];
        for (let index = 0; index < 20; index++) {
            let random1 = Math.random();
            let random2 = Math.random();
            let shape = improovedShape(canvas, ctx, state.mouse, vector(700, 400), vector(random1, random2));
            state.shapes.push(shape);
        }
    });
}

function loopObjectDemo() {
    //очистка цвета всех фигур
    for (let shape of state.shapes) {
        shape.color = "gray";
    }

    //обработка перемещения фигур
    for (let shape of state.shapes) {
        if (shape.applyDrag(ctx, state.mouse)) {
            break;
        }
    }

    //столкновение всех фигур каждая с каждой
    for (let index1 = 0; index1 < state.shapes.length - 1; index1++) {
        for (let index2 = index1 + 1; index2 < state.shapes.length; index2++) {
            let shape1 = state.shapes[index1];
            let shape2 = state.shapes[index2];
            let collisions = shapeCollider(shape1, shape2, ctx);
            if (collisions.every(col => col.collided)) {
                shape1.color = "yellow";
                shape2.color = "yellow";
            }
            
            //пересчёт характеристик
            for (let collision of collisions) {
                let method = state.methodCollisions[collision.type];
                method.avgTime = (collision.time + method.avgTime * method.count) / (method.count + 1);
                method.count ++;
                state.shapeCollisions[shape1.type][shape2.type] = (collision.time + state.shapeCollisions[shape1.type][shape2.type] * state.shapeCollisions[shape1.type].count) / (state.shapeCollisions[shape1.type].count + 1);
            }
            state.shapeCollisions[shape1.type].count ++;
        }
    }

    console.log(state.methodCollisions, state.shapeCollisions);

    //прорисовка всех фигур
    for (let shape of state.shapes) {
        shape.draw(ctx);
    }
}

function loopManyObjects() {
    //очистка цвета всех фигур
    for (let shape of state.shapes) {
        shape.color = "gray";
    }

    //обработка перемещения фигур
    for (let shape of state.shapes) {
        shape.pos.x += (Math.random() * 2 - 1);
        shape.pos.y += (Math.random() * 2 - 1);
        if (shape.pos.x < 650) {
            shape.pos.x = 650;
        }
        if (shape.pos.y < 350) {
            shape.pos.y = 350;
        }
        if (shape.pos.x > 750) {
            shape.pos.x = 750;
        }
        if (shape.pos.y > 450) {
            shape.pos.y = 450;
        }
    }

    //столкновение всех фигур каждая с каждой
    for (let index1 = 0; index1 < state.shapes.length - 1; index1++) {
        for (let index2 = index1 + 1; index2 < state.shapes.length; index2++) {
            if (index1 !== index2) {
                let shape1 = state.shapes[index1];
                let shape2 = state.shapes[index2];
                let collisions = shapeCollider(shape1, shape2, ctx);
                if (collisions.every(col => col.collided)) {
                    shape1.color = "yellow";
                    shape2.color = "yellow";
                }
                
                //пересчёт характеристик
                for (let collision of collisions) {
                    let method = state.methodCollisions[collision.type];
                    method.avgTime = (collision.time + method.avgTime * method.count) / (method.count + 1);
                    method.count ++;
                    state.shapeCollisions[shape1.type][shape2.type] = (collision.time + state.shapeCollisions[shape1.type][shape2.type] * state.shapeCollisions[shape1.type].count) / (state.shapeCollisions[shape1.type].count + 1);
                }
                state.shapeCollisions[shape1.type].count ++;
            }
        }
    }

    //прорисовка всех фигур
    for (let shape of state.shapes) {
        shape.draw(ctx);
    }
    console.log(state.methodCollisions, state.shapeCollisions);
}

function loopImproovedObjects() {
    //очистка цвета всех фигур
    for (let shape of state.shapes) {
        shape.color = "gray";
    }

    //обработка перемещения фигур
    for (let shape of state.shapes) {
        shape.pos.x += (Math.random() * 2 - 1);
        shape.pos.y += (Math.random() * 2 - 1);
        if (shape.pos.x < 650) {
            shape.pos.x = 650;
        }
        if (shape.pos.y < 350) {
            shape.pos.y = 350;
        }
        if (shape.pos.x > 750) {
            shape.pos.x = 750;
        }
        if (shape.pos.y > 450) {
            shape.pos.y = 450;
        }
    }

    //столкновение всех фигур каждая с каждой
    for (let index1 = 0; index1 < state.shapes.length - 1; index1++) {
        for (let index2 = index1 + 1; index2 < state.shapes.length; index2++) {
            if (index1 !== index2) {
                let convexTime = performance.now();
                let convex = CollideConvex(state.shapes[index1], state.shapes[index2]);
                convexTime = performance.now() - convexTime;
                let improovedTime = performance.now();
                let improoved = ImproovedCollision(state.shapes[index1], state.shapes[index2]);
                improovedTime = performance.now() - improovedTime;

                if (improoved) {
                    state.shapes[index1].color = "yellow";
                    state.shapes[index2].color = "yellow";
                }

                state.improovedCollisions.Improoved.avgTime = (state.improovedCollisions.Improoved.avgTime * state.improovedCollisions.Improoved.count
                    + improovedTime) / (state.improovedCollisions.Improoved.count + 1);
                state.improovedCollisions.Convex.avgTime = (state.improovedCollisions.Convex.avgTime * state.improovedCollisions.Convex.count
                    + convexTime) / (state.improovedCollisions.Convex.count + 1);
                state.improovedCollisions.Improoved.count++;
                state.improovedCollisions.Convex.count++;
            }
        }
    }

    //прорисовка всех фигур
    for (let shape of state.shapes) {
        shape.draw(ctx);
    }
    console.log(state.improovedCollisions);
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    switch (state.formState) {
        case MENU_STATE_CHOOSE: {
            loopMenu();
        } break;
        case MENU_STATE_SINGLE_OBJECT: {
            loopObjectDemo();
        } break;
        case MENU_STATE_MANY_OBJECTS: {
            loopManyObjects();
        } break;
        case MENU_STATE_IMPROOVED_OBJECTS: {
            loopImproovedObjects();
        } break;
    }

    state.mouse.draw(ctx);
}

loop = state.mouse.makeMouseUpdateable(loop);
loop = makeLoopable(loop);

requestAnimationFrame(loop);