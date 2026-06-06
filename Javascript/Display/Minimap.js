const minimapColourID = {
    water:"#334EAF", grass:"#29991D", concrete:"#cccccc", road:"#434343",

    cameraBorder:"#ffffff",
}

class Minimap {
    constructor(inSimulation, inControl) {
        this.targetSimulation = inSimulation;
        this.targetControl = inControl;

        this.c = document.createElement("canvas");
        this.ctx = this.c.getContext("2d");
        this.c.width = 64;
        this.c.height = 64;
    }

    refresh() {
        this.drawTerrain();

        this.drawCameraBoundaries();
    }

    drawTerrain() {
        let sim = this.targetSimulation;

        for (let i=0; i<sim.width; i++) {
            for (let j=0; j<sim.height; j++) {
                let t = sim.terrain[i][j];

                let colour = "#ffff00";
                switch(t.type) {
                    case tileID.water:
                        colour = minimapColourID.water;
                        break;
                    case tileID.grass:
                        colour = minimapColourID.grass;
                        break;
                    case tileID.concrete:
                        colour = minimapColourID.concrete;
                        break;
                    case tileID.road:
                        colour = minimapColourID.road;
                        break;
                    default:
                        colour = "#ff00ff";
                }

                this.ctx.fillStyle = colour;
                this.ctx.fillRect(i,j,1,1);
            }
        }
        
    }

    drawCameraBoundaries() {
        let cam = this.targetControl.camera;
        let x = cam.x;
        let y = cam.y;
        let w = cam.width;
        let h = cam.height;

        this.ctx.fillStyle = minimapColourID.cameraBorder;

        this.ctx.fillRect(x,y,w,1);
        this.ctx.fillRect(x,y,1,h);

        this.ctx.fillRect(x,y+h-1,w,1);
        this.ctx.fillRect(x+w-1,y,1,h);

    }
}