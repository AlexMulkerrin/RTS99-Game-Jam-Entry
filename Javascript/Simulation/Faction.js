const factionID = {neutral:0, player:1, enemy:2};

const factionColours = ["#ff0000","#00ffb3","#ffff00"];

class Faction {
    constructor(inColour) {
        this.name = "robots";
        this.agentColour = inColour;
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