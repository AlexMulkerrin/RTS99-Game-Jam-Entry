const colourID = {
    hovered:"#d1d1fe", selected:"#00ff00"
};

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

        this.agentsImage = new Image();
        this.agentsImage.src = "Resources/Images/Agents.png";

        this.cursorsImage = new Image();
        this.cursorsImage.src = "Resources/Images/Cursors.png";
    }

    refresh() {
        this.ctx.fillStyle = "#eeeeff";
        this.ctx.fillRect(0,0,this.c.width, this.c.height);

        this.drawTerrain();
        this.drawStructures(); 
        this.drawAgents();

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
                this.drawTile(x, y, t.type, t.tileVariation); 


            }
        }
    }
    drawTile(x, y, ID, variation) {
        let sqSize = this.sqSize;

        let tx = variation;
        let ty = ID;
        
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

    drawAgents() {
        let sim = this.targetSimulation;
        let cam = this.targetControl.camera;

        for (let i=0; i<sim.agent.length; i++) {
            let a = sim.agent[i];

            if (a.isAlive) {

                let vx = a.x - cam.x;
                let vy = a.y - cam.y;

                if (cam.isInBounds(vx,vy)) {
                    let x = vx*this.sqSize + this.viewOffsetX;
                    let y = vy*this.sqSize + this.viewOffsetY;

                    this.drawAgent(x,y,a.type, a.rotation);
                }   
            }
        }
    }
    drawAgent(x,y,type,rotation) {
        let sqSize = this.sqSize;

        let tx = rotation;
        let ty = type;
        
        this.ctx.drawImage(this.agentsImage, 
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
        let sim = this.targetSimulation;
        let m = this.targetControl.mouse;
        this.ctx.drawImage(this.cursorsImage,m.x,m.y);

        
        if (m.hoveredType == entityTypeID.structure) {
            let s = sim.structure[m.hoveredIndex];
            this.drawBoundingBox(s.x,s.y,s.size,colourID.hovered);

        } else if (m.hoveredType == entityTypeID.agent) {
            let a = sim.agent[m.hoveredIndex];
            this.drawBoundingBox(a.x,a.y,1,colourID.hovered);
        }

        if (m.selectedType == entityTypeID.structure) {
            let s = sim.structure[m.selectedIndex];
            this.drawBoundingBox(s.x,s.y,s.size,colourID.selected);

        } else if (m.selectedType == entityTypeID.agent) {
            let a = sim.agent[m.selectedIndex];
            this.drawBoundingBox(a.x,a.y,1,colourID.selected);
        }
    }

    drawBoundingBox(x,y,size,colour) {
        let cam = this.targetControl.camera;
        let vx = x - cam.x;
        let vy = y - cam.y;

        let nx = vx*this.sqSize + this.viewOffsetX;
        let ny = vy*this.sqSize + this.viewOffsetY;
        let w = size*this.sqSize;
        let h = size*this.sqSize;

        this.ctx.fillStyle = colour

        this.ctx.fillRect(nx,ny,w,1);
        this.ctx.fillRect(nx,ny,1,h);

        this.ctx.fillRect(nx,ny+h-1,w,1);
        this.ctx.fillRect(nx+w-1,ny,1,h);
    }
}