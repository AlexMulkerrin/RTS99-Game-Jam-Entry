class MainView {
    constructor(inSimulation, inControl) {
        this.targetSimulation = inSimulation;
        this.targetControl = inControl;

        this.c = document.createElement("canvas");
        this.ctx = this.c.getContext("2d");
        this.c.width = 320;
        this.c.height = 200;

        this.sqSize = 16;

        this.viewOffsetX = 0;
        this.viewOffsetY = this.sqSize;

        this.minimapOffsetX = this.sqSize*this.targetControl.camera.width;
        this.minimapOffsetY = this.sqSize;
        this.minimap = new Minimap(this.targetSimulation, 
            this.targetControl);

        this.tilesImage = new Image();
        this.tilesImage.src = "Resources/Images/Tiles.png";

        this.structuresImage = new Image();
        this.structuresImage.src = "Resources/Images/Structures.png";

        this.cursorsImage = new Image();
        this.cursorsImage.src = "Resources/Images/Cursors.png";
    }

    refresh() {
        this.ctx.fillStyle = "#eeeeff";
        this.ctx.fillRect(0,0,this.c.width, this.c.height);

        this.drawTerrain();
        this.drawStructures(); 

        if (this.targetSimulation.hasMinimapChanged) {
            this.minimap.refresh();
        }
        this.drawMinimap(); 

        this.drawCursor();

        this.drawStructure(0,0,0);

    }

    drawTerrain() {
        let sim = this.targetSimulation;
        let ctrl = this.targetControl;

        for (let i=0; i<ctrl.camera.width; i++) {
            for (let j=0; j<ctrl.camera.height; j++) {
                let x = i*this.sqSize+this.viewOffsetX;
                let y = j*this.sqSize+this.viewOffsetY;

                let nx = i + ctrl.camera.x;
                let ny = j + ctrl.camera.y;
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

    drawStructures() {
        let sim = this.targetSimulation;
        let cam = this.targetControl.camera;

        for (let i=0; i<sim.structure.length; i++) {
            let s = sim.structure[i];

            let vx = s.x - cam.x;
            let vy = s.y - cam.y;

            if (cam.isInBounds(vx,vy)) {
                let x = vx*this.sqSize+this.viewOffsetX;
                let y = vy*this.sqSize+this.viewOffsetY;

                this.drawStructure(x,y,s.type);
            }
            
            //this.drawStructure(vx,vy,s.type);
        }
    }
    drawStructure(x,y,ID) {
        let sqSize = this.sqSize;

        let tx = ID;
        let ty = 0;
        
        this.ctx.drawImage(this.structuresImage, 
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

    drawCursor() {
        let m = this.targetControl.mouse;
        this.ctx.drawImage(this.cursorsImage,m.x,m.y);
    }
}