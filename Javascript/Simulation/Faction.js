const factionID = {neutral:0, player:1, cpu:2};

class Faction {
    constructor() {
        this.name = "robots";
        this.agentColour = "#ff9900";
        this.structureColour = "#FF7775";
        this.storage = new Storage();
    }
}

class Storage {
    constructor() {
        this.essence = 0;
        this.concrete = 0;
        this.metal = 0;
        this.fuel = 0;

        this.maxQuantity = 999;
    }
}