class Display {
    constructor(inSimulation, inControl) {
        this.targetSimulation = inSimulation;
        this.targetControl = inControl;

        this.scale = 2;

        this.c = document.getElementById("displayCanvas");
        this.ctx = this.c.getContext("2d");
        this.c.width = 320*this.scale;
        this.c.height = 200*this.scale;
    }

    refreshDisplay() {
        this.ctx.fillStyle = "#eeeeff";
        this.ctx.fillRect(0,0,this.c.width, this.c.height);

        this.drawDebug();
    }

    drawDebug() {
        let sim = this.targetSimulation;

        this.ctx.font = "16px sans-serif";
        this.ctx.fillStyle = "#9999dd"
        this.ctx.fillText(Math.floor(sim.timer/60)+"s",10,20);
    }
}