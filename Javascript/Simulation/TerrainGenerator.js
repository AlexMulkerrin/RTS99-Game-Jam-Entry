
class TerrainGenerator {
    constructor(inWidth, inHeight) {
        this.width = inWidth;
        this.height = inHeight;

        this.totalDesiredTile = 0;
        this.tileRatio = 0.1;
        this.border = 0;

        this.terrain = [];
        for (let i=0; i<this.width; i++) {
            this.terrain[i] = [];
            for (let j=0; j<this.height; j++) {

                this.terrain[i][j] = new Tile();
            }
        }
    }

    generateFromSeed(inSeed) {
        this.random = new PseudorandomGenerator(inSeed);

        this.clearTerrain(tileID.grass);
        this.generateDesiredTerrain(tileID.water) 

        return this.terrain;
        
    }

    clearTerrain(inType) {

        this.terrain = [];
        for (let i=0; i<this.width; i++) {
            this.terrain[i] = [];
            for (let j=0; j<this.height; j++) {

                this.terrain[i][j] = new Tile();
                this.terrain[i][j].type = inType
            }
        }
    }

    generateDesiredTerrain(inType) {
        let spanX = this.width - 2 * this.border;
        let spanY = this.height - 2 * this.border;

        let stamp = [[0,0],[1,0],[0,1],[-1,0],[0,-1]];
        let adj = [[1,0],[0,1],[-1,0],[0,-1]];

        let target = (this.width-2*this.border)
                    *(this.height-2*this.border)
                    *this.tileRatio;

        while(this.totalDesiredTile < target) {
            let stencil = this.create2DArray(0);
            let sx = this.random.integer(spanX) + this.border;
            let sy = this.random.integer(spanY) + this.border;

            for (let i= this.random.integer(63)+1; i>0 && this.isInBorders(sx,sy); i--) {
                for (let e=0; e<stamp.length; e++) {
                    let nx = sx+stamp[e][0];
                    let ny = sy+stamp[e][1];
                    if (this.isInBorders(nx,ny)){
                        stencil[nx][ny] = 1;
                    }
                }
                let direc = this.random.integer(adj.length);
                sx += adj[direc][0];
                sy += adj[direc][1];
            }
            for (let i=0; i<this.width; i++) {
                for (let j=0; j<this.height; j++) {
                    if (stencil[i][j] == 1 && this.terrain[i][j].type != inType) {
                        this.terrain[i][j].type = inType;
                        this.totalDesiredTile++;
                    }
                }
            }
        }
    }

    create2DArray(value) {
        let result = [];
        for (let i=0; i<this.width; i++) {
            result[i] = [];
            for (let j=0; j<this.height; j++) {
                result[i][j] = value;
            }
        }
        return result;
    }

    isInBorders(x,y) {
        if (x>=this.border && x<(this.width-this.border) 
            && y>=this.border && y<(this.height-this.border)) {
            return true;
        } else {
            return false;
        }
    }

}