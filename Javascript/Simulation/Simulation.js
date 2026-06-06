const tileID = {water:0, grass:1, concrete:2, road:3};

class Simulation {
    constructor() {
        this.timer = 0;

        this.width = 64;
        this.height = 64;
        this.terrain = [];
        this.generateTerrain();

        this.structure = [];

        this.hasMinimapChanged = true;
    }

    generateTerrain() {
        for (let i=0; i<this.width; i++) {
            this.terrain[i] = [];
            for (let j=0; j<this.height; j++) {

                let tile = new Tile();
                if (random(10)==0) {
                    tile.type = tileID.water;
                }
                this.terrain[i][j] = tile;
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

    changeTile(x,y,type) {
        this.terrain[x][y].type = type;
    }

    placeStructure(x,y,type) {
        let struc = new Structure(x,y,type);

        let t = this.terrain[x][y];
        if (t.hasStructure == false) {
            
            t.hasStructure = true;
            t.occupant = this.structure.length;

            this.structure.push(struc);
        }
    }

    update() {
        this.timer++;

        //this.hasMinimapChanged = false;
    }
}
class Tile {
    constructor() {
        this.type = tileID.grass;

        this.hasStructure = false;
        this.occupant = NONE;
    }
}