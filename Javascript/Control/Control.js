const mouseButtonID = {left:1, middle:2, right:3};

const entityTypeID = {none:0, structure:1, agent:2};

const interactionModeID = {commanding:0, building:1}

const toolID = {none:0, concrete:1, road:2, wall:3, portal:4, barracks:5};
const tools = ["none","concrete","road","wall","portal","barracks"];
/*
const toolID = {concrete:0, road:1, wall:2, small:3, medium:4, large:5, removeStructure:6, robot:7, rover:8};
const tools = ["concrete","road","wall","1x1 building","2x2 building","3x3 building","remove structure","add robot", "add rover"];
*/

const toolTypes = [
    {name:"concrete", tooltip:"build concrete cost: 1 concrete", function:"setTool", funcArgs:toolID.concrete},
    {name:"road", tooltip:"build road cost: 2 concrete", function:"setTool", funcArgs:toolID.road},
    {name:"wall", tooltip:"build wall cost: 4 concrete", function:"setTool", funcArgs:toolID.wall},
    {name:"portal", tooltip:"deploy portal", function:"setTool", funcArgs:toolID.portal},
    {name:"barracks", tooltip:"build barracks", function:"setTool", funcArgs:toolID.barracks},
];

class Control {
    constructor(inSimulation) {
        this.targetSimulation = inSimulation;
        this.targetDisplay = {};

        this.c = document.getElementById("displayCanvas");

        this.mouse = new Mouse();
        this.interactionMode = interactionModeID.commanding;
        this.currentTool = toolID.none;

        this.button = [];
        this.createButtons();

        this.camera = new Camera();
        this.focusCameraOnUnit(0);

        //this.randomiseCamera();
        //this.camera.x = 5;
        //this.camera.y = 15;

        let t = this;

        window.addEventListener("mousemove", function(e){t.handleMouseMove(e)});
        window.addEventListener("mousedown", function(e){t.handleMouseDown(e)});
        window.addEventListener("mouseup", function(e){t.handleMouseUp(e)});

        // disable right click menu on canvas
        this.c.addEventListener("contextmenu", function(e){e.preventDefault()});

        this.c.addEventListener("wheel", function(e){t.handleMouseWheel(e); return false;});

        window.addEventListener("keydown", function(e){t.handleKeyDown(e)})
    }

    createButtons() {
        let sim = this.targetSimulation;
        let m = this.mouse;

        this.button = [];

        if (sim.gameState == gameStateID.inGame 
            || sim.gameState == gameStateID.gameOver ) {
            if (m.selectedType == entityTypeID.none) {
                this.makeBuildButtons();
            } else if (m.selectedType == entityTypeID.structure) {
                this.makeStructureButtons();
            }
        }
    }

    makeBuildButtons() {
        let x = 256;
        let y = 80;
        let size = 16;

        for (let i=0; i<toolTypes.length; i++) {
            let tool = toolTypes[i];
            let b = new Button(x,y,size,size, tool.name, tool.tooltip, tool.function, tool.funcArgs);
            this.button.push(b);

            x +=size;
            if (x>304) {
                x = 256;
                y +=size;
            }
        }
    }

    makeStructureButtons() {
        let sim = this.targetSimulation;
        let m = this.mouse;

        let s = sim.structure[m.selectedIndex];
        let stats = structureTypes[s.type];

        if (stats.builds) {
            let x =256;
            let y = 80;
            let size = 16;

            let agentType = stats.builds[0];
            let b = new Button(x,y,size,size, "robot", "build robot for 10 essence", "handleBuildUnit", agentID.robot);
            this.button.push(b);
        } else if (stats.isTradeHub) {
            let x =256;
            let y = 80;
            let size = 16;

            this.button.push( new Button(x,y,size,size, "buy concrete", "buy 10 concrete for 5 essence", "handleTrade", ["buy","concrete"]));
            x += size;
            this.button.push( new Button(x,y,size,size, "sell concrete", "sell 10 concrete for 5 essence", "handleTrade", ["sell","concrete"]));
            
            x = 256;
            y += size;
            this.button.push( new Button(x,y,size,size, "buy metal", "buy 10 metal for 10 essence", "handleTrade", ["buy","metal"]));
            x += size;
            this.button.push( new Button(x,y,size,size, "sell metal", "sell 10 metal for 10 essence", "handleTrade", ["sell","metal"]));

            x = 256;
            y += size;
            this.button.push( new Button(x,y,size,size, "buy fuel", "buy 10 fuel for 20 essence", "handleTrade", ["buy","fuel"]));
            x += size;
            this.button.push( new Button(x,y,size,size, "sell fuel", "sell 10 metal for 20 essence", "handleTrade", ["sell","fuel"]));
        }

        

        
    }

    handleMouseMove(event) {
        let m = this.mouse;

        //let sim = this.targetSimulation;
        let disp = this.targetDisplay;
        let view = disp.mainView;
        let cam = this.camera;

        m.x = Math.floor(event.layerX/disp.scale);
        m.y = Math.floor(event.layerY/disp.scale);
        //let adjX = Math.floor(m.x/disp.scale);
        //let adjY = Math.floor(m.y/disp.scale);

        let gx = Math.floor((m.x - view.viewOffsetX) / view.sqSize);
        let gy = Math.floor((m.y - view.viewOffsetY) / view.sqSize);

        if (gx>=0 && gx<cam.width && gy>=0 
            && gy<cam.height) {
            m.isOverGrid = true;
            m.gridX = gx + cam.x;
            m.gridY = gy + cam.y;

            if (this.interactionMode == interactionModeID.commanding) {
                this.checkHover();
            }

        } else {
            m.isOverGrid = false;
        }

        

        m.miniX = m.x - view.minimapOffsetX;
        m.miniY = m.y - view.minimapOffsetY;

        if (m.miniX>=0 && m.miniX<64 && m.miniY>=0 && m.miniY<64) {
            m.isOverMinimap = true;
            
        } else {
            m.isOverMinimap = false;
        }

        if (m.isOverMinimap) {
            if (m.whichButton == mouseButtonID.left) {
                this.centerCamera(m.miniX,m.miniY);
            }
        }

        m.hoveredButton = NONE;
        for (let i=0; i<this.button.length; i++) {
            let b = this.button[i];
            if (b.isInBounds(m.x,m.y)) {
                m.hoveredButton = i;
            }
        }

    }
    handleMouseDown(event) {
        let sim = this.targetSimulation;
        let m = this.mouse;

        m.whichButton = event.which;

        m.oldX = m.x;
        m.oldY = m.y;        

        if (m.whichButton == mouseButtonID.left) {
            if (m.isOverGrid) {
                if (this.interactionMode == interactionModeID.building) {
                    this.handleToolUse();
                } else if (this.interactionMode == interactionModeID.commanding) {
                    //m.selectedType = entityTypeID.none;
                    //this.createButtons();
                }

            } else if (m.isOverMinimap) {
                this.centerCamera(m.miniX,m.miniY);

            } else if (m.hoveredButton != NONE) {
                let b = this.button[m.hoveredButton];
                this[b.function](b.functionArguments);
            }

        } else if (m.whichButton == mouseButtonID.right) {
            if (m.isOverGrid) {
                if (this.interactionMode == interactionModeID.building) {
                    this.setTool(toolID.none);
                    this.interactionMode = interactionModeID.commanding;
                } else if (this.interactionMode == interactionModeID.commanding) {
                    if (m.selectedType == entityTypeID.agent) {

                        if (m.hoveredIsEnemy) {
                            sim.sendAttackCommand(m.selectedIndex,m.hoveredIndex);
                        } else {
                            sim.sendMoveCommand(m.gridX,m.gridY,m.selectedIndex);
                        }
                    }
                }
            } else if (m.isOverMinimap) {
                if (m.selectedType == entityTypeID.agent) {
                    sim.sendMoveCommand(m.miniX,m.miniY,m.selectedIndex);
                }
            }
        }
    }
    handleMouseUp(event) {
        let m = this.mouse;

        if (m.isOverGrid) {
            if (m.whichButton == mouseButtonID.left) {

                if (this.interactionMode == interactionModeID.commanding) {
                    if (m.hoveredType == entityTypeID.structure) {
                        m.selectedType = entityTypeID.structure;
                        m.selectedIndex = m.hoveredIndex;

                    } else if (m.hoveredType == entityTypeID.agent) {
                        m.selectedType = entityTypeID.agent;
                        m.selectedIndex = m.hoveredIndex;
                        
                    } else if (m.hoveredType == entityTypeID.none) {
                        m.selectedType = entityTypeID.none;
                    }
                    
                    this.createButtons();
                    
                } else if (this.interactionMode == interactionModeID.building){
                    this.handleToolUse();
                }

                
                
            } else if (m.whichButton == mouseButtonID.right) {

            }
        }

        m.whichButton = NONE;
    }

    handleMouseWheel(event) {
        let delta = event.deltaY;

        if (delta>0) {
            this.currentTool++;
            if (this.currentTool>=tools.length) {
                this.currentTool = tools.length-1;
            } 
        } else {
            this.currentTool--;
            if (this.currentTool<0) {
                this.currentTool = 0;
            }
        }
    }

    handleKeyDown(event) {
        let sim = this.targetSimulation;
        let m = this.mouse;

        let code = event.code;

        switch (code) {
            case "KeyA":
                this.moveCamera(-1,0);
                break;
            case "KeyD":
                this.moveCamera(1,0);
                break;
            case "KeyW":
                this.moveCamera(0,-1);
                break;
            case "KeyS":
                this.moveCamera(0,1);
                break;
            case "KeyE":
                sim.sendDepositCommand(m.selectedIndex);
        }
    }

    setTool(id) {
        this.currentTool = id;
        this.interactionMode = interactionModeID.building;
    }

    handleToolUse() {
        let sim = this.targetSimulation;
        let m = this.mouse;
        let f = factionID.player;

        switch(this.currentTool) {
            case toolID.concrete:
                sim.changeTile(m.gridX, m.gridY, tileID.concrete);
                break;
            case toolID.road:
                sim.changeTile(m.gridX, m.gridY, tileID.road);
                break;
            case toolID.wall:
                sim.tryPlaceStructure(m.gridX, m.gridY,structureID.wall, f);
                break;
            case toolID.portal:
                sim.tryPlaceStructure(m.gridX, m.gridY,structureID.portal, f);
                break;
            case toolID.barracks:
                sim.tryPlaceStructure(m.gridX, m.gridY,structureID.barracks, f);
                break;
            /*
            case toolID.small:
                sim.tryPlaceStructure(m.gridX, m.gridY,structureID.silo, f);
                break;
            case toolID.medium:
                sim.tryPlaceStructure(m.gridX, m.gridY,structureID.barracks1, f);
                break;
            case toolID.large:
                sim.tryPlaceStructure(m.gridX, m.gridY,structureID.portal2, f);
                break;
            case toolID.removeStructure:
                sim.tryRemoveStructure(m.gridX, m.gridY);
                break;
            case toolID.robot:
                sim.tryAddAgent(m.gridX,m.gridY, agentID.robot, f);
                break;
            case toolID.rover:
                sim.tryAddAgent(m.gridX,m.gridY, agentID.rover, f);
                break;
            */
        }
    }

    handleBuildUnit(agentIndex) {
        let sim = this.targetSimulation;
        let m = this.mouse;
        let f = factionID.player;
        let struc = sim.structure[m.selectedIndex];
        let stats = structureTypes[struc.type];

        let x = struc.x + stats.exit.x;
        let y = struc.y + stats.exit.y;
        sim.tryAddAgent(x,y, agentID.robot, f, false);
    }

    handleTrade(args) {
        let type = args[0];
        let resource = args[1];

        let sim = this.targetSimulation;
        let f = factionID.player;
        let storage = sim.faction[f].storage;
        let tradeValues = sim.faction[f].tradeValues;

        if (type == "buy") {
            let cost = tradeValues.buy[resource];
            if (cost <= storage.essence) {
                storage.essence -= cost;
                storage[resource] += 10;
            }

        } else if (type == "sell") {
            let value = tradeValues.sell[resource];
            if (storage[resource] >= 10) {
                storage[resource] -= 10;
                storage.essence += value;
            }

        }
    }

    checkHover() {
        let sim = this.targetSimulation;
        let m = this.mouse;

        let t = sim.terrain[m.gridX][m.gridY];

        m.hoveredType = entityTypeID.none;
        m.hoveredIsEnemy = false;

        let otherFact = NONE;
        if (t.hasStructure) {
            m.hoveredType = entityTypeID.structure;
            m.hoveredIndex = t.occupant;
            otherFact = sim.structure[m.hoveredIndex].faction;
        } else if (t.hasAgent) {
            m.hoveredType = entityTypeID.agent;
            m.hoveredIndex = t.occupant;
            otherFact = sim.agent[m.hoveredIndex].faction;
        }
        if (m.selectedType != entityTypeID.none) {
            let ownFact;

            if (m.selectedType == entityTypeID.agent) {
                ownFact = sim.agent[m.selectedIndex].faction;
            } else {
                // is structure
                ownFact = sim.structure[m.selectedIndex].faction;
            }
            

            if (otherFact != NONE && ownFact != otherFact) {
                m.hoveredIsEnemy = true;
            }
        
        }
    }

    randomiseCamera() {
        let sim = this.targetSimulation;
        let cam = this.camera;

        cam.x = random(sim.width - cam.width);
        cam.y = random(sim.height - cam.height);
        
    }

    focusCameraOnUnit(index) {
        let sim = this.targetSimulation;
        let cam = this.camera;
        let a = sim.agent[index];

        this.centerCamera(a.x,a.y);

    }

    moveCamera(dx,dy) {
        let sim = this.targetSimulation;
        let cam = this.camera;

        let nx = cam.x + dx;
        let ny = cam.y + dy;
        if (sim.isInBounds(nx,ny) 
            && sim.isInBounds(nx+cam.width-1,ny+cam.height-1)) {
            
            cam.x = nx;
            cam.y = ny;
        }
    }

    centerCamera(x,y) {
        let sim = this.targetSimulation;
        let cam = this.camera;

        let hx = Math.floor(cam.width/2);
        let hy = Math.floor(cam.height/2);

        let nx = x - hx;
        let ny = y - hy;

        if (nx<0) nx = 0;
        if (nx+cam.width >= sim.width) nx = sim.width-cam.width;

        if (ny<0) ny = 0;
        if (ny+cam.height >= sim.height) ny = sim.height-cam.height;

        cam.x = nx;
        cam.y = ny;
    }

    panCamera() {
        let m = this.mouse;
        let cam = this.camera;

        let threshold = 16;
        let delay = 3;

        let dx = m.oldX - m.x;
        let dy = m.oldY - m.y;

        if (dx>threshold) {
            this.moveCamera(-1,0);
            cam.panDelay = delay;
        } else if (dx < -threshold) {
            this.moveCamera(1,0);
            cam.panDelay = delay;
        }

        if (dy>threshold) {
            this.moveCamera(0,-1);
            cam.panDelay = delay;
        } else if (dy < -threshold) {
            this.moveCamera(0,1);
            cam.panDelay = delay;
        }
    }

    update() {
        let m = this.mouse;
        let cam = this.camera;

        if (cam.panDelay>0) {
            cam.panDelay--;
        } else {
            if (m.isOverGrid) {
            if (m.whichButton == mouseButtonID.middle) {
                this.panCamera();
            }
        }
        }

        

    }
}

class Mouse {
    constructor() {
        this.x = -100;
        this.y = -100;
        this.whichButton = NONE;

        this.oldX = -100;
        this.oldY = -100;

        this.isOverGrid = false;
        this.gridX = 0;
        this.gridY = 0;

        this.hoveredType = entityTypeID.none;
        this.hoveredIndex = NONE;
        this.hoveredIsEnemy = false;

        this.selectedType = entityTypeID.none;
        this.selectedIndex = NONE;

        this.isOverMinimap = false;
        this.miniX = 0;
        this.miniY = 0;

        this.hoveredButton = NONE;
    }
}

class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.width = 16;
        this.height = 11;

        this.viewingFaction = factionID.player;

        this.panDelay = 0;
    }

    isInBounds(x,y) {
        if (x>=0 && x<this.width && y>=0 && y<this.height) {
            return true;
        } else {
            return false;
        }
    }

    isSquareInBounds(x,y,size) {
        let span = size-1;
        let topLeft = this.isInBounds(x,y);
        let topRight = this.isInBounds(x+span,y);
        let bottomLeft = this.isInBounds(x,y+span);
        let bottomRight = this.isInBounds(x+span,y+span);

        if (topLeft || topRight || bottomLeft || bottomRight) {
            return true;
        } else {
            return false;
        }
    }
}

class Button {
    constructor(inX, inY, inWidth, inHeight, inText, inTooltip, inFunction, inFuncArgs) {
        this.x = inX;
        this.y = inY;
        this.width = inWidth;
        this.height = inHeight;
        
        this.text = inText;
        this.tooltip = inTooltip;
        this.function = inFunction;
        this.functionArguments = inFuncArgs;
    }

    isInBounds(x,y) {
        if (x >= this.x && x<= this.x + this.width 
            && y >= this.y && y <= this.y + this.height) {
            return true;
        } else {
            return false;
        }
         
    }
}