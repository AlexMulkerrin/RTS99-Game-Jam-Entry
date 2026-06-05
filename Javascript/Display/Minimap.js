const minimapColourID = {
    water:"#334EAF", grass:"#29991D",

    cameraBorder:"#ffffff",
}

class Minimap {
    constructor(inSimulation, inControl, inMainView) {
        this.targetSimulation = inSimulation;
        this.targetControl = inControl;
        this.targetMainView = inMainView;

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
                    default:
                        colour = "#ff00ff";
                }

                this.ctx.fillStyle = colour;
                this.ctx.fillRect(i,j,1,1);
            }
        }
        
    }

    drawCameraBoundaries() {
        let ctrl = this.targetControl;
        let x = ctrl.cameraX;
        let y = ctrl.cameraY;
        let w = this.targetMainView.viewWidth;
        let h = this.targetMainView.viewHeight;

        this.ctx.fillStyle = minimapColourID.cameraBorder;

        this.ctx.fillRect(x,y,w,1);
        this.ctx.fillRect(x,y,1,h);

        this.ctx.fillRect(x,y+h-1,w,1);
        this.ctx.fillRect(x+w-1,y,1,h);

    }
}