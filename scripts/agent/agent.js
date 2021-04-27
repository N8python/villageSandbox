class Agent {
    constructor({
        x,
        y = 1,
        z,
        scene
    }) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.scene = scene;
        this.rotation = 0;
        this.targetRotation = 0;
        this.memory = {
            health: 100,
            physicalEnergy: 100,
            mentalEnergy: 100,
            idleTicks: 0,
            totalTicks: 0,
            tasks: [],
            inventory: [],
            handItem: null
        };
        this.models = {};
        this.goal = { type: "wander", memory: {} };
        this.state = { type: "idle", memory: {} };
        this.initiated = false;
    }
    makeJSONSafe(obj) {
        const clone = {};
        Object.keys(obj).forEach(key => {
            clone[key] = obj[key] && obj[key].toJSON ? obj[key].toJSON() : obj[key];
        })
        return clone;
    }
    jsonObjToRef(obj) {
        const clone = {};
        Object.keys(obj).forEach(key => {
            clone[key] = obj[key];
            if (typeof obj[key] === "object" && obj[key] !== null && obj[key].x !== undefined && obj[key].y !== undefined && obj[key].z !== undefined && obj[key].rotation !== undefined && obj[key].type !== undefined) {
                const tile = mainScene.mainWorld.tiles.find(tile => tile.x === obj[key].x && tile.y === obj[key].y && tile.z === obj[key].z && tile.rotation === obj[key].rotation && tile instanceof typeToConstructor[obj[key].type]);
                clone[key] = tile;
            }
        })
        return clone;
    }
    toJSON() {
        return {
            x: this.x,
            y: this.y,
            z: this.z,
            rotation: this.rotation,
            targetRotation: this.targetRotation,
            memory: this.makeJSONSafe(this.memory),
            goal: this.makeJSONSafe(this.goal),
            state: this.makeJSONSafe(this.state),
            type: "Agent"
        }
    }
    static fromJSON(json) {
        const a = new Agent({
            x: json.x,
            y: json.y,
            z: json.z,
            scene: mainScene,
        });
        a.rotation = json.rotation;
        a.targetRotation = json.targetRotation;
        a.memory = a.jsonObjToRef(json.memory);
        a.goal = {...a.jsonObjToRef(json.goal), memory: a.jsonObjToRef(json.goal.memory) };
        a.state = {...a.jsonObjToRef(json.state), memory: a.jsonObjToRef(json.state.memory) };
        return a;
    }
    update() {
        this.memory.health = Math.max(Math.min(this.memory.health, 100), 0);
        this.memory.physicalEnergy = Math.max(Math.min(this.memory.physicalEnergy, 100), 0);
        this.memory.mentalEnergy = Math.max(Math.min(this.memory.mentalEnergy, 100), 0);
        this.memory.totalTicks++;
        if (this.memory.totalTicks % 3600 === 0) {
            if (this.memory.idleTicks / 3600 < 0.25) {
                this.memory.mentalEnergy -= 2;
            }
            this.memory.idleTicks = 0;
        }
        if (this.memory.handItem && document.getElementById("handItem") && selected === this) {
            document.getElementById("handItem").innerHTML = `<img src="assets/images/items/${this.memory.handItem.type}.png" style="width:32px">`;
        } else if (document.getElementById("handItem") && selected === this) {
            document.getElementById("handItem").innerHTML = "Nothing...";
        }
        if (this.models.handaxeModel) {
            this.models.handaxeModel.visible = false;
            if (this.memory.handItem) {
                if (this.memory.handItem.type === "handaxe") {
                    this.models.handaxeModel.visible = true;
                }
            }
        }
        if (this.models.pickaxeModel) {
            this.models.pickaxeModel.visible = false;
            if (this.memory.handItem) {
                if (this.memory.handItem.type === "pickaxe") {
                    this.models.pickaxeModel.visible = true;
                }
            }
        }
        if (this.models.copperAxeModel) {
            this.models.copperAxeModel.visible = false;
            if (this.memory.handItem) {
                if (this.memory.handItem.type === "copperAxe") {
                    this.models.copperAxeModel.visible = true;
                }
            }
        }
        if (this.models.ironAxeModel) {
            this.models.ironAxeModel.visible = false;
            if (this.memory.handItem) {
                if (this.memory.handItem.type === "ironAxe") {
                    this.models.ironAxeModel.visible = true;
                }
            }
        }
        if (this.models.copperPickaxeModel) {
            this.models.copperPickaxeModel.visible = false;
            if (this.memory.handItem) {
                if (this.memory.handItem.type === "copperPickaxe") {
                    this.models.copperPickaxeModel.visible = true;
                }
            }
        }
        if (this.models.ironPickaxeModel) {
            this.models.ironPickaxeModel.visible = false;
            if (this.memory.handItem) {
                if (this.memory.handItem.type === "ironPickaxe") {
                    this.models.ironPickaxeModel.visible = true;
                }
            }
        }
        if (!this.initiated) {
            return;
        }
        if (this.memory.home === undefined) {
            this.scene.mainWorld.tiles.forEach(tile => {
                if (tile instanceof House) {
                    this.memory.home = tile;
                }
            })
        }
        if (this.memory.chest === undefined) {
            this.scene.mainWorld.tiles.forEach(tile => {
                if (tile instanceof Chest) {
                    this.memory.chest = tile;
                }
            })
        }
        this.mesh.position.x = this.x;
        this.mesh.position.y = this.y;
        this.mesh.position.z = this.z;
        this.mesh.rotation.y = this.rotation;
        this.rotation += angleDifference(this.rotation, this.targetRotation) / 10;
        if (this.state.type === "idle") {
            this.memory.physicalEnergy += 0.002;
            this.memory.mentalEnergy += 0.001;
            if (this.mesh.animation.current !== "idle") {
                this.mesh.animation.play("idle");
            }
        }
        if (this.state.type === "followPath") {
            if (this.mesh.animation.current !== "walk") {
                this.mesh.animation.play("walk");
            }
            if (this.state.memory.goal === undefined && this.state.memory.path.length > 0) {
                this.state.memory.goal = this.state.memory.path.shift();
                this.targetRotation = Math.atan2(this.state.memory.goal.x - this.x, this.state.memory.goal.z - this.z);
                /*if (this.state.memory.goal.z > this.z) {
                    this.rotation = 0;
                } else if (this.state.memory.goal.x > this.x) {
                    this.rotation = Math.PI;
                } else if (this.state.memory.goal.x < this.x) {
                    this.rotation = Math.PI / 2;
                } else {
                    this.rotation = 3 * Math.PI / 2;
                }*/
            } else if (this.state.memory.goal) {
                if (this.state.memory.goal.x > this.x) {
                    this.x += 0.025 * (mainScene.delta / 16.66);
                }
                if (this.state.memory.goal.x < this.x) {
                    this.x -= 0.025 * (mainScene.delta / 16.66);
                }
                if (this.state.memory.goal.z > this.z) {
                    this.z += 0.025 * (mainScene.delta / 16.66);
                }
                if (this.state.memory.goal.z < this.z) {
                    this.z -= 0.025 * (mainScene.delta / 16.66);
                }
                if (Math.abs(this.state.memory.goal.z - this.z) + Math.abs(this.state.memory.goal.x - this.x) <= 0.05) {
                    this.x = this.state.memory.goal.x;
                    this.z = this.state.memory.goal.z;
                    this.state.memory.goal = undefined;
                    if (Math.hypot(this.x - this.memory.home.x, this.z - this.memory.home.z) > 8 && this.scene.sunAngle < 0 && this.goal.type !== "goHome") {
                        this.goal = { type: "goHome", memory: {} };
                        if (this.memory.tasks.length > 0) {
                            this.memory.tasks[0].doing = false;
                        }
                    }
                }
            } else if (this.state.memory.path.length === 0) {
                this.state = { type: "idle", memory: {} };
                if (this.goal.type === "goHome") {
                    this.targetRotation = Math.atan2(this.memory.home.x - this.x, this.memory.home.z - this.z);
                    if (this.memory.tasks.length > 0 && this.memory.tasks[0].name === "goHome") {
                        this.memory.tasks.shift();
                        if (document.getElementById("taskList")) {
                            this.generateTaskList(document.getElementById("taskList"));
                        }
                    }
                    this.goal = { type: "wander", memory: {} };
                }
                if (this.goal.type === "equipItem") {
                    this.targetRotation = Math.atan2(this.memory.chest.x - this.x, this.memory.chest.z - this.z);
                    if (this.memory.tasks.length > 0 && this.memory.tasks[0].name === "equipItem") {
                        const itemType = ({
                            "Handaxe": "handaxe",
                            "Pickaxe": "pickaxe",
                            "Copper Axe": "copperAxe",
                            "Copper Pickaxe": "copperPickaxe",
                            "Iron Axe": "ironAxe",
                            "Iron Pickaxe": "ironPickaxe"
                        })[this.memory.tasks[0].parameters[0]];
                        if (this.memory.chest.amountInInventory(itemType) > 0) {
                            if (this.memory.handItem.type) {
                                this.memory.chest.addToInventory(this.memory.handItem.type, 1);
                            }
                            this.memory.handItem = { type: itemType, amount: 1 };
                            this.memory.chest.addToInventory(itemType, -1);
                        }
                        this.memory.tasks.shift();
                        if (document.getElementById("taskList")) {
                            this.generateTaskList(document.getElementById("taskList"));
                        }
                    }
                    this.goal = { type: "wander", memory: {} };
                }
                if (this.goal.type === "eat" && this.goal.memory.source === "chest") {
                    const itemType = ({
                        "Tubers": "tuber"
                    })[this.goal.memory.itemType];
                    const amount = Math.min(this.goal.memory.times, this.memory.chest.amountInInventory(itemType));
                    if (amount > 0) {
                        this.addToInventory(itemType, amount);
                        this.memory.chest.addToInventory(itemType, -amount);
                        this.eat(itemType, amount);
                        if (this.memory.tasks.length > 0 && this.memory.tasks[0].name === "eat") {
                            this.memory.tasks.shift();
                            if (document.getElementById("taskList")) {
                                this.generateTaskList(document.getElementById("taskList"));
                            }
                        }
                        this.goal = { type: "wander", memory: {} };
                        this.state = { type: "idle", memory: {} };
                    } else {
                        if (this.memory.tasks.length > 0 && this.memory.tasks[0].name === "eat") {
                            this.memory.tasks.shift();
                            if (document.getElementById("taskList")) {
                                this.generateTaskList(document.getElementById("taskList"));
                            }
                        }
                        this.goal = { type: "wander", memory: {} };
                        this.state = { type: "idle", memory: {} };
                    }
                }
                if (this.goal.type === "storeInventory") {
                    this.targetRotation = Math.atan2(this.memory.chest.x - this.x, this.memory.chest.z - this.z);
                    this.memory.inventory.forEach(item => {
                        this.memory.chest.addToInventory(item.type, item.amount);
                    });
                    this.memory.inventory = [];
                    if (this.memory.tasks.length > 0 && this.memory.tasks[0].name === "storeInventory") {
                        this.memory.tasks.shift();
                        if (document.getElementById("taskList")) {
                            this.generateTaskList(document.getElementById("taskList"));
                        }
                    }
                    this.goal = { type: "wander", memory: {} };
                }
                if (this.goal.type === "gather") {
                    this.state = { type: "gather", memory: {} };
                }
                if (this.goal.type === "chopWood") {
                    this.state = { type: "chop", memory: {} };
                }
                if (this.goal.type === "mineRocks") {
                    this.state = { type: "mine", memory: {} };
                }
            }
        }
        if (this.state.type === "gather") {
            if (this.mesh.animation.current !== "gather") {
                this.targetRotation = Math.atan2(this.goal.memory.targetTile.x - this.x, this.goal.memory.targetTile.z - this.z);
                this.mesh.animation.play("gather");
            }
        }
        if (this.state.type === "chop") {
            if (this.mesh.animation.current !== "chop") {
                this.targetRotation = Math.atan2(this.goal.memory.targetTile.x - this.x, this.goal.memory.targetTile.z - this.z);
                this.mesh.animation.play("chop");
            }
        }
        if (this.state.type === "mine") {
            if (this.mesh.animation.current !== "mine") {
                this.targetRotation = Math.atan2(this.goal.memory.targetTile.x - this.x, this.goal.memory.targetTile.z - this.z);
                this.mesh.animation.play("mine");
            }
        }
        if (this.goal.type === "wander") {
            this.memory.physicalEnergy += 0.002;
            this.memory.mentalEnergy += 0.001;
            this.memory.idleTicks++;
            if (this.state.type === "gather") {
                this.state = { type: "idle", memory: {} };
            }
            if (Math.random() < 0.005 && this.state.type === "idle") {
                let chosenSquare;
                for (let i = 0; i < 20; i++) {
                    chosenSquare = { x: Math.round(Math.round(this.x) + Math.random() * 6 - 3), z: Math.round(Math.round(this.z) + Math.random() * 6 - 3) };
                    const occupied = this.scene.mainWorld.tiles.some(tile => (tile instanceof Rocks || tile instanceof House || tile instanceof WorkBench || tile instanceof Bush || tile instanceof Tree || tile instanceof Chest) && tile.contains(chosenSquare.x, chosenSquare.z));
                    if (occupied || chosenSquare.x < -16 || chosenSquare.x > 15 || chosenSquare.z < -16 || chosenSquare.z > 15) {
                        chosenSquare = undefined;
                    } else {
                        break;
                    }
                }
                if (chosenSquare) {
                    const path = Pathfind.findPath({ world: this.scene.mainWorld, start: { x: Math.round(this.x), z: Math.round(this.z) }, end: chosenSquare });
                    if (path.length > 0) {
                        this.state = { type: "followPath", memory: {} };
                        this.state.memory.path = path;
                    }
                }
            }
            if (this.memory.tasks.length > 0) {
                if (this.memory.tasks[0].name === "goHome" && !this.memory.tasks[0].doing) {
                    this.memory.tasks[0].doing = true;
                    this.goal = { type: "goHome", memory: {} };
                }
                if (this.memory.tasks[0].name === "storeInventory" && !this.memory.tasks[0].doing) {
                    this.memory.tasks[0].doing = true;
                    this.goal = { type: "storeInventory", memory: {} };
                }
                if (this.memory.tasks[0].name === "equipItem" && !this.memory.tasks[0].doing) {
                    this.memory.tasks[0].doing = true;
                    this.goal = { type: "equipItem", memory: {} };
                }
                if (this.memory.tasks[0].name === "chopWood" && !this.memory.tasks[0].doing) {
                    this.memory.tasks[0].doing = true;
                    this.goal = { type: "chopWood", memory: { times: this.memory.tasks[0].parameters[0] } };
                }
                if (this.memory.tasks[0].name === "mineRocks" && !this.memory.tasks[0].doing) {
                    this.memory.tasks[0].doing = true;
                    this.goal = { type: "mineRocks", memory: { times: this.memory.tasks[0].parameters[0] } };
                }
                if (this.memory.tasks[0].name === "gather" && !this.memory.tasks[0].doing) {
                    this.memory.tasks[0].doing = true;
                    this.goal = { type: "gather", memory: { itemType: this.memory.tasks[0].parameters[0], times: this.memory.tasks[0].parameters[1] } };
                }
                if (this.memory.tasks[0].name === "eat" && !this.memory.tasks[0].doing) {
                    this.memory.tasks[0].doing = true;
                    this.goal = { type: "eat", memory: { itemType: this.memory.tasks[0].parameters[1], times: this.memory.tasks[0].parameters[0], source: this.memory.tasks[0].parameters[2] } };
                }
                if (this.memory.tasks[0].name === "cloneSelf" && !this.memory.tasks[0].doing) {
                    this.memory.tasks[0].doing = true;
                    this.goal = { type: "cloneSelf", memory: {} };
                }
            }
        }
        if (this.goal.type === "goHome") {
            if (!this.goal.memory.headingHome) {
                this.goal.memory.headingHome = true;
                const path = Pathfind.findPath({ world: this.scene.mainWorld, start: { x: Math.round(this.x), z: Math.round(this.z) }, end: this.memory.home.entrance() });
                if (path.length > 0) {
                    this.state = { type: "followPath", memory: {} };
                    this.state.memory.path = path;
                } else {
                    this.goal = { type: "wander", memory: {} };
                    if (this.memory.tasks.length > 0 && this.memory.tasks[0].name === "goHome") {
                        this.memory.tasks.shift();
                        if (document.getElementById("taskList")) {
                            this.generateTaskList(document.getElementById("taskList"));
                        }
                    }
                }
            }
        }
        if (this.goal.type === "storeInventory") {
            if (!this.goal.memory.headingToChest) {
                this.goal.memory.headingToChest = true;
                const path = Pathfind.findPath({ world: this.scene.mainWorld, start: { x: Math.round(this.x), z: Math.round(this.z) }, end: this.memory.chest.entrance() });
                if (path.length > 0) {
                    this.state = { type: "followPath", memory: {} };
                    this.state.memory.path = path;
                } else {
                    this.goal = { type: "wander", memory: {} };
                    if (this.memory.tasks.length > 0 && this.memory.tasks[0].name === "storeInventory") {
                        this.memory.tasks.shift();
                        if (document.getElementById("taskList")) {
                            this.generateTaskList(document.getElementById("taskList"));
                        }
                    }
                }
            }
        }
        if (this.goal.type === "equipItem") {
            if (!this.goal.memory.headingToChest) {
                this.goal.memory.headingToChest = true;
                const path = Pathfind.findPath({ world: this.scene.mainWorld, start: { x: Math.round(this.x), z: Math.round(this.z) }, end: this.memory.chest.entrance() });
                if (path.length > 0) {
                    this.state = { type: "followPath", memory: {} };
                    this.state.memory.path = path;
                } else {
                    this.goal = { type: "wander", memory: {} };
                    if (this.memory.tasks.length > 0 && this.memory.tasks[0].name === "storeInventory") {
                        this.memory.tasks.shift();
                        if (document.getElementById("taskList")) {
                            this.generateTaskList(document.getElementById("taskList"));
                        }
                    }
                }
            }
        }
        if (this.goal.type === "gather") {
            if (!this.goal.memory.startedGathering) {
                this.goal.memory.startedGathering = true;
                const { chosen, path } = this.findPathToNearest(Agent.typeToClass[this.goal.memory.itemType]);
                this.goal.memory.targetTile = chosen;
                if (path.length > 0) {
                    this.state = { type: "followPath", memory: {} };
                    this.state.memory.path = path;
                } else {
                    if (this.memory.tasks.length > 0 && this.memory.tasks[0].name === "gather") {
                        this.memory.tasks.shift();
                        if (document.getElementById("taskList")) {
                            this.generateTaskList(document.getElementById("taskList"));
                        }
                    }
                    this.goal = { type: "wander", memory: {} };
                }
            }
        }
        if (this.goal.type === "chopWood") {
            if (!this.goal.memory.startedGathering) {
                this.goal.memory.startedGathering = true;
                const { chosen, path } = this.findPathToNearest(Tree);
                this.goal.memory.targetTile = chosen;
                if (path.length > 0 && this.memory.handItem && (this.memory.handItem.type === "handaxe" || this.memory.handItem.type === "copperAxe" || this.memory.handItem.type === "ironAxe")) {
                    this.state = { type: "followPath", memory: {} };
                    this.state.memory.path = path;
                } else {
                    if (this.memory.tasks.length > 0 && this.memory.tasks[0].name === "chopWood") {
                        this.memory.tasks.shift();
                        if (document.getElementById("taskList")) {
                            this.generateTaskList(document.getElementById("taskList"));
                        }
                    }
                    this.goal = { type: "wander", memory: {} };
                    this.state = { type: "idle", memory: {} };
                }
            }
        }
        if (this.goal.type === "mineRocks") {
            if (!this.goal.memory.startedGathering) {
                this.goal.memory.startedGathering = true;
                const { chosen, path } = this.findPathToNearest(Rocks);
                this.goal.memory.targetTile = chosen;
                if (path.length > 0 && this.memory.handItem && (this.memory.handItem.type === "pickaxe" || this.memory.handItem.type === "copperPickaxe" || this.memory.handItem.type === "ironPickaxe")) {
                    this.state = { type: "followPath", memory: {} };
                    this.state.memory.path = path;
                } else {
                    if (this.memory.tasks.length > 0 && this.memory.tasks[0].name === "mineRocks") {
                        this.memory.tasks.shift();
                        if (document.getElementById("taskList")) {
                            this.generateTaskList(document.getElementById("taskList"));
                        }
                    }
                    this.goal = { type: "wander", memory: {} };
                    this.state = { type: "idle", memory: {} };
                }
            }
        }
        if (this.goal.type === "eat") {
            if (this.goal.memory.source === "inventory") {
                this.eat(({
                    "Tubers": "tuber"
                })[this.goal.memory.itemType], this.goal.memory.times);
                if (this.memory.tasks.length > 0 && this.memory.tasks[0].name === "eat") {
                    this.memory.tasks.shift();
                    if (document.getElementById("taskList")) {
                        this.generateTaskList(document.getElementById("taskList"));
                    }
                }
                this.goal = { type: "wander", memory: {} };
                this.state = { type: "idle", memory: {} };
            } else if (this.goal.memory.source === "chest") {
                if (!this.goal.memory.headingToChest) {
                    this.goal.memory.headingToChest = true;
                    const path = Pathfind.findPath({ world: this.scene.mainWorld, start: { x: Math.round(this.x), z: Math.round(this.z) }, end: this.memory.chest.entrance() });
                    if (path.length > 0) {
                        this.state = { type: "followPath", memory: {} };
                        this.state.memory.path = path;
                    } else {
                        this.goal = { type: "wander", memory: {} };
                        if (this.memory.tasks.length > 0 && this.memory.tasks[0].name === "storeInventory") {
                            this.memory.tasks.shift();
                            if (document.getElementById("taskList")) {
                                this.generateTaskList(document.getElementById("taskList"));
                            }
                        }
                    }
                }
            }
        }
        if (this.goal.type === "cloneSelf") {
            if (this.memory.physicalEnergy > 95 && this.memory.mentalEnergy > 95) {
                this.memory.physicalEnergy -= 25;
                this.memory.mentalEnergy -= 25;
                const tileTarget = this.adjacentTile();
                let start = {};
                let end = {};
                let seed = Math.random();
                if (seed < 0.25) {
                    start = { x: tileTarget.x - 24, y: 4, z: tileTarget.z };
                    end = { x: tileTarget.x + 24, y: 4, z: tileTarget.z };
                } else if (seed < 0.5) {
                    start = { x: tileTarget.x + 24, y: 4, z: tileTarget.z };
                    end = { x: tileTarget.x - 24, y: 4, z: tileTarget.z };
                } else if (seed < 0.75) {
                    start = { x: tileTarget.x, y: 4, z: tileTarget.z + 24 };
                    end = { x: tileTarget.x, y: 4, z: tileTarget.z - 24 };
                } else {
                    start = { x: tileTarget.x, y: 4, z: tileTarget.z - 24 };
                    end = { x: tileTarget.x, y: 4, z: tileTarget.z + 24 };
                }
                const theBird = new Bird({
                    x: start.x,
                    y: start.y,
                    z: start.z,
                    scene: mainScene,
                    deleteOnTarget: true,
                    carryingAgent: true,
                    velocity: 5
                });
                theBird.init();
                theBird.memory.target = end;
                theBird.memory.dropPoint = {...tileTarget };
                this.scene.mainWorld.agents.push(theBird);
            }
            if (this.memory.tasks.length > 0 && this.memory.tasks[0].name === "cloneSelf") {
                this.memory.tasks.shift();
                if (document.getElementById("taskList")) {
                    this.generateTaskList(document.getElementById("taskList"));
                }
            }
            this.goal = { type: "wander", memory: {} };
            this.state = { type: "idle", memory: {} };
        }
    }
    createBoundingBox(mesh) {
        mesh.position.x = this.x;
        mesh.position.y = this.y + 1.25;
        mesh.position.z = this.z;
        mesh.scale.set(1, 2.5, 1);
    }
    getInfo() {
        return `
            Goal: ${Agent.displayName[this.goal.type]} <br>
            State: ${Agent.displayName[this.state.type]} <br>
            Health: ${Math.round(this.memory.health)} / 100 <br>
            Physical: ${Math.round(this.memory.physicalEnergy)} / 100 <br>
            Mental: ${Math.round(this.memory.mentalEnergy)} / 100
        `
    }
    makeGui(rootNode) {
        rootNode.innerHTML = `
        <div style="border: 2px solid black;padding: 4px;width:60%;">
            <div id="talk">
            </div>
            <h3 style="color:#ecddba">Task Manager:</h3>
            <div id="tasks">
            </div>
            <h3 style="color:#ecddba">Task List:</h3>
            <div id="taskList" style="color:#ecddba">
            </div>
            <h3 style="color:#ecddba">Inventory:</h3>
            <div id="inventory" style="color:#ecddba">
            </div>
            <h3 style="color:#ecddba">Holding:</h3>
            <div id="handItem" style="color:#ecddba">
            </div>
        </div>
        `
        const talkButton = document.createElement("button");
        talkButton.innerHTML = "Talk";
        talkButton.onclick = () => {
            displayRobotText(genSentence("idle"));
        }
        document.getElementById("talk").appendChild(talkButton);
        const taskDivs = [];
        tasks.forEach(task => {
            const taskDiv = document.createElement('div');
            taskDiv.style.backgroundColor = task.color;
            taskDiv.name = task.name;
            task.display.forEach(part => {
                if (part.type === "text") {
                    const span = document.createElement('span');
                    span.innerHTML = part.value;
                    span.style.color = part.color;
                    taskDiv.appendChild(span)
                }
                if (part.type === "dropdown") {
                    const select = document.createElement('select');
                    part.values.forEach(value => {
                        const opt = document.createElement('option');
                        opt.innerHTML = value;
                        select.appendChild(opt);
                    })
                    taskDiv.appendChild(select);
                }
                if (part.type === "range") {
                    const select = document.createElement('select');
                    for (let i = part.min; i <= part.max; i++) {
                        const opt = document.createElement('option');
                        opt.innerHTML = i;
                        select.appendChild(opt);
                    }
                    taskDiv.appendChild(select);
                }
                const spaceBreak = document.createElement('span');
                spaceBreak.innerHTML = " ";
                taskDiv.appendChild(spaceBreak);
            });
            taskDivs.push(taskDiv);
            taskDiv.onclick = () => {
                taskDivs.forEach(taskDiv => {
                    taskDiv.style.border = "0px solid yellow";
                    taskDiv.selected = false;
                })
                taskDiv.style.border = "2px solid yellow";
                taskDiv.selected = true;
            }
            document.getElementById("tasks").appendChild(taskDiv);
            document.getElementById("tasks").appendChild(document.createElement("br"));
        });
        this.generateTaskList(document.getElementById("taskList"));
        const addTask = document.createElement("button");
        addTask.innerHTML = "Add Task";
        document.getElementById("tasks").appendChild(addTask);
        addTask.onclick = () => {
            const selectedTask = taskDivs.find(td => td.selected);
            if (selectedTask) {
                const parameters = [];
                selectedTask.childNodes.forEach(node => {
                    if (node.value) {
                        parameters.push(!Number.isNaN(+node.value) ? +node.value : node.value);
                    }
                });
                this.memory.tasks.push({
                    name: selectedTask.name,
                    parameters
                });
                this.generateTaskList(document.getElementById("taskList"));
            }
        }
        document.getElementById("inventory").innerHTML = verticalInventory(this.memory.inventory);
    }
    generateTaskList(rootNode) {
        rootNode.innerHTML = "";
        this.memory.tasks.forEach((task, i) => {
            const taskDisplay = document.createElement("span");
            taskDisplay.innerHTML = `${Agent.displayName[task.name]}${task.parameters.length > 0 ? " " + task.parameters.join(" ") : ""}`
            if (taskDisplayFuncs[task.name]) {
                taskDisplay.innerHTML = taskDisplayFuncs[task.name](...task.parameters);
            }
            taskDisplay.innerHTML += ".";
            const closeButton = document.createElement("button");
            closeButton.innerHTML = `<span style="position:relative;bottom:2px">x</span>`;
            closeButton.style.marginLeft = "4px";
            closeButton.onclick = () => {
                this.memory.tasks.splice(i, 1);
                this.generateTaskList(document.getElementById("taskList"));
            }
            rootNode.appendChild(taskDisplay);
            rootNode.appendChild(closeButton);
            rootNode.appendChild(document.createElement("br"));
        })
        if (rootNode.innerHTML === "") {
            rootNode.innerHTML = "No tasks!"
        }
    }
    findPathToNearest(clazz) {
        const targetTiles = this.scene.mainWorld.tiles.filter(tile => tile instanceof clazz && !tile.ignorePathfinding);
        let chosens = targetTiles.sort((a, b) => Math.hypot(a.x - this.x, a.z - this.z) - Math.hypot(b.x - this.x, b.z - this.z)).slice(0, 5);
        if (chosens.length > 0) {
            let chosenPath;
            let c;
            let bestPathLength = Infinity;
            chosens.forEach(chosen => {
                const entrance = chosen.entrance({ x: this.x, z: this.z });
                if (entrance === undefined) {
                    return;
                }
                const path = Pathfind.findPath({ world: this.scene.mainWorld, start: { x: Math.round(this.x), z: Math.round(this.z) }, end: entrance });
                if (path.length < bestPathLength) {
                    bestPathLength = path.length;
                    chosenPath = path;
                    c = chosen;
                }
            });
            if (chosenPath === undefined) {
                return {
                    chosen: undefined,
                    path: []
                };
            } else {
                return {
                    chosen: c,
                    path: chosenPath
                };
            }
        }
        return {
            chosen: undefined,
            path: []
        };
    }
    addToInventory(item, amt) {
        if (amt === 0) {
            return;
        }
        const itemSelected = this.memory.inventory.find(i => i.type === item);
        if (itemSelected) {
            itemSelected.amount += amt;
        } else {
            this.memory.inventory.push({
                type: item,
                amount: amt
            })
        }
        if (document.getElementById("unitGui") && document.getElementById("inventory") && selected === this) {
            document.getElementById("inventory").innerHTML = verticalInventory(this.memory.inventory);
        }
    }
    amountInInventory(item) {
        const itemSelected = this.memory.inventory.find(i => i.type === item);
        if (itemSelected) {
            return itemSelected.amount;
        }
        return 0;
    }
    eat(item, times) {
        times = Math.min(times, this.amountInInventory(item));
        this.addToInventory(item, -times);
        for (let i = 0; i < times; i++) {
            if (item === "tuber") {
                this.memory.physicalEnergy += 1 + Math.random();
                if (Math.random() < 0.25) {
                    this.memory.mentalEnergy += 1 + Math.random();
                }
            }
        }
    }
    adjacentTile() {
        const spots = [
            { x: this.x + 1, z: this.z },
            { x: this.x, z: this.z + 1 },
            { x: this.x - 1, z: this.z },
            { x: this.x, z: this.z - 1 }
        ].filter(spot => {
            return !this.scene.mainWorld.tiles.some(tile => (tile instanceof Rocks || tile instanceof House || tile instanceof Bush || tile instanceof Tree || tile instanceof Chest || tile instanceof WorkBench) && tile.contains(spot.x, spot.z))
        });
        return spots[Math.floor(Math.random() * spots.length)];
    }
    async init() {
        const model = await this.scene.third.load.fbx("robot");
        const handaxeModel = await this.scene.third.load.fbx("handaxe");
        const pickaxeModel = await this.scene.third.load.fbx("pickaxe");
        const copperAxeModel = await this.scene.third.load.fbx("copperAxe");
        const copperPickaxeModel = await this.scene.third.load.fbx("copperPickaxe");
        const ironAxeModel = await this.scene.third.load.fbx("ironAxe");
        const ironPickaxeModel = await this.scene.third.load.fbx("ironPickaxe");
        handaxeModel.scale.set(200, 200, 200);
        handaxeModel.castShadow = true;
        this.models.handaxeModel = handaxeModel;
        copperAxeModel.scale.set(0.5, 0.5, 0.5);
        copperAxeModel.castShadow = true;
        this.models.copperAxeModel = copperAxeModel;
        ironAxeModel.scale.set(0.5, 0.5, 0.5);
        ironAxeModel.castShadow = true;
        this.models.ironAxeModel = ironAxeModel;
        pickaxeModel.scale.set(150, 150, 150);
        pickaxeModel.castShadow = true;
        this.models.pickaxeModel = pickaxeModel;
        copperPickaxeModel.scale.set(0.5, 0.5, 0.5);
        copperPickaxeModel.castShadow = true;
        this.models.copperPickaxeModel = copperPickaxeModel;
        ironPickaxeModel.scale.set(0.5, 0.5, 0.5);
        ironPickaxeModel.castShadow = true;
        this.models.ironPickaxeModel = ironPickaxeModel;
        let added = false;
        model.traverse(child => {
                if (child.name === 'mixamorigRightHand' && !added) {
                    //console.log("YAY")
                    //child.add(this.scene.third.add.box({ width: 20, height: 20, depth: 20 }));
                    child.add(handaxeModel);
                    child.add(pickaxeModel);
                    child.add(copperAxeModel);
                    child.add(copperPickaxeModel);
                    child.add(ironAxeModel);
                    child.add(ironPickaxeModel);
                    //alert("YAY")
                    added = true;
                }
            })
            //model.scale.set(0.005, 0.005, 0.005);
        this.mesh = new ExtendedObject3D();
        this.mesh.add(model);
        this.mesh.position.set(this.x, this.y, this.z);
        this.mesh.rotation.y = this.rotation;
        this.mesh.scale.set(0.005, 0.005, 0.005);
        //this.mesh.children[0].material = new THREE.MeshPhongMaterial({ color: 0x006400 })
        this.scene.third.add.existing(this.mesh);
        /*this.scene.third.load.fbx(`./assets/characters/robot/Heavy Weapon Swing.fbx`).then(object => {
            console.log(JSON.stringify(object.animations[0]));
        });*/

        this.scene.third.animationMixers.add(this.mesh.animationMixer);
        const animsToLoad = ["idle", "walk", "gather", "chop", "mine"];
        for (const anim of animsToLoad) {
            const animText = await fetch(`./assets/characters/robot/animations/${anim}.json`);
            const animJson = await animText.json();
            const clip = THREE.AnimationClip.parse(animJson);
            clip.animName = anim;
            this.mesh.animation.add(anim, clip);
        }
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        this.mesh.animationMixer.addEventListener("loop", (e) => {
            if (e.action.getClip().animName === "gather") {
                if (this.goal.type === "gather") {
                    this.memory.physicalEnergy -= 0.5;
                    this.goal.memory.targetTile.mesh.visible = false;
                    this.scene.mainWorld.tiles.splice(this.scene.mainWorld.tiles.indexOf(this.goal.memory.targetTile), 1);
                    this.scene.third.scene.children.splice(this.scene.third.scene.children.indexOf(this.goal.memory.targetTile.mesh), 1);
                    const lootTable = Agent.classToGather[this.goal.memory.targetTile.constructor.name];
                    lootTable.forEach(item => {
                        const amount = Math.round(Math.random() * (item.max - item.min) + item.min);
                        this.addToInventory(item.type, amount);
                    })
                    if (this.goal.memory.targetTile.constructor.name === "GrassBlades") {
                        if (Math.random() < 0.25) {
                            this.addToInventory("tuber", 1);
                        }
                    }
                    this.goal.memory.times--;
                    if (this.memory.tasks.length > 0 && this.memory.tasks[0].name === "gather") {
                        this.memory.tasks[0].parameters[1]--;
                    }
                    if (document.getElementById("taskList")) {
                        this.generateTaskList(document.getElementById("taskList"));
                    }
                    if (this.goal.memory.times > 0) {
                        this.goal.memory.startedGathering = false;
                    } else {
                        if (this.memory.tasks.length > 0 && this.memory.tasks[0].name === "gather") {
                            this.memory.tasks.shift();
                            if (document.getElementById("taskList")) {
                                this.generateTaskList(document.getElementById("taskList"));
                            }
                        }
                        this.goal = { type: "wander", memory: {} };
                        this.state = { type: "idle", memory: {} };
                    }
                }
            }
            if (e.action.getClip().animName === "chop") {
                if (this.goal.type === "chopWood") {
                    this.memory.physicalEnergy -= 0.5;
                    let chance = 0.25;
                    if (this.memory.handItem.type === "copperAxe") {
                        chance = 0.35;
                    }
                    if (this.memory.handItem.type === "ironAxe") {
                        chance = 0.5;
                    }
                    if (Math.random() < chance) {
                        /*this.scene.third.physics.add.existing(this.goal.memory.targetTile.mesh, {
                            shape: 'compound',
                            compound: [
                                { shape: 'box', width: 0.1, height: 2.5, depth: 0.1, y: 1.25 },
                                { shape: "sphere", radius: 1, y: 2.75, mass: 100 }
                            ],
                            addChildren: false
                        });*/
                        const lootTable = Agent.classToGather[this.goal.memory.targetTile.constructor.name];
                        lootTable.forEach(item => {
                            let amount = Math.round(Math.random() * (item.max - item.min) + item.min);
                            if (this.memory.handItem.type === "copperAxe") {
                                amount *= 1.25;
                                amount = Math.round(amount);
                            }
                            if (this.memory.handItem.type === "ironAxe") {
                                amount *= 1.5;
                                amount = Math.round(amount);
                            }
                            this.addToInventory(item.type, amount);
                        })
                        let xNegativeOne = Math.random() * 2 - 1;
                        let zNegativeOne = Math.random() * 2 - 1;
                        if (this.goal.memory.targetTile) {
                            this.goal.memory.targetTile.beginFall(xNegativeOne * 0.1, zNegativeOne * 0.1);
                        }
                        /*setTimeout(() => {
                            this.scene.third.physics.destroy(tt.mesh);
                            this.scene.third.scene.children.splice(this.scene.third.scene.children.indexOf(tt.mesh), 1);
                        }, 5000)*/
                        /*setInterval(() => {
                            console.log(tt.mesh.body);
                        })*/
                        //console.log(this.goal.memory.times, this.memory.tasks[0].parameters[0])
                        this.goal.memory.times--;
                        if (this.memory.tasks.length > 0 && this.memory.tasks[0].name === "chopWood") {
                            this.memory.tasks[0].parameters[0]--;
                        }
                        if (document.getElementById("taskList") && selected === this) {
                            this.generateTaskList(document.getElementById("taskList"));
                        }
                        if (this.goal.memory.times > 0) {
                            this.goal.memory.startedGathering = false;
                        } else {
                            if (this.memory.tasks.length > 0 && this.memory.tasks[0].name === "chopWood") {
                                this.memory.tasks.shift();
                                if (document.getElementById("taskList")) {
                                    this.generateTaskList(document.getElementById("taskList"));
                                }
                            }
                            this.goal = { type: "wander", memory: {} };
                            this.state = { type: "idle", memory: {} };
                        }
                    }
                }
            }
            if (e.action.getClip().animName === "mine") {
                if (this.goal.type === "mineRocks") {
                    this.memory.physicalEnergy -= 1;
                    /*this.scene.third.physics.add.existing(this.goal.memory.targetTile.mesh, {
                        shape: 'compound',
                        compound: [
                            { shape: 'box', width: 0.1, height: 2.5, depth: 0.1, y: 1.25 },
                            { shape: "sphere", radius: 1, y: 2.75, mass: 100 }
                        ],
                        addChildren: false
                    });*/
                    if (this.goal.memory.targetTile.kind === "ironOre") {
                        this.addToInventory("iron", 1);
                    }
                    if (this.goal.memory.targetTile.kind === "copperOre") {
                        this.addToInventory("copper", 1);
                    }
                    let iterations = 1;
                    if (this.memory.handItem.type === "copperPickaxe") {
                        iterations = 2;
                    }
                    if (this.memory.handItem.type === "ironPickaxe") {
                        iterations = 3;
                    }
                    for (let i = 0; i < iterations; i++) {
                        if (Math.random() < 0.1) {
                            this.addToInventory("iron", 1);
                        }
                        if (Math.random() < 0.25) {
                            this.addToInventory("copper", 1);
                        }
                    }
                    this.goal.memory.targetTile.mesh.visible = false;
                    this.scene.mainWorld.tiles.splice(this.scene.mainWorld.tiles.indexOf(this.goal.memory.targetTile), 1);
                    this.scene.third.scene.children.splice(this.scene.third.scene.children.indexOf(this.goal.memory.targetTile.mesh), 1);
                    const lootTable = Agent.classToGather[this.goal.memory.targetTile.constructor.name];
                    lootTable.forEach(item => {
                        const amount = Math.round(Math.random() * (item.max - item.min) + item.min);
                        this.addToInventory(item.type, amount * 2);
                    });
                    /*setTimeout(() => {
                        this.scene.third.physics.destroy(tt.mesh);
                        this.scene.third.scene.children.splice(this.scene.third.scene.children.indexOf(tt.mesh), 1);
                    }, 5000)*/
                    /*setInterval(() => {
                        console.log(tt.mesh.body);
                    })*/
                    //console.log(this.goal.memory.times, this.memory.tasks[0].parameters[0])
                    this.goal.memory.times--;
                    if (this.memory.tasks.length > 0 && this.memory.tasks[0].name === "mineRocks") {
                        this.memory.tasks[0].parameters[0]--;
                    }
                    if (document.getElementById("taskList")) {
                        this.generateTaskList(document.getElementById("taskList"));
                    }
                    if (this.goal.memory.times > 0) {
                        this.goal.memory.startedGathering = false;
                    } else {
                        if (this.memory.tasks.length > 0 && this.memory.tasks[0].name === "mineRocks") {
                            this.memory.tasks.shift();
                            if (document.getElementById("taskList")) {
                                this.generateTaskList(document.getElementById("taskList"));
                            }
                        }
                        this.goal = { type: "wander", memory: {} };
                        this.state = { type: "idle", memory: {} };
                    }
                }
            }
        });
        this.initiated = true;
        //this.mesh.animation.play("walk");
    }
}

Agent.displayName = {
    "wander": "Wander",
    "idle": "Idle",
    "followPath": "Follow Path",
    "goHome": "Go Home",
    "gather": "Gather",
    "storeInventory": "Store Inventory",
    "equipItem": "Equip Item",
    "chopWood": "Chop Wood",
    "chop": "Chop",
    "mineRocks": "Mine Rocks",
    "mine": "Mine",
    "eat": "Eat",
    "cloneSelf": "Clone Self"
}
Agent.classToGather = {
    GrassBlades: [{
        type: "grass",
        min: 1,
        max: 3
    }],
    Rocks: [{
        type: "rocks",
        min: 1,
        max: 2,
    }],
    Seashell: [{
        type: "shell",
        min: 1,
        max: 1
    }],
    Bush: [{
        type: "wood",
        min: 0,
        max: 1
    }, {
        type: "grass",
        min: 1,
        max: 4
    }],
    Tree: [{
        type: "wood",
        min: 2,
        max: 4
    }, {
        type: "grass",
        min: 4,
        max: 7
    }]
}
Agent.typeToClass = {
    "Grass": GrassBlades,
    "Rocks": Rocks,
    "Seashells": Seashell,
    "Bushes": Bush
}