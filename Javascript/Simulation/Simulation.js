const tileID = {water:0, grass:1, concrete:2, road:3};

class Simulation {
    constructor() {
        this.timer = 0;

        this.width = 64;
        this.height = 64;
        this.terrain = [];
        this.generateTerrain();

        this.structure = [];

        this.agent = [];

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
                    if (t.hasStructure) {
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

    tryRemoveStructure(x,y) {
        
        let foundStructure = this.checkForStructure(x,y);

        if (foundStructure != NONE) {
            let struc = this.structure[foundStructure];

            for (let i=0; i<struc.size; i++) {
                for (let j=0; j<struc.size; j++) {
                    let nx = struc.x + i;
                    let ny = struc.y + j;

                    let t = this.terrain[nx][ny];
                    t.hasStructure = false;
                    t.occupant = NONE;

                    //t.type = tileID.ruin; do this?
                }
            }
            struc.isAlive = false;
        }
    }

    checkForStructure(x,y) {
        let max = MAX_STRUCTURE_SIZE;

        for (let i=0; i<max; i++) {
            for (let j=0; j<max; j++) {
                let nx = x + i;
                let ny = y + j;

                if (this.isInBounds(nx,ny)) {
                    let t = this.terrain[nx][ny];
                    if (t.hasStructure) {
                        return t.occupant;
                    }
                } 
            }
        }
        return NONE;
    }

    tryAddAgent(x,y,type) {
        let a = new Agent(x,y,type);
        a.state = stateID.wander;

        let t = this.terrain[x][y];
        if (t.hasStructure || t.hasAgent) {
            // can't place here
        } else {
            t.hasAgent = true;
            t.occupant = this.agent.length;
            this.agent.push(a);
        }
    }

    update() {
        this.timer++;

        //if (this.timer%10 == 0) {
            this.updateAgents();
        //}
        //this.hasMinimapChanged = false;
    }
    updateAgents() {
        for (let i=0; i<this.agent.length; i++) {
            let a = this.agent[i];

            if (a.isAlive) {
                if (a.state == stateID.wander) {
                    this.handleAgentWander(i);
                }
                //a.rotation++;
                //if (a.rotation>7) a.rotation = 0;
            }
        }
    }

    handleAgentWander(i) {
        let a = this.agent[i];

        if (a.movementAnimation == 0) { 
            if ( random(20) == 0) {
                let direc = random(direcDelta.length);

                a.newRotation = direc;

                if (a.rotation != a.newRotation) {
                    a.isTurning = true;
                    a.movementAnimation = agentTypes[a.type].turnDelay;
                    a.turningDirection = a.getTurnDirection();
                }
                // todo add movement in direction
            }
        } else {
            a.movementAnimation--;

            if (a.movementAnimation == 0) {
                if (a.isTurning) {
                    if (a.rotation == a.newRotation) {
                        a.isTurning = false;
                    } else {
                        a.rotation = (a.rotation + a.turningDirection) % 8;
                        if (a.rotation < 0) a.rotation += 8;
                        a.movementAnimation = agentTypes[a.type].turnDelay;
                    }
                }
            }
        }

    }
}

class Tile {
    constructor() {
        this.type = tileID.grass;

        this.hasStructure = false;
        this.hasAgent = false;
        this.occupant = NONE;
    }
}