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

        this.smallStructuresImage = new Image();
        this.smallStructuresImage.src = "Resources/Images/Small Structures.png";

        this.mediumStructuresImage = new Image();
        this.mediumStructuresImage.src = "Resources/Images/Medium Structures.png";

        this.largeStructuresImage = new Image();
        this.largeStructuresImage.src = "Resources/Images/Large Structures.png";

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

            if (s.isAlive) {

                let vx = s.x - cam.x;
                let vy = s.y - cam.y;

                if (cam.isInBounds(vx,vy)) {
                    let x = vx*this.sqSize+this.viewOffsetX;
                    let y = vy*this.sqSize+this.viewOffsetY;

                    this.drawStructure(x,y,s.size,s.tileIndex);
                }   
            }
        }
    }
    drawStructure(x,y,size,index) {
        let sqSize = this.sqSize;

        let tx = index;
        let ty = 0;
        
        if (size == 1) {
            this.ctx.drawImage(this.smallStructuresImage, 
                tx*(sqSize+1), ty*(sqSize+1), sqSize, sqSize,
                x, y, sqSize, sqSize);
        } else if (size == 2) {
            sqSize = sqSize*2;
            this.ctx.drawImage(this.mediumStructuresImage, 
                tx*(sqSize+1), ty*(sqSize+1), sqSize, sqSize,
                x, y, sqSize, sqSize);
        } else if (size == 3) {
            sqSize = sqSize*3;
            this.ctx.drawImage(this.largeStructuresImage, 
                tx*(sqSize+1), ty*(sqSize+1), sqSize, sqSize,
                x, y, sqSize, sqSize);
        }
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