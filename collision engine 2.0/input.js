function makeMouse(canvas) {
    let mouse = {
        pos: vector(0, 0),
        firstPos: vector(0, 0),
        velocity: vector(0, 0),
        isDown: false,
        wentDown: false,
        wentUp: false,
        recentPos: vector(0, 0),

        makeMouseUpdateable(func) {
            return () => {
                mouse.velocity = mouse.pos.sub(this.recentPos);
                func();
                mouse.wentDown = false;
                mouse.wentUp = false;
                this.recentPos = mouse.pos;
            }
        },

        draw(ctx, idleColor = "red", pressedColor = "green") {
            let color = idleColor;
            if (mouse.isDown) {
                color = pressedColor;
            }
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(mouse.pos.x, mouse.pos.y, 15, 0, 2 * Math.PI);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
        
    }

    let rect = canvas.getBoundingClientRect();
    
    canvas.addEventListener("mousemove",(e) => {
        let newPos = vector(e.clientX - rect.left, e.clientY - rect.top);
        mouse.velocity = newPos.sub(mouse.pos);
        mouse.pos = newPos;
    });

    canvas.addEventListener("mousedown",(e) => {
        if (!mouse.isDown) {
            mouse.wentDown = true;
            mouse.isDown = true;
            mouse.firstPos = vector(e.clientX - rect.left, e.clientY - rect.top);
        }
    });

    canvas.addEventListener("mouseup", () => {
        if (mouse.isDown) {
            mouse.wentUp = true;
            mouse.isDown = false;
        }
    });
    
    return mouse;
}

