const factionID = {neutral:0, player:1, enemy:2};

const factionColours = ["#000000","#00ffb3","#ff0000"];

class Faction {
    constructor(inColour, inWidth, inHeight) {
        this.name = "robots";
        this.agentColour = inColour;
        this.structureColour = "#FF7775";
        this.storage = new Storage();

        this.vision = new VisionMap(inWidth, inHeight);

        this.isAlive = true;
    }

    

    
}

class Storage {
    constructor() {
        this.essence = 0;
        this.concrete = 0;
        this.metal = 0;
        this.fuel = 0;

        this.maxQuantity = 999;
    }
}

class VisionMap {
    constructor(inWidth, inHeight) {
        this.width = inWidth;
        this.height = inHeight;

        this.map = [];
        for (let i=0; i<this.width; i++) {
            this.map[i] = [];
            for (let j=0; j<this.height; j++) {
                this.map[i][j] = NONE;
            }
        }
    }

    updateRadius(x,y,range) {
        // TODO do properly
        for (let i=-range; i<=range; i++) {
            for (let j=-range; j<=range; j++) {
                let nx = x + i;
                let ny = y + j;
                if (this.isInBounds(nx,ny)) {
                    this.map[nx][ny] = 1; 
                    // TODO come up with enumenrations for vision map state
                }
            }
        }
    }

    isInBounds(x,y) {
        if (x>=0 && x<this.width && y>=0 && y<this.height) {
            return true;
        } else {
            return false;
        }
    }

}