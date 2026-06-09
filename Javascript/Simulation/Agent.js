const rotationID = { right:0, rightDown:1, down:2, leftDown:3, left:4,
                     leftUp:5, up:6, rightUp:7};
const direcDelta =[ [1,0],[1,1],[0,1],[-1,1],
				    [-1,0],[-1,-1],[0,-1],[1,-1]];

const stateID = {idle:0, wander:1, movingToLocation:2, attacking:3,}

const agentID = {robot:0, rover:1};

const agentTypes = [
    {name:"robot", turnDelay:10, invSlots:3, maxStack:10, health:40, 
        damage:5, projectileSpeed:0.2, cooldown:50, range:6, vision:2},
    {name:"rover", turnDelay:30, invSlots:4, maxStack:40, health:60, 
        damage:10, projectileSpeed:0.2, cooldown:40, range:11, vision:3},
];

class Agent {
    constructor(inX, inY, inType, inFaction) {
        this.x = inX;
        this.y = inY;
        this.rotation = rotationID.right;

        this.targX = this.x;
        this.targY = this.y;
        this.targID = NONE;

        this.newX = this.x;
        this.newY = this.y;

        this.type = inType;
        this.faction = inFaction
        this.isAlive = true;
        this.state = stateID.idle;

        this.health = agentTypes[this.type].health;
        this.cooldown = 0;

        this.movementAnimation = 0;
        this.newX = 0;
        this.newY = 0;
        this.newRotation = rotationID.right;
        this.isTurning = false;

        this.inventory = [];
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

        let dx = this.targX - this.x;
        if (dx == 0) dx += 0.0001;
        let dy = this.targY - this.y;
        
        let radians = Math.atan(dy / dx);
        let degrees = radians * 360 / (2 * Math.PI);
        
        if (dx < 0) degrees += 180;
        if (dx > 0 && dy < 0) degrees += 360;

        // find rotation octant in 45 degrees segments offset by 22.5 degrees
        let rotation = Math.floor(( degrees + 22.5) / 45) % 8;

        return rotation;
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

    findEmptySlot() {
        let len = this.inventory.length;
        if (len < agentTypes[this.type].invSlots) {
            return len;
        } else {
            return NONE;
        }
    }

    isInRange() {
        let dx = this.targX - this.x;
		let dy = this.targY - this.y;
		let dist = dx*dx+dy*dy;
		
        let range = agentTypes[this.type].range;

		if (dist<range) {
			return true;
		} else {
           return false;
        }
    }

}