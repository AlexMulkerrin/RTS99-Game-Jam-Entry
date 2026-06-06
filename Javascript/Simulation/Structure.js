const structureID = {wall:0};

const structureTypes = [
    {name:"wall",size:1},
]

class Structure {
    constructor(inX, inY, inType) {
        this.x = inX;
        this.y = inY;
        this.type = inType;
        this.size = structureTypes[this.type].size;
    }
}