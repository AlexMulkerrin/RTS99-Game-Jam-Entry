class Faction {
    constructor() {
        this.name = "robots";
        this.colour = "#ff9900";
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