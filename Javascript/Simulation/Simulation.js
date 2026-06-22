const gameStateID = {inGame:0, gameOver:1};
const winStateID = {undecided:0, playerWon:1, enemyWon:2, draw:3};

const tileID = {water:0, grass:1, concrete:2, road:3, dirt:4};

const itemID = {essence:0};

const itemTypes = [
    {name:"essence", bulk:1, minimapColour:"#FFC7FF"},
]

const WATER_RARITY = 20; // TODO use this in terrain generator
const ESSENCE_RARITY = 80;

const ENEMY_FORCE_SIZE = 1;
const PLAYER_FORCE_SIZE = 1;

class Simulation {
    constructor() {
        this.isDebugModeOn = true;

        this.timer = 0;
        this.gameState = gameStateID.inGame;
        this.hasFogOfWar = false;
        this.winState = winStateID.undecided;

        this.width = 64;
        this.height = 64;
        this.terrain = [];
        this.terrainGenerator = new TerrainGenerator(this.width, this.height);

        this.generateTerrain();
        this.generateItemDrops();

        this.structure = [];

        this.agent = [];
        this.projectile = [];

        this.numFactions = 2;
        this.faction = [];
        this.generateFactions();

        this.hasMinimapChanged = true;
    }

    generateTerrain() {

        let seed = random(100);
        this.terrain = this.terrainGenerator.generateFromSeed(seed);
        /*for (let i=0; i<this.width; i++) {
            this.terrain[i] = [];
            for (let j=0; j<this.height; j++) {

                let tile = new Tile();
                if (random(WATER_RARITY)==0) {
                    tile.type = tileID.water;
                }
                this.terrain[i][j] = tile;
            }
        }*/

        this.updateAllTileVariations();
    }
    isInBounds(x,y) {
        if (x>=0 && x<this.width && y>=0 && y<this.height) {
            return true;
        } else {
            return false;
        }
    }

    generateItemDrops() {
        for (let i=0; i<this.width; i++) {
            for (let j=0; j<this.height; j++) {
                if (random(ESSENCE_RARITY)==0 
                    && this.terrain[i][j].type != tileID.water) {
                    let item = new Item(itemID.essence, random(10)+1);
                    let t = this.terrain[i][j];
                    t.drops.push(item);
                }
            }
        }
    }

    generateFactions() {
        for (let i=0; i<this.numFactions+1; i++) {
            let colour = factionColours[i];
            let fac = new Faction(colour, this.width, this.height);
            this.faction.push(fac);

            if (i == factionID.player) {
                // player's faction
                fac.storage.essence = 50;
                fac.storage.concrete = 50;
                fac.storage.metal = 20;
                fac.storage.fuel = 10;
                this.generateAgents(i, PLAYER_FORCE_SIZE, "central");

            } else if (i == factionID.enemy) {
                this.generateAgents(i, ENEMY_FORCE_SIZE, "central");
            }
            
            
        }
    }

    generateAgents(faction, number, mode) {
        for (let i=0; i<number; i++) {
            let isPlaced = false;
            if (mode == "random") {
                while (isPlaced == false) {
                    let x = random(this.width);
                    let y = random(this.height);

                    isPlaced = this.tryAddAgent(x,y,agentID.MGunMech, faction, true);
                }
                
            } else if (mode == "central") {
                while (isPlaced == false) {
                    let span = Math.floor(this.width/4);
                    let offset = (Math.floor((this.width-span)/2));
                    let x = random(span)+offset;
                    let y = random(span)+offset;

                    isPlaced = this.tryAddAgent(x,y,agentID.MGunMech, faction);
                    if (this.isDebugModeOn) {
                        this.tryAddAgent(x+1,y,agentID.rocketMech, faction);
                        this.tryAddAgent(x+2,y,agentID.flamerMech, faction);

                        this.tryAddAgent(x,y+1,agentID.rover, faction);
                        this.tryAddAgent(x+1,y+1,agentID.transport, faction);
                        this.tryAddAgent(x+2,y+1,agentID.harvester, faction);

                        this.tryAddAgent(x,y+2,agentID.tank, faction);
                        this.tryAddAgent(x+1,y+2,agentID.artillery, faction);
                        this.tryAddAgent(x+2,y+2,agentID.antiAir, faction);
                        this.tryAddAgent(x+3,y+2,agentID.HvyTank, faction);

                    }
                }
            }
        }
    }

    changeTile(x,y,type) {
        this.terrain[x][y].type = type;
        this.updateTileVariations(x,y);
    }

    updateAllTileVariations() {
        for (let i=0; i<this.width; i++) {
            for (let j=0; j<this.height; j++) {
                let t = this.terrain[i][j];
                    t.tileVariation = 0;

                    if (t.type == tileID.road) {
                        this.calculateTileVariation(i,j,t.type,"4 adj");
                    } else if (t.type == tileID.grass ||
                               t.type == tileID.water) {
                        this.calculateTileVariation(i,j,t.type,"8 adj");
                    }
            }
        }
    }

    updateTileVariations(x,y) {
        let direc = [[0,0],[0,-1],[1,0],[0,1],[-1,0],
                     [1,-1],[-1,-1],[-1,1],[1,1]]; 
                     // try checking diagonals as well

        for (let e=0; e<direc.length; e++) {
                let nx = x + direc[e][0];
                let ny = y + direc[e][1];

                if (this.isInBounds(nx,ny)) {
                    
                    let t = this.terrain[nx][ny];
                    t.tileVariation = 0;

                    if (t.type == tileID.road) {
                        this.calculateTileVariation(nx,ny,t.type,"4 adj");
                    } else if (t.type == tileID.grass 
                            || t.type == tileID.water ) {
                        this.calculateTileVariation(nx,ny,t.type,"8 adj");
                    }
                }
        }
    }
    calculateTileVariation(x, y, type, mode) {
        let direc;

        if (mode == "4 adj"){
            direc = [[0,-1],[1,0],[0,1],[-1,0]];
        } else if (mode == "8 adj") {
            direc = [[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1]];
        }

        let adj = 0;
        for (let e=0; e<direc.length; e++) {
            let nx = x + direc[e][0];
            let ny = y + direc[e][1];

            if (this.isInBounds(nx,ny)) {
                let t = this.terrain[nx][ny];

                if (type == tileID.road && t.type == tileID.road) {
                    adj += Math.pow(2,e);

                } else if (type == tileID.grass) {
                    if (t.type == tileID.grass) {
                        adj += Math.pow(2,e);
                    }
                } else if (type == tileID.water) {
                    if (t.type == tileID.water) {
                        adj += Math.pow(2,e);
                    }
                }
            } else {
                // pretend continues off map borders
                adj += Math.pow(2,e);
            }
        }
        this.terrain[x][y].tileVariation = adj;
    }

    tryPlaceStructure(x,y,type,faction) {
        if (this.hasResources("structure",type,faction) != true) {
            return false;
        }

        let struc = new Structure(x,y,type,faction);

        let isValid = true;
        for (let i=0; i<struc.size; i++) {
            for (let j=0; j<struc.size; j++) {
                let nx = x + i;
                let ny = y + j;

                if (this.isInBounds(nx,ny)) {
                    let t = this.terrain[nx][ny];
                    if (t.hasStructure 
                        || t.hasAgent
                        || t.drops.length>0) {
                        isValid = false;
                    }
                } else {
                    isValid = false;
                }
            }
        }

        if (isValid) {

            let doesNotHaveConcrete = structureTypes[type].doesNotHaveConcrete;
            for (let i=0; i<struc.size; i++) {
                for (let j=0; j<struc.size; j++) {
                    let nx = x + i;
                    let ny = y + j;

                    let t = this.terrain[nx][ny];
                    t.hasStructure = true;
                    t.occupant = this.structure.length;

                    if (doesNotHaveConcrete) {
                        // no need to add concrete underneath
                        this.changeTile(nx,ny,tileID.dirt);
                    } else {
                        this.changeTile(nx,ny,tileID.concrete);
                    }
                }
            }
            // road connections 
            // TODO move this into a function that takes type into account
            /* Needs special road that only connects on one side, entrance tile?
            if (struc.size == 2) {
                this.changeTile(x,y+1,tileID.road);
            } else if (struc.size == 3) {
                this.changeTile(x+1,y+2,tileID.road);
            }
            */

            this.structure.push(struc);
            this.updateStructureVariations(struc.x,struc.y);

            this.deductResources("structure",type,faction);

            // if portal set as home location for that faction
            if (type == structureID.portal) {
                let fact = this.faction[faction];
                let strucIndex = this.structure.length-1;

                fact.homeBase = strucIndex;
            }
        }
    }

    hasResources(kind, type, factionIndex) {
        let cost;
        if (kind == "structure") {
            cost = structureTypes[type].cost;
        } else if (kind == "agent") {
            cost = agentTypes[type].cost;
        } else {
            return false;
        }

        let storage = this.faction[factionIndex].storage;
        if (cost.essence) {
            if (cost.essence > storage.essence) return false;
        }
        if (cost.concrete) {
            if (cost.concrete > storage.concrete) return false;
        }
         if (cost.metal) {
            if (cost.metal > storage.metal) return false;
        }
         if (cost.fuel) {
            if (cost.fuel > storage.fuel) return false;
        }
        return true;
    }

    deductResources(kind, type, factionIndex) {
        let cost;
        if (kind == "structure") {
            cost = structureTypes[type].cost;
        } else if (kind == "agent") {
            cost = agentTypes[type].cost;
        } else {
            return false;
        }

        let storage = this.faction[factionIndex].storage;
        if (cost.essence) {
            storage.essence -= cost.essence;
        }
        if (cost.concrete) {
            storage.concrete -= cost.concrete;
        }
         if (cost.metal) {
            storage.metal -= cost.metal;
        }
         if (cost.fuel) {
            storage.fuel -= cost.fuel;
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
            this.updateStructureVariations(x,y);
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

    updateStructureVariations(x,y) {
        let direc = [[0,0],[0,-1],[1,0],[0,1],[-1,0],
                     [1,-1],[-1,-1],[-1,1],[1,1]]; 
                     // try checking diagonals as well

        for (let e=0; e<direc.length; e++) {
                let nx = x + direc[e][0];
                let ny = y + direc[e][1];

                if (this.isInBounds(nx,ny)) {
                    
                    let t = this.terrain[nx][ny];
                    if (t.hasStructure) {
                        let struc = this.structure[t.occupant];
                    
                        if (struc.isAlive && struc.type == structureID.wall) {
                            this.calculateStructureVariation(struc,"4 adj");
                        } 
                    }
                }
        }
    }

    calculateStructureVariation(struc,mode) {
        let direc;

        if (mode == "4 adj"){
            direc = [[0,-1],[1,0],[0,1],[-1,0]];
        } else if (mode == "8 adj") {
            direc = [[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1]];
        }

        let adj = 0;
        for (let e=0; e<direc.length; e++) {
            let nx = struc.x + direc[e][0];
            let ny = struc.y + direc[e][1];

            if (this.isInBounds(nx,ny)) {
                let t = this.terrain[nx][ny];
                if (t.hasStructure) {
                    let ns = this.structure[t.occupant];

                    if (struc.type == structureID.wall 
                        && ns.isAlive && ns.type == structureID.wall) {
                        adj += Math.pow(2,e);
                    } 
                }
            } 
        }
        struc.tileVariation = adj;
    }

    checkForEmptySpace(x,y) {
        let t = this.terrain[x][y];
        if (t.hasStructure 
            || t.hasAgent 
            || t.type == tileID.water) {
            // can't place here
            return false;
        } else {
            return true;
        }
    }

    tryAddAgent(x,y,type,faction,isFree) {


        if (isFree == false && this.hasResources("agent",type,faction) != true) {
            return false;
        }

        let a = new Agent(x,y,type,faction);
        //a.state = stateID.movingToLocation;

        let t = this.terrain[x][y];
        if (this.checkForEmptySpace(x,y)) {
            t.hasAgent = true;
            t.occupant = this.agent.length;
            this.agent.push(a);

            if (isFree == false) {
                this.deductResources("agent",type,faction);
            }

            this.updateFactionVision(faction);

            return true
        } else {
            return false;
        }
    }

    sendMoveCommand(x,y,index) {
        let a = this.agent[index];

        a.targX = x;
        a.targY = y;
        a.state = stateID.movingToLocation;
    }

    sendAttackCommand(attackerIndex, targetIndex) {
        let a = this.agent[attackerIndex];

        a.state = stateID.attacking;
        a.targID = targetIndex;
    }

    sendDepositCommand(index) {
        let a = this.agent[index];
        let fact = this.faction[a.faction];

        if (fact.homeBase != NONE) {
            let home = this.structure[fact.homeBase];
            a.targX = home.x;
            a.targY = home.y;
            a.state = stateID.depositResources;
        }
    }

    update() {
        this.timer++;

        //if (this.timer%10 == 0) {
            this.updateAgents();
            this.updateProjectiles();

            this.updateFactions();
        //}
        //this.hasMinimapChanged = false;
    }
    updateAgents() {
        for (let i=0; i<this.agent.length; i++) {
            let a = this.agent[i];

            if (a.isAlive) {
                if (a.state == stateID.wander) {
                    this.handleAgentWander(i);
                } else if (a.state == stateID.movingToLocation) {
                    this.handleAgentMovingToLocation(i);
                } else if (a.state == stateID.attacking) {
                    this.handleAgentAttacking(i);
                } else if (a.state == stateID.depositResources) {
                    this.handleAgentDepositing(i);
                }
                
                if (a.cooldown>0) a.cooldown--;
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

    handleAgentMovingToLocation(i) {
        let a = this.agent[i];

        if (a.movementAnimation == 0) {
            a.newRotation = a.getDirectionToTarget();

            if (a.rotation != a.newRotation) {
                a.isTurning = true;
                a.movementAnimation = agentTypes[a.type].turnDelay;
                a.turningDirection = a.getTurnDirection();
            } else {
                let nx = a.x + direcDelta[a.rotation][0];
                let ny = a.y + direcDelta[a.rotation][1];

                if (this.isInBounds(nx,ny) 
                    && this.terrain[nx][ny].occupant == NONE
                    && this.terrain[nx][ny].type != tileID.water) {
                
                    a.newX = nx;
                    a.newY = ny;
                    // not sure if this is a good idea, 
                    // two tiles with the same occupant?
                    this.terrain[a.newX][a.newY].hasAgent = true; 
                    this.terrain[a.newX][a.newY].occupant = i;

                    if (a.isMovingDiagonal()) {
                        a.movementAnimation = 23;
                    } else {
                        a.movementAnimation = 16;
                    }
                } else {
                    // can't move there
                    a.state = stateID.idle;
                }

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
                } else {
                    this.handleAgentOnNewTile(i);

                    if (a.x == a.targX && a.y == a.targY) {
                        a.state = stateID.idle;
                    }
                }
            }

        }
    }

    handleAgentOnNewTile(index) {
        let a = this.agent[index];
        this.terrain[a.x][a.y].hasAgent = false;
        this.terrain[a.x][a.y].occupant = NONE;

        a.x = a.newX;
        a.y = a.newY;

        // check for item pickups
        let t = this.terrain[a.x][a.y];
        if (t.drops.length>0) {
            let emptySlot = a.findEmptySlot();

            if (emptySlot != NONE) {
                a.inventory[emptySlot] = t.drops.pop();
            }
        }

        this.updateFactionVision(a.faction);
    }

    handleAgentAttacking(index) {
        let a = this.agent[index];
        let targ = this.agent[a.targID];

        if (targ.isAlive) {
            a.targX = targ.x;
            a.targY = targ.y;

            if (a.movementAnimation == 0) {
                a.newRotation = a.getDirectionToTarget();

                if (a.rotation != a.newRotation) {
                    a.isTurning = true;
                    a.movementAnimation = agentTypes[a.type].turnDelay;
                    a.turningDirection = a.getTurnDirection();
                } else {
                    // pointing the right way
                    if (a.isInRange() && a.cooldown == 0) {
                        this.fireProjectile(index);
                    }
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
        } else {
            a.state = stateID.idle;
        }
    }

    handleAgentDepositing(index) {
        let a = this.agent[index];

        if (a.movementAnimation == 0) {
            a.newRotation = a.getDirectionToTarget();

            if (a.rotation != a.newRotation) {
                a.isTurning = true;
                a.movementAnimation = agentTypes[a.type].turnDelay;
                a.turningDirection = a.getTurnDirection();
            } else {
                let nx = a.x + direcDelta[a.rotation][0];
                let ny = a.y + direcDelta[a.rotation][1];

                
                if (this.isInBounds(nx,ny)) {
                    let homeIndex = this.faction[a.faction].homeBase;
                    if (this.terrain[nx][ny].occupant == homeIndex) {
                        this.handleDroppoff(index);
                    } else if ( this.terrain[nx][ny].occupant == NONE
                        && this.terrain[nx][ny].type != tileID.water) {
                
                        a.newX = nx;
                        a.newY = ny;
                        // not sure if this is a good idea, 
                        // two tiles with the same occupant?
                        this.terrain[a.newX][a.newY].hasAgent = true; 
                        this.terrain[a.newX][a.newY].occupant = index;

                        if (a.isMovingDiagonal()) {
                            a.movementAnimation = 23;
                        } else {
                            a.movementAnimation = 16;
                        }
                    } else {
                        // can't move here
                        a.state = stateID.idle;
                    }
                } else {
                    // can't move there
                    a.state = stateID.idle;
                }

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
                } else {
                    this.handleAgentOnNewTile(index);

                    if (a.x == a.targX && a.y == a.targY) {
                        a.state = stateID.idle;
                    }
                }
            }

        }

    }

    handleDroppoff(index) {
        let a = this.agent[index];
        let fact = this.faction[a.faction];
        let storage = fact.storage;

        for (let i=a.inventory.length-1; i>=0; i--) {
            let item = a.inventory[i];
            switch (item.type) {
                case itemID.essence:
                    let amount = item.quantity;
                    storage.essence += amount;
                    a.inventory.pop();
            }
        }
    }

    fireProjectile(index) {
        let a = this.agent[index];

        let dam = agentTypes[a.type].damage;
        let spd = agentTypes[a.type].projectileSpeed;

        let proj = new Projectile(
            dam, index, a.targID, a.x, a.y, 
            a.targX, a.targY, spd);

        a.cooldown = agentTypes[a.type].cooldown;
        // TODO track ammunition
        this.projectile.push(proj);
    }

    updateProjectiles() {
        for (let i=0; i<this.projectile.length; i++) {
            let p = this.projectile[i];

            if (p.isAlive) {
                p.traveledSoFar += p.speed;

                if (p.traveledSoFar >= p.distance) {
                    let t = this.terrain[p.endX][p.endY];

                    if (t.hasAgent && t.occupant == p.targID) {
                        this.dealDamage(p.damage, p.targID, p.firerID);
                    }

                    p.isAlive = false;
                }
            }
        }
    }

    dealDamage(damage, targID, firerID) {
        let targ = this.agent[targID];
        targ.health -= damage;
    
        if (targ.health <= 0) {
            this.killAgent(targ);
        } else {
            if (targ.state == stateID.idle) {
                this.sendAttackCommand(targID, firerID);
            }
        }
    }

    killAgent(a) {
        a.isAlive = false;
        let t = this.terrain[a.x][a.y];

        t.hasAgent = false;
        t.occupant = NONE;
    }

    updateFactionVision(index) {
        let fact = this.faction[index];
        for (let i=0; i<this.agent.length; i++) {
            let a = this.agent[i];

            if (a.isAlive && a.faction == index) {
                let range = agentTypes[a.type].vision;
                fact.vision.updateRadius(a.x,a.y,range);
                
            }
        }
    }

    updateFactions() {
        for (let i=0; i<this.faction.length; i++) {
            let fact = this.faction[i];

            if (fact.isAlive) {
                let isAlive = false;
                for (let j=0; j<this.agent.length; j++) {
                    let a = this.agent[j];

                    if (a.isAlive && a.faction == i) {
                        isAlive = true;
                        break;
                    }
                }
                if (isAlive == false) {
                    for (let j=0; j<this.structure.length; j++) {
                        let s = this.structure[j];

                        if (s.isAlive && s.faction == i) {
                            isAlive = true;
                            break;
                        }
                    }
                }

                if (isAlive == false) {
                    fact.isAlive = false;
                    this.checkForWin();
                }
            }
        }
    }

    checkForWin() {
        let winner = winStateID.undecided;
        let isOpponentALive = false;
        for (let i=0; i<this.faction.length; i++) {
            let fact = this.faction[i];

            if (i == factionID.player) {
                if  (fact.isAlive == false) {
                    winner = winStateID.enemyWon;
                }
            } else if (fact.isAlive) {
                isOpponentALive = true;
            }
        }
        if (isOpponentALive == false) {
            if (winner == winStateID.enemyWon) {
                winnder = winStateID.draw;
            } else {
                winner = winStateID.playerWon;
            }
        }
        if (winner != winStateID.undecided) {
            this.winState = winner;
            this.gameState = gameStateID.gameOver;
        }
    }

}

class Tile {
    constructor() {
        this.type = tileID.grass;
        this.tileVariation = 0;

        this.hasStructure = false;
        this.hasAgent = false;
        this.occupant = NONE;

        this.drops = [];
    }
}

class Item {
    constructor(inType, inQuantity) {
        this.type = inType;
        this.quantity = inQuantity;
    }
}

class Projectile {
    constructor(inDamage, inIndex, inTargetID, inStartX, inStartY, inEndX, inEndY, inSpeed) {
        this.damage = inDamage;

        this.firerID = inIndex;
        this.targID = inTargetID;

        this.startX = inStartX;
        this.startY = inStartY;

        this.endX = inEndX;
        this.endY = inEndY;

        this.speed = inSpeed;

        this.dx = this.endX - this.startX;
        this.dy = this.endY - this.startY;
        this.distance = Math.sqrt(this.dx*this.dx+this.dy*this.dy);
        this.traveledSoFar = 0;

        this.isAlive = true;
    }
}