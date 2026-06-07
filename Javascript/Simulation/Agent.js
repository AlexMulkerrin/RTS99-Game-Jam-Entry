const rotationID = { right:0, rightDown:1, down:2, leftDown:3, left:4,
                     leftUp:5, up:6, rightUp:7};
const direcDelta =[ [1,0],[1,1],[0,1],[-1,1],
				    [-1,0],[-1,-1],[0,-1],[1,-1]];

const stateID = {idle:0, wander:1, movingToLocation:2}

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

        this.targX = this.x+3;
        this.targY = this.y;
        this.newX = this.x;
        this.newY = this.y;

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

    getDirectionToTarget() {
        // TODO
        return rotationID.right;
    }

    isMovingDiagonal() {
        if (   this.rotation == rotationID.rightDown
            || this.rotation == rotationID.leftDown
		    || this.rotation == rotationID.leftUp 
            || this.rotation == rotationID.rightUp) {
		return true;
	} else {
		return false;
	}
    }

}