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
        ["handaxe", "pickaxe", "copperAxe", "copperPickaxe", "ironAxe", "ironPickaxe"].forEach(item => {
            if (this.models[item + "Model"]) {
                this.models[item + "Model"].visible = false;
                if (this.memory.handItem) {
                    if (this.memory.handItem.type === item) {
                        this.models[item + "Model"].visible = true;
                    }
                }
            }
        });

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
        this.updateStateManager();
        this.updateGoalManager();
        this.stateManager.update(this);
        this.goalManager.update(this);
    }
    updateStateManager() {
        this.stateManager = states.find(state => state.name === this.state.type);
    }
    updateGoalManager() {
        this.goalManager = goals.find(goal => goal.name === this.goal.type);
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
                if (path.length < bestPathLength && path.length !== 0) {
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
            if (this.goalManager.onAnimationEnd) {
                this.goalManager.onAnimationEnd(this, e);
                this.updateStateManager();
                this.updateGoalManager();
            }
        });
        this.initiated = true;
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