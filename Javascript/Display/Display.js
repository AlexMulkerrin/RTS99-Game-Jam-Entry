class Display {
    constructor(inSimulation, inControl) {
        this.targetSimulation = inSimulation;
        this.targetControl = inControl;

        this.scale = 2;

        this.c = document.getElementById("displayCanvas");
        this.ctx = this.c.getContext("2d");
        this.ctx.imageSmoothingEnabled = false;
        this.c.width = 320*this.scale;
        this.c.height = 200*this.scale;

        this.mainView = new MainView(this.targetSimulation);
    }

    refreshDisplay() {
        this.ctx.fillStyle = "#eeeeff";
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
        this.ctx.fillText(Math.floor(sim.timer/60)+"s",10,20);
    }
}

class MainView {
    constructor(inSimulation) {
        this.targetSimulation = inSimulation;

        this.c = document.createElement("canvas");
        this.ctx = this.c.getContext("2d");
        this.c.width = 320;
        this.c.height = 200;

        this.sqSize = 16;

        this.tilesImage = new Image();
        this.tilesImage.src = "Resources/Images/Tiles.png";
    }

    refresh() {
        this.drawTerrain(); 

    }

    drawTerrain() {
        let sim = this.targetSimulation;

        for (let i=0; i<10; i++) {
            for (let j=0; j<10; j++) {
                let x = i*this.sqSize;
                let y = j*this.sqSize;

                let t = sim.terrain[i][j];
                this.drawTile(x,y,t.type); 


            }
        }
        
    }

    drawTile(x,y,ID) {
        let sqSize = this.sqSize;

        let tx = ID;
        let ty = 0;
        
        this.ctx.drawImage(this.tilesImage, 
            tx*(sqSize+1), ty*(sqSize+1), sqSize, sqSize,
            x, y, sqSize, sqSize);
    }
}