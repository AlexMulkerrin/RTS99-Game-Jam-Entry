class Display {
    constructor(inSimulation, inControl) {
        this.targetSimulation = inSimulation;
        this.targetControl = inControl;

        this.scale = 2;

        this.c = document.getElementById("displayCanvas");
        this.c.width = window.innerWidth-1;
        this.c.height = window.innerHeight-1;
        this.ctx = this.c.getContext("2d");
        this.ctx.imageSmoothingEnabled = false;

        this.mainView = new MainView(this.targetSimulation, this.targetControl);
    }

    refreshDisplay() {
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillRect(0,0,this.c.width, this.c.height);

        this.mainView.refresh();
        this.drawMainView();

        this.drawDebug();
    }

    drawMainView() {
        this.ctx.drawImage(this.mainView.c,
            0,0,320,200,
            0,0, 320*this.scale, 200*this.scale);
    }

    drawDebug() {
        let sim = this.targetSimulation;

        this.ctx.font = "16px sans-serif";
        this.ctx.fillStyle = "#9999dd"
        this.ctx.fillText(Math.floor(sim.timer/60)+"s",10,this.scale*200+20);
    }
}