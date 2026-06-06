const agentID = {robot:0};

agentTypes = [
    {name:"robot"},
];

class Agent {
    constructor(inX, inY, inType) {
        this.x = inX;
        this.y = inY;

        this.type = inType;

        this.isAlive = true;
    }
}