// ---------- Global -------------------------------------------------------- //
var program;
// -------------------------------------------------------------------------- //
function loadProgram() {
    program = new Program();
}
class Program{
    constructor() {
        this.simulation = new Simulation();
        this.control = new Control(this.simulation);
        this.display = new Display(this.simulation, this.control);

        this.control.targetDisplay = this.display;

        this.update();
    }

    update() {
        this.simulation.update();
        this.display.refreshDisplay();

        let t = this;
        window.requestAnimationFrame( function(){t.update();})
    }
}
