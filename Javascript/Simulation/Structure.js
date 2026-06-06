const structureID = {wall:0, barracks:1,silo:2};

const structureTypes = [
    {name:"wall",size:1,tileIndex:0},
    {name:"barracks",size:2,tileIndex:0},
    {name:"barracks",size:1,tileIndex:1},
]

class Structure {
    constructor(inX, inY, inType) {
        this.x = inX;
        this.y = inY;
        this.type = inType;
        this.size = structureTypes[this.type].size;

        this.tileIndex = structureTypes[this.type].tileIndex;
    }
}