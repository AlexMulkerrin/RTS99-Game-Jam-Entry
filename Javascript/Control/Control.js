class Control {
    constructor(inSimulation) {
        this.targetSimulation = inSimulation;

        this.camera = new Camera();
        this.camera.x = 5;
        this.camera.y = 15;

        let t = this;

        window.addEventListener("keydown", function(e){t.handleKeyDown(e)})
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
}

class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.width = 16;
        this.height = 11;
    }
}