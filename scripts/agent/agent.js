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
            tasks: [],
            inventory: [],
            handItem: null
        };
        this.models = {};
        this.goal = { type: "wander", memory: {} };
        this.state = { type: "idle", memory: {} };
        this.initiated = false;
    }
    update() {
        if (this.memory.handItem && document.getElementById("handItem")) {
            document.getElementById("handItem").innerHTML = `<img src="assets/images/items/${this.memory.handItem.type}.png" style="width:32px">`;
        } else if (document.getElementById("handItem")) {
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
                    this.x += 0.025;
                }
                if (this.state.memory.goal.x < this.x) {
                    this.x -= 0.025;
                }
                if (this.state.memory.goal.z > this.z) {
                    this.z += 0.025;
                }
                if (this.state.memory.goal.z < this.z) {
                    this.z -= 0.025;
                }
                if (Math.abs(this.state.memory.goal.z - this.z) + Math.abs(this.state.memory.goal.x - this.x) <= 0.05) {
                    this.x = this.state.memory.goal.x;
                    this.z = this.state.memory.goal.z;
                    this.state.memory.goal = undefined;
                    if (Math.hypot(this.x - this.memory.home.x, this.z - this.memory.home.z) > 8 && this.scene.sunAngle < 0) {
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
                        const itemType = this.memory.tasks[0].parameters[0].toLowerCase();
                        if (this.memory.chest.amountInInventory(itemType) > 0) {
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
        if (this.goal.type === "wander") {
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
                if (this.memory.tasks[0].name === "gather" && !this.memory.tasks[0].doing) {
                    this.memory.tasks[0].doing = true;
                    this.goal = { type: "gather", memory: { itemType: this.memory.tasks[0].parameters[0], times: this.memory.tasks[0].parameters[1] } };
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
                if (path.length > 0 && this.memory.handItem && this.memory.handItem.type === "handaxe") {
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
                }
            }
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
            Health: ${this.memory.health} / 100 <br>
            Physical: ${this.memory.physicalEnergy} / 100 <br>
            Mental: ${this.memory.mentalEnergy} / 100
        `
    }
    makeGui(rootNode) {
        rootNode.innerHTML = `
        <div style="border: 2px solid black;padding: 4px;width:60%;">
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
        let chosen;
        let minDist = Infinity;
        targetTiles.forEach(tile => {
            if (Math.hypot(tile.x - this.x, tile.z - this.z) < minDist) {
                chosen = tile;
                minDist = Math.hypot(tile.x - this.x, tile.z - this.z);
            }
        })
        if (chosen) {
            const entrance = chosen.entrance({ x: this.x, z: this.z });
            if (entrance === undefined) {
                return {
                    chosen: undefined,
                    path: []
                };
            }
            const path = Pathfind.findPath({ world: this.scene.mainWorld, start: { x: Math.round(this.x), z: Math.round(this.z) }, end: entrance });
            return {
                chosen,
                path
            };
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
        if (document.getElementById("unitGui") && document.getElementById("inventory")) {
            document.getElementById("inventory").innerHTML = verticalInventory(this.memory.inventory);
        }
    }
    async init() {
        const model = await this.scene.third.load.fbx("robot");
        const handaxeModel = await this.scene.third.load.fbx("handaxe");
        handaxeModel.scale.set(200, 200, 200);
        handaxeModel.castShadow = true;
        this.models.handaxeModel = handaxeModel;
        let added = false;
        model.traverse(child => {
                if (child.name === 'mixamorigRightHand' && !added) {
                    //console.log("YAY")
                    //child.add(this.scene.third.add.box({ width: 20, height: 20, depth: 20 }));
                    child.add(handaxeModel);
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
        /*this.scene.third.load.fbx(`./assets/characters/robot/Stable Sword Outward Slash (1).fbx`).then(object => {
            console.log(JSON.stringify(object.animations[0]));
        });*/

        this.scene.third.animationMixers.add(this.mesh.animationMixer);
        const animsToLoad = ["idle", "walk", "gather", "chop"];
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
                    this.goal.memory.targetTile.mesh.visible = false;
                    this.scene.mainWorld.tiles.splice(this.scene.mainWorld.tiles.indexOf(this.goal.memory.targetTile), 1);
                    this.scene.third.scene.children.splice(this.scene.third.scene.children.indexOf(this.goal.memory.targetTile.mesh), 1);
                    const lootTable = Agent.classToGather[this.goal.memory.targetTile.constructor.name];
                    lootTable.forEach(item => {
                        const amount = Math.round(Math.random() * (item.max - item.min) + item.min);
                        this.addToInventory(item.type, amount);
                    })
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
                    if (Math.random() < 0.25) {
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
                            const amount = Math.round(Math.random() * (item.max - item.min) + item.min);
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
                        if (document.getElementById("taskList")) {
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
    "chop": "Chop"
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