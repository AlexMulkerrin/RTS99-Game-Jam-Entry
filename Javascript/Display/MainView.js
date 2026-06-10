const colourID = {
    textDark:"#444499", borders:"#8FB1C9",

    button:"#FFD800", buttonLight:"#fff098", buttonShade:"#c1a402", buttonHighlight:"#fff5bb",

    hovered:"#d1d1fe", hoveredEnemy:"#ff0000", selected:"#00ff00",

    unexplored:"#000000",

    projectile:"#ffffff",
    healthBar:"#00ff00", healthBarEmpty:"#ff0000",
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

        this.itemsImage = new Image();
        this.itemsImage.src = "Resources/Images/Items.png";

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
        this.drawProjectiles();

        this.drawFogOfWar();

        this.drawBorders();
        this.drawButtons();
        this.drawResourceStats();
        this.drawSelectionStats();

        if (this.targetSimulation.hasMinimapChanged) {
            this.minimap.refresh();
        }
        this.drawMinimap(); 

        this.drawCursor();
    }

    drawTerrain() {
        let sim = this.targetSimulation;
        let cam = this.targetControl.camera;

        for (let i=0; i<cam.width; i++) {
            for (let j=0; j<cam.height; j++) {
                let x = i*this.sqSize+this.viewOffsetX;
                let y = j*this.sqSize+this.viewOffsetY;

                let nx = i + cam.x;
                let ny = j + cam.y;
                let t = sim.terrain[nx][ny];

                if (t.type == tileID.grass || t.type == tileID.water) {
                    this.drawTileQuarters(x, y, t.type, t.tileVariation);
                } else {
                    this.drawTile(x, y, t.type, t.tileVariation); 
                }

                if (t.drops.length != 0) {
                    this.drawDrops(x,y,t.drops);
                }

            }
        }
    }
    drawTileQuarters(x, y, type, variation) {
        // hooboy this is a complex function. Essentially I worked out which quarter tile to draw for each quarter depending on the adj variation value. Lots of hardcoded values which depend on the order of quarter tile images. Let's hope it works.
        let num,index,imageIndices;
        
        // choose top right quarter tile
        imageIndices = [1,4,1,2,5,6,3,0];
        num = variation & 0b00000111; //7
        index = imageIndices[num];
        this.drawQuaterTile(x,y,type,index,0);

        //choose bottom right quarter tile
        imageIndices = [1,5,1,3,4,6,2,0];
        num = (variation & 0b00011100)/4; //32
        index = imageIndices[num];
        this.drawQuaterTile(x,y,type,index,1);

        // choose bottom left quarter tile
        imageIndices = [1,4,1,2,5,6,3,0];
        num = (variation & 0b01110000)/16; //128
        index = imageIndices[num];
        this.drawQuaterTile(x,y,type,index,2);

        // choose top left quarter tile
        imageIndices = [1,5,1,3,4,6,2,0];
        num = (variation & 0b11000000)/64 + (variation % 2)*4; // 192
        index = imageIndices[num];
        this.drawQuaterTile(x,y,type,index,3);

    }
    drawQuaterTile(x, y, ID, index, quarterID) {
        let sqSize = this.sqSize;
        let quarterPos = [ [8,0], [8,8], [0,8], [0,0] ];

        let tx = index*(sqSize+1) + quarterPos[quarterID][0];
        let ty = ID*(sqSize+1) + quarterPos[quarterID][1];

        let qx = x + quarterPos[quarterID][0];
        let qy = y + quarterPos[quarterID][1];

        this.ctx.drawImage(this.tilesImage, 
            tx, ty, 8,8,
            qx, qy, 8,8);

    }

    drawTile(x, y, ID, variation) {
        let sqSize = this.sqSize;

        let tx = variation;
        let ty = ID;
        
        this.ctx.drawImage(this.tilesImage, 
            tx*(sqSize+1), ty*(sqSize+1), sqSize, sqSize,
            x, y, sqSize, sqSize);
    }

    drawDrops(x,y,drops) {
        for (let i=0; i<drops.length; i++) {
            let item = drops[i];
            this.drawItem(x,y,item.type);
        }
    }

    drawItem(x,y,ID) {
        let sqSize = this.sqSize;

        let tx = ID;
        let ty = 0;

        this.ctx.drawImage(this.itemsImage,
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

                let cx = vx + s.size - 1;

                if (cam.isSquareInBounds(vx,vy,s.size)) {
                    let x = vx*this.sqSize+this.viewOffsetX;
                    let y = vy*this.sqSize+this.viewOffsetY;

                    this.drawStructure(x,y,s.size,s.tileIndex, s.tileVariation);
                }   
            }
        }
    }
    drawStructure(x,y,size,ID, variation) {
        let sqSize = this.sqSize;

        let tx = variation;
        let ty = ID;
        
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

                    if (a.movementAnimation != 0 && a.isTurning == false) {
                        let progress = 16 - a.movementAnimation;
                        if (a.isMovingDiagonal()) {
                            progress = 16 - Math.floor(16*a.movementAnimation/23);
                        }

                        let dx = direcDelta[a.rotation][0]
                        let dy = direcDelta[a.rotation][1];

                        x += dx * progress;
                        y += dy * progress;
                    }

                    this.drawAgent(x,y,a.type, a.rotation);

                    this.drawAgentHealthBar(x,y,a);

                     // DEBUG
                    this.ctx.fillStyle = sim.faction[a.faction].agentColour;
                    this.ctx.fillRect(x,y,2,2);
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
    drawAgentHealthBar(x,y,a) {
        let span = this.sqSize-2;

        let current = a.health;
        let max = agentTypes[a.type].health;

        let fraction = current/max;
        let filled = Math.floor(span*fraction);

        this.ctx.fillStyle = colourID.healthBarEmpty;
        this.ctx.fillRect(x,y+1,span,1);
        this.ctx.fillStyle = colourID.healthBar;
        this.ctx.fillRect(x+1,y+1,filled,1);
    }

    drawProjectiles() {
        let sim = this.targetSimulation;
        let cam = this.targetControl.camera;

        let centeringOffset = Math.floor(this.sqSize/2);

        this.ctx.fillStyle = colourID.projectile;

        for (let i=0; i<sim.projectile.length; i++) {
            let p = sim.projectile[i];

            if (p.isAlive) {
                let progress = p.traveledSoFar/p.distance;
                let px = p.startX + p.dx*progress;
                let py = p.startY + p.dy*progress;

                let vx = px - cam.x;
                let vy = py - cam.y;

                if (cam.isInBounds(vx,vy)) {
                    let x = Math.floor(vx*this.sqSize) + this.viewOffsetX + centeringOffset;
                    let y = Math.floor(vy*this.sqSize) + this.viewOffsetY +  + centeringOffset;

                    this.ctx.fillRect(x,y,2,2);
                }
            }

        }
    }

    drawFogOfWar() {
        let sim = this.targetSimulation;

        if (sim.hasFogOfWar) {
            let cam = this.targetControl.camera;
            let fact = sim.faction[cam.viewingFaction];

            this.ctx.fillStyle = colourID.unexplored;
            // TODO make tiles for unexplored areas.

            for (let i=0; i<cam.width; i++) {
                for (let j=0; j<cam.height; j++) {
                    let x = i*this.sqSize+this.viewOffsetX;
                    let y = j*this.sqSize+this.viewOffsetY;

                    let nx = i + cam.x;
                    let ny = j + cam.y;
                    let vis = fact.vision.map[nx][ny];

                    if (vis == NONE) {
                        this.ctx.fillRect(x, y, this.sqSize, this.sqSize); 
                    }
                }
            }
        }
    }

    drawBorders() {
        this.ctx.fillStyle = colourID.borders;

        this.ctx.fillRect(0,0,this.c.width,this.sqSize);
        this.ctx.fillRect(this.c.width-64,0,64,this.c.height);
        this.ctx.fillRect(0,this.c.height-8,this.c.width, 8);
    }

    drawButtons() {
        let ctrl = this.targetControl;
        for (let i=0; i<ctrl.button.length; i++) {
            let b = ctrl.button[i];

            this.ctx.fillStyle = colourID.buttonShade;
            this.ctx.fillRect(b.x,b.y,b.width,b.height);

            this.ctx.fillStyle = colourID.buttonLight;
            this.ctx.fillRect(b.x,b.y,b.width-1,b.height-1);

            if (ctrl.mouse.hoveredButton == i) {
                this.ctx.fillStyle = colourID.buttonHighlight;
            } else {
                this.ctx.fillStyle = colourID.button;
            }
            this.ctx.fillRect(b.x+1, b.y+1, b.width-2, b.height-2);

            this.ctx.fillStyle = colourID.textDark;
            this.ctx.font = "bold 8px sans-serif";
            let out = b.text[0];
            this.ctx.fillText(out, b.x+5,b.y+10)
        }
    }

    drawResourceStats() {
        let sim = this.targetSimulation;
        let storage = sim.faction[factionID.player].storage;

        this.ctx.fillStyle = colourID.textDark;
        this.ctx.font = "bold 8px sans-serif";

        let out = "";
        out += "essence: "+storage.essence;
        out += " | concrete: "+storage.concrete;
        out += " | metal: "+storage.metal;
        out += " | fuel: "+storage.fuel;
        out += " | power load: 50%";

        this.ctx.fillText(out,4,11);

    }

    drawSelectionStats() {
        let sim = this.targetSimulation;
        let m = this.targetControl.mouse;

        this.ctx.fillStyle = colourID.textDark;
        this.ctx.font = "bold 8px sans-serif";

        let out = [];
        if (m.selectedType == entityTypeID.agent) {
            let a = sim.agent[m.selectedIndex];

            let stats = agentTypes[a.type];
            out.push(stats.name);

            for (let i=0; i<stats.invSlots; i++) {
                if (i<a.inventory.length) {
                    let item = a.inventory[i];
                    out.push(itemTypes[item.type].name+"x"+item.quantity);
                } else {
                    out.push("-");
                }
            }

        } else if (m.selectedType == entityTypeID.structure) {
            let s = sim.structure[m.selectedIndex];
            let stats = structureTypes[s.type];
            out.push(stats.name);

            for (let i=0; i<stats.invSlots; i++) {
                if (i<s.inventory.length) {
                    let item = s.inventory[i];
                    out.push(itemTypes[item.type].name+"x"+item.quantity);
                } else {
                    out.push("-");
                }
            }
        }

        let y = 90;
        for (let i=0; i<out.length; i++) {
            this.ctx.fillText(out[i],260,y+i*10);
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
        let sim = this.targetSimulation;
        let m = this.targetControl.mouse;
        this.ctx.drawImage(this.cursorsImage,m.x,m.y);

        
        if (m.hoveredType == entityTypeID.structure) {
            let s = sim.structure[m.hoveredIndex];
            this.drawBoundingBox(s.x,s.y,s.size,colourID.hovered);

        } else if (m.hoveredType == entityTypeID.agent) {
            let a = sim.agent[m.hoveredIndex];

            if (m.hoveredIsEnemy) {
                this.drawBoundingBox(a.x,a.y,1,colourID.hoveredEnemy);
            } else {
                this.drawBoundingBox(a.x,a.y,1,colourID.hovered);
            }
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