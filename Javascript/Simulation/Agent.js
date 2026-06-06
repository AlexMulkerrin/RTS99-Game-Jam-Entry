const rotationID = { right:0, rightDown:1, down:2, leftDown:3, left:4,
                     leftUp:5, up:6, rightUp:7};
const direcDelta =[ [1,0],[1,1],[0,1],[-1,1],
				    [-1,0],[-1,-1],[0,-1],[1,-1]];

const stateID = {idle:0, wander:1}

const agentID = {robot:0, rover:1};

agentTypes = [
    {name:"robot", turnDelay:10},
    {name:"rover", turnDelay:30},
];

class Agent {
    constructor(inX, inY, inType) {
        this.x = inX;
        this.y = inY;
        this.rotation = rotationID.right;

        this.type = inType;
        this.isAlive = true;
        this.state = stateID.idle;

        this.movementAnimation = 0;
        this.newX = 0;
        this.newY = 0;
        this.newRotation = rotationID.right;
        this.isTurning = false;
    }

    getTurnDirection() {
        let start = this.rotation;
        let end = this.newRotation;

        let cwise, ccwise;

        if (end > start) {
            cwise = end -start;
            ccwise = start + 8 - end;
        } else {
            cwise = end + 8 - start;
            ccwise = start - end;
        }

        if (cwise < ccwise) {
            return 1;
        } else {
            return -1;
        }
    }

}