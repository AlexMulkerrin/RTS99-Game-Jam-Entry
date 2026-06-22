const rotationID = { right:0, rightDown:1, down:2, leftDown:3, left:4,
                     leftUp:5, up:6, rightUp:7};
const direcDelta =[ [1,0],[1,1],[0,1],[-1,1],
				    [-1,0],[-1,-1],[0,-1],[1,-1]];

const stateID = {idle:0, wander:1, movingToLocation:2, attacking:3, 
    depositResources:4,}

const agentID = {MGunMech:0, rocketMech:1, flamerMech:2,
    rover:3, transport:4, harvester:5, 
    tank:6, artillery:7, antiAir:8, HvyTank:9,
    scoutDrone:10, MGunDrone:11, interceptor:12, bomber:13, carrier:14,
    };

const agentTypes = [
    {name:"machine gunner mech", turnDelay:10, invSlots:1, maxStack:10, health:40, 
        damage:5, projectileSpeed:0.2, cooldown:50, range:6, vision:2,
        cost:{metal:2, fuel:1}},
    {name:"rocket mech", turnDelay:10, invSlots:1, maxStack:10, health:40, 
        damage:50, projectileSpeed:0.1, cooldown:200, range:16, vision:2,
        cost:{metal:4, fuel:1}},
    {name:"flamer mech", turnDelay:10, invSlots:1, maxStack:10, health:40, 
        damage:100, projectileSpeed:0.4, cooldown:25, range:3, vision:2,
        cost:{metal:2, fuel:4}},


    {name:"rover", turnDelay:30, invSlots:1, maxStack:40, health:60, 
        damage:10, projectileSpeed:0.2, cooldown:40, range:11, vision:4,
        cost:{metal:3, fuel:3}},
    {name:"transport", turnDelay:30, invSlots:4, maxStack:40, health:100, 
        vision:3,
        cost:{metal:6, fuel:3}},
    {name:"harvester", turnDelay:30, invSlots:3, maxStack:40, health:100, 
        vision:3,
        cost:{metal:3, fuel:1}},

    {name:"tank", turnDelay:40, invSlots:1, maxStack:40, health:200, 
        damage:40, projectileSpeed:0.1, cooldown:100, range:16, hasTurret:true,
        vision:3,
        cost:{metal:8, fuel:4}},
    {name:"artillery", turnDelay:40, invSlots:1, maxStack:40, health:80, 
        damage:200, projectileSpeed:0.05, cooldown:300, range:44,  hasTurret:true,
        vision:3,
        cost:{metal:12, fuel:3}},
    {name:"anti air", turnDelay:30, invSlots:1, maxStack:40, health:100, 
        damage:10, projectileSpeed:0.4, cooldown:20, range:16,  hasTurret:true,
        vision:3,
        cost:{metal:7, fuel:3}},
    {name:"heavy tank", turnDelay:50, invSlots:1, maxStack:40, health:250, 
        damage:10, projectileSpeed:1, cooldown:10, range:30,  hasTurret:true,
        vision:3,
        cost:{metal:15, fuel:5}},

    {name:"scout drone", turnDelay:5, invSlots:1, maxStack:5, health:20, 
        vision:5,
        cost:{metal:4, fuel:6}},
    {name:"machine gun drone", turnDelay:8, invSlots:1, maxStack:10, health:70, 
        damage:10, projectileSpeed:0.2, cooldown:50, range:6, isFlier:true,
        vision:3,
        cost:{metal:6, fuel:10}},
    {name:"interceptor", turnDelay:10, invSlots:1, maxStack:10, health:100, 
        damage:25, projectileSpeed:0.3, cooldown:40, range:6, onlyHitsAir:true,
        isFlier:true, vision:3,
        cost:{metal:8, fuel:20}},
    {name:"bomber", turnDelay:20, invSlots:1, maxStack:10, health:80, 
        damage:150, projectileSpeed:0.1, cooldown:80, range:6, isFlier:true,
        vision:3,
        cost:{metal:12, fuel:20}},
    
    {name:"carrier", turnDelay:40, invSlots:5, maxStack:80, health:1000, 
        canBuild:true, isFlier:true, vision:5,
        cost:{essence:100, metal:50, fuel:80}},
    

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