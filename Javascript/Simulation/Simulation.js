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

    tryPlaceStructure(x,y,type) {
        let struc = new Structure(x,y,type);

        let isValid = true;
        for (let i=0; i<struc.size; i++) {
            for (let j=0; j<struc.size; j++) {
                let nx = x + i;
                let ny = y + j;

                if (this.isInBounds(nx,ny)) {
                    let t = this.terrain[nx][ny];
                    if (t.hasStructure == true) {
                        isValid = false;
                    }
                } else {
                    isValid = false;
                }
            }
        }

        if (isValid) {
            for (let i=0; i<struc.size; i++) {
                for (let j=0; j<struc.size; j++) {
                    let nx = x + i;
                    let ny = y + j;

                    let t = this.terrain[nx][ny];
                    t.hasStructure = true;
                    t.occupant = this.structure.length;

                    t.type = tileID.concrete;
                }
            }
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