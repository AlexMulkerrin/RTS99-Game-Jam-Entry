const tileID = {water:0, grass:1, dirt:2};

class Simulation {
    constructor() {
        this.timer = 0;

        this.width = 64;
        this.height = 64;
        this.terrain = [];
        this.generateTerrain();

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

    update() {
        this.timer++;

        //this.hasMinimapChanged = false;
    }
}
class Tile {
    constructor() {
        this.type = tileID.grass;
    }
}