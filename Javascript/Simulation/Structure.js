const MAX_STRUCTURE_SIZE = 3;

const structureID = {wall:0, barracks:1,silo:2,portal:3};

const structureTypes = [
    {name:"wall",size:1,tileIndex:0},
    {name:"barracks",size:2,tileIndex:0},
    {name:"silo",size:1,tileIndex:1},
    {name:"portal",size:3,tileIndex:0},
];

class Structure {
    constructor(inX, inY, inType) {
        this.x = inX;
        this.y = inY;
        this.type = inType;
        this.size = structureTypes[this.type].size;

        this.isAlive = true;

        this.tileIndex = structureTypes[this.type].tileIndex;
        this.tileVariation = 0;
    }
}