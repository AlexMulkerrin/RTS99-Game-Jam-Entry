const mouseButtonID = {left:1, middle:2, right:3};

class Control {
    constructor(inSimulation) {
        this.targetSimulation = inSimulation;
        this.targetDisplay = {};

        this.mouse = new Mouse();

        this.camera = new Camera();
        this.camera.x = 5;
        this.camera.y = 15;

        let t = this;

        window.addEventListener("mousemove", function(e){t.handleMouseMove(e)});
        window.addEventListener("mousedown", function(e){t.handleMouseDown(e)});
        window.addEventListener("mouseup", function(e){t.handleMouseUp(e)});

        window.addEventListener("keydown", function(e){t.handleKeyDown(e)})
    }

    handleMouseMove(event) {
        let m = this.mouse;

        //let sim = this.targetSimulation;
        let disp = this.targetDisplay;
        let view = disp.mainView;
        let cam = this.camera;

        m.x = Math.floor(event.layerX/disp.scale);
        m.y = Math.floor(event.layerY/disp.scale);
        //let adjX = Math.floor(m.x/disp.scale);
        //let adjY = Math.floor(m.y/disp.scale);

        let gx = Math.floor((m.x - view.viewOffsetX) / view.sqSize);
        let gy = Math.floor((m.y - view.viewOffsetY) / view.sqSize);

        if (gx>=0 && gx<cam.width && gy>=0 
            && gy<cam.height) {
            m.isOverGrid = true;
            m.gridX = gx + cam.x;
            m.gridY = gy + cam.y;
        } else {
            m.isOverGrid = false;
        }

        

        m.miniX = m.x - view.minimapOffsetX;
        m.miniY = m.y - view.minimapOffsetY;

        if (m.miniX>=0 && m.miniX<64 && m.miniY>=0 && m.miniY<64) {
            m.isOverMinimap = true;
            
        } else {
            m.isOverMinimap = false;
        }

        if (m.isOverMinimap) {
            if (m.whichButton == mouseButtonID.left) {
                this.centerCamera(m.miniX,m.miniY);
            }
        }
    }
    handleMouseDown(event) {
        let m = this.mouse;

        m.whichButton = event.which;

        m.oldX = m.x;
        m.oldY = m.y;        

        if (m.whichButton == mouseButtonID.left && m.isOverMinimap) {
            this.centerCamera(m.miniX,m.miniY);
        }
    }
    handleMouseUp(event) {
        let sim = this.targetSimulation;
        let m = this.mouse;

        

        if (m.isOverGrid) {
            if (m.whichButton == mouseButtonID.left) {
                sim.changeTile(m.gridX, m.gridY, tileID.concrete);
            } else if (m.whichButton == mouseButtonID.left) {

            }
        }

        m.whichButton = NONE;
    }


    handleKeyDown(event) {
        let code = event.code;

        switch (code) {
            case "KeyA":
                this.moveCamera(-1,0);
                break;
            case "KeyD":
                this.moveCamera(1,0);
                break;
            case "KeyW":
                this.moveCamera(0,-1);
                break;
            case "KeyS":
                this.moveCamera(0,1);
                break;
            
        }
    }

    moveCamera(dx,dy) {
        let sim = this.targetSimulation;
        let cam = this.camera;

        let nx = cam.x + dx;
        let ny = cam.y + dy;
        if (sim.isInBounds(nx,ny) 
            && sim.isInBounds(nx+cam.width-1,ny+cam.height-1)) {
            
            cam.x = nx;
            cam.y = ny;
        }
    }

    centerCamera(x,y) {
        let sim = this.targetSimulation;
        let cam = this.camera;

        let hx = Math.floor(cam.width/2);
        let hy = Math.floor(cam.height/2);

        let nx = x - hx;
        let ny = y - hy;

        if (nx<0) nx = 0;
        if (nx+cam.width >= sim.width) nx = sim.width-cam.width;

        if (ny<0) ny = 0;
        if (ny+cam.height >= sim.height) ny = sim.height-cam.height;

        cam.x = nx;
        cam.y = ny;
    }

    panCamera() {
        let m = this.mouse;
        let cam = this.camera;

        let threshold = 16;
        let delay = 3;

        let dx = m.oldX - m.x;
        let dy = m.oldY - m.y;

        if (dx>threshold) {
            this.moveCamera(-1,0);
            cam.panDelay = delay;
        } else if (dx < -threshold) {
            this.moveCamera(1,0);
            cam.panDelay = delay;
        }

        if (dy>threshold) {
            this.moveCamera(0,-1);
            cam.panDelay = delay;
        } else if (dy < -threshold) {
            this.moveCamera(0,1);
            cam.panDelay = delay;
        }
    }

    update() {
        let m = this.mouse;
        let cam = this.camera;

        if (cam.panDelay>0) {
            cam.panDelay--;
        } else {
            if (m.isOverGrid) {
            if (m.whichButton == mouseButtonID.middle) {
                this.panCamera();
            }
        }
        }

        

    }
}

class Mouse {
    constructor() {
        this.x = -100;
        this.y = -100;
        this.whichButton = NONE;

        this.oldX = -100;
        this.oldY = -100;

        this.isOverGrid = false;
        this.gridX = 0;
        this.gridY = 0;

        this.isOverMinimap = false;
        this.miniX = 0;
        this.miniY = 0;
    }
}

class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.width = 16;
        this.height = 11;

        this.panDelay = 0;
    }
}