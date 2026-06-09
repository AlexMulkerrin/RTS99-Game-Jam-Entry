const MAX_STRUCTURE_SIZE = 3;

const structureID = {
    portal:0,  barracks:1, portal1:2, barracks1:3, silo:4,
    siphon:5, quarry:6, concreteFact:7, mine:8, foundry:9,
    well:10, refinery:11, powerPlant:12, vehicleFact:13, portal2:14,
    vehicleFact2:15, hangar:16, radar:17, solar:18, battery:19,

    landedMothership:20, sandbags:21, chainLink:22, woodenWall:23, wall:24,
    emplacement:25, tower:26, fortification:27, bunker:28
};

const structureTypes = [
    {name:"portal Tier 0",size:3,tileIndex:0, invSlots:8, maxStack:100},
    {name:"barracks Tier 0",size:2,tileIndex:0, invSlots:4, maxStack:20},
    {name:"portal Tier 1",size:3,tileIndex:1, invSlots:8, maxStack:200},
    {name:"barracks Tier 1",size:2,tileIndex:1, invSlots:4, maxStack:20},
    {name:"silo",size:1,tileIndex:0, invSlots:1, maxStack:100},

    {name:"Siphon",size:2,tileIndex:2, invSlots:1, maxStack:100},
    {name:"Quarry",size:2,tileIndex:3, invSlots:1, maxStack:100},
    {name:"Concrete Factory",size:2,tileIndex:4, invSlots:2, maxStack:100},
    {name:"Ore Mine",size:2,tileIndex:5, invSlots:1, maxStack:100},
    {name:"Foundry",size:2,tileIndex:6, invSlots:3, maxStack:100},

    {name:"Oil well",size:2,tileIndex:7, invSlots:1, maxStack:100},
    {name:"Refinery",size:2,tileIndex:8, invSlots:3, maxStack:100},
    {name:"Power plant",size:2,tileIndex:9, invSlots:2, maxStack:100},
    {name:"Vehicle factory Tier 1",size:3,tileIndex:3, invSlots:4, maxStack:100},
    {name:"portal Tier 2",size:3,tileIndex:2, invSlots:8, maxStack:400},

    {name:"Vehicle factory Tier 2",size:3,tileIndex:4, invSlots:4, maxStack:100},
    {name:"Drone Hangar",size:3,tileIndex:5, invSlots:4, maxStack:100},
    {name:"radar",size:2,tileIndex:10, invSlots:0, maxStack:0},
    {name:"Solar panels",size:3,tileIndex:6, invSlots:0, maxStack:0},
    {name:"Battery",size:2,tileIndex:11, invSlots:0, maxStack:0},

    {name:"Landed Mothership",size:3,tileIndex:7, invSlots:8, maxStack:400},
    {name:"sandbags",size:1,tileIndex:1, invSlots:0, maxStack:0},
    {name:"chain link fence",size:1,tileIndex:2, invSlots:0, maxStack:0},
    {name:"wooden wall",size:1,tileIndex:3, invSlots:0, maxStack:0},
    {name:"concrete wall",size:1,tileIndex:4, invSlots:0, maxStack:0},
    
    {name:"turret emplacement",size:1,tileIndex:5, invSlots:0, maxStack:0},
    {name:"turret tower",size:1,tileIndex:6, invSlots:0, maxStack:0},
    {name:"turret fortification",size:1,tileIndex:7, invSlots:0, maxStack:0},
    {name:"bunker",size:2,tileIndex:12, invSlots:0, maxStack:0},

    
];

class Structure {
    constructor(inX, inY, inType, inFaction) {
        this.x = inX;
        this.y = inY;
        this.type = inType;
        this.size = structureTypes[this.type].size;

        this.faction = inFaction
        this.isAlive = true;

        this.tileIndex = structureTypes[this.type].tileIndex;
        this.tileVariation = 0;

        this.inventory = [];
    }
}