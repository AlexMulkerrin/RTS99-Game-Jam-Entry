class MainView {
    constructor(inSimulation, inControl) {
        this.targetSimulation = inSimulation;
        this.targetControl = inControl;

        this.c = document.createElement("canvas");
        this.ctx = this.c.getContext("2d");
        this.c.width = 320;
        this.c.height = 200;

        this.sqSize = 16;
        this.viewWidth = 16;
        this.viewHeight = 11;

        this.viewOffsetX = 0;
        this.viewOffsetY = this.sqSize;

        this.minimapOffsetX = this.sqSize*this.viewWidth;
        this.minimapOffsetY = this.sqSize;
        this.minimap = new Minimap(this.targetSimulation, 
            this.targetControl, this);

        this.tilesImage = new Image();
        this.tilesImage.src = "Resources/Images/Tiles.png";
    }

    refresh() {
        this.ctx.fillStyle = "#eeeeff";
        this.ctx.fillRect(0,0,this.c.width, this.c.height);

        this.drawTerrain(); 

        if (this.targetSimulation.hasMinimapChanged) {
            this.minimap.refresh();
        }
        this.drawMinimap(); 

    }

    drawTerrain() {
        let sim = this.targetSimulation;
        let ctrl = this.targetControl;

        for (let i=0; i<this.viewWidth; i++) {
            for (let j=0; j<this.viewHeight; j++) {
                let x = i*this.sqSize+this.viewOffsetX;
                let y = j*this.sqSize+this.viewOffsetY;

                let nx = i + ctrl.cameraX;
                let ny = j + ctrl.cameraY;
                let t = sim.terrain[nx][ny];
                this.drawTile(x,y,t.type); 


            }
        }
        
    }
    drawTile(x,y,ID) {
        let sqSize = this.sqSize;

        let tx = ID;
        let ty = 0;
        
        this.ctx.drawImage(this.tilesImage, 
            tx*(sqSize+1), ty*(sqSize+1), sqSize, sqSize,
            x, y, sqSize, sqSize);
    }

    drawMinimap() {
        let x = this.minimapOffsetX;
        let y = this.minimapOffsetY;
        this.ctx.drawImage(this.minimap.c,
            0,0,64,64,
            x,y, 64, 64);

    }
}