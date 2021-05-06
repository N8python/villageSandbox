class Airship {
    constructor({
        x,
        y = 2,
        z,
        rotation = 0,
        passengers = 0,
        merchant = false,
        invader = false,
        timeLeft = Infinity,
        target,
        passengerData,
        scene
    }) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.rotation = rotation;
        this.targetRotation = rotation;
        this.passengers = passengers;
        this.passengerMeshes = [];
        this.memory = {
            agents: []
        };
        if (target) {
            this.memory.target = target;
        }
        this.memory.timeLeft = timeLeft;
        this.merchant = merchant;
        if (this.merchant) {
            this.memory.trades = [];
            for (let i = 0; i < 3; i++) {
                this.memory.trades.push(randomTrade());
            }
        }
        this.invader = invader;
        if (this.invader) {
            this.memory.passengerData = passengerData;
        }
        this.scene = scene;
        this.rotationBob = 0;
        this.yBob = 0;
    }
    toJSON() {
        return {
            x: this.x,
            y: this.y,
            z: this.z,
            rotation: this.rotation,
            passengers: this.passengers,
            merchant: this.merchant,
            invader: this.invader,
            memory: this.memory,
            type: "Airship"
        }
    }
    static fromJSON(json) {
        const a = new Airship({
            x: json.x,
            y: json.y,
            z: json.z,
            rotation: json.rotation,
            passengers: json.passengers,
            merchant: json.merchant,
            invader: json.invader,
            scene: mainScene
        })
        a.memory = json.memory;
        return a;
    }
    update() {
        if (!this.initiated) {
            return;
        }
        if (this.chest === undefined) {
            this.scene.mainWorld.tiles.forEach(tile => {
                if (tile instanceof Chest) {
                    this.chest = tile;
                }
            })
        }
        this.mesh.position.x = this.x;
        this.mesh.position.y = this.y + this.yBob;
        this.mesh.position.z = this.z;
        this.mesh.rotation.y = this.rotation + this.rotationBob;
        this.yBob += 0.025 * Math.sin(performance.now() / 1000);
        this.rotationBob += 0.002 * Math.sin((performance.now() + 24543) / 1000);
        this.memory.timeLeft -= mainScene.delta;
        let backOffset = 6 + 2 * Math.sin((performance.now() + 32843) / 25)
            /*this.jet1.emitters[0].position.x = this.x - backOffset * Math.sin(this.rotation + Math.PI / 2) + 1.5 * Math.sin(this.rotation);
            this.jet1.emitters[0].position.y = this.y + 2;
            this.jet1.emitters[0].position.z = this.z - backOffset * Math.cos(this.rotation + Math.PI / 2) + 1.5 * Math.cos(this.rotation);
            this.jet1.emitters[0].currentEmitTime = 0;
            this.jet2.emitters[0].position.x = this.x - backOffset * Math.sin(this.rotation + Math.PI / 2) - 1.5 * Math.sin(this.rotation);
            this.jet2.emitters[0].position.y = this.y + 2;
            this.jet2.emitters[0].position.z = this.z - backOffset * Math.cos(this.rotation + Math.PI / 2) - 1.5 * Math.cos(this.rotation);
            this.jet2.emitters[0].currentEmitTime = 0;*/
        if (this.memory.target !== undefined) {
            const angleToTarget = Math.atan2(this.memory.target.x - this.x, this.memory.target.z - this.z);
            if (this.memory.timeLeft > 0) {
                this.targetRotation = angleToTarget + Math.PI / 2;
                this.rotation += angleDifference(this.rotation, this.targetRotation) / 10;
            }
            if ((Math.hypot(this.memory.target.x - this.x, this.memory.target.z - this.z) > 0.15) || this.memory.timeLeft < 0) {
                this.x += 0.1 * Math.sin(this.memory.timeLeft < 0 ? this.rotation + Math.PI / 2 : angleToTarget) * ((mainScene.delta / 16.66));
                this.z += 0.1 * Math.cos(this.memory.timeLeft < 0 ? this.rotation + Math.PI / 2 : angleToTarget) * ((mainScene.delta / 16.66));
            } else if (this.invader) {
                if (!this.memory.droppedOff) {
                    this.memory.droppedOff = true;
                    let dropPointX = Math.round(this.x);
                    let dropPointZ = Math.round(this.z);
                    if (dropPointX < -16) {
                        dropPointX = -16;
                    }
                    if (dropPointX >= 16) {
                        dropPointX = 15;
                    }
                    if (dropPointZ < -16) {
                        dropPointZ = -16;
                    }
                    if (dropPointZ >= 16) {
                        dropPointZ = 15;
                    }
                    let placeAxis = "z";
                    if (dropPointZ < dropPointX) {
                        placeAxis = "x";
                    }
                    let placePoint = -1;
                    this.passengers = 1;
                    for (let i = 0; i < this.memory.passengerData.length; i++) {
                        this.passengerMeshes[i + 1].visible = false;
                        const data = this.memory.passengerData[i];
                        let attemptedPoint;
                        do {
                            placePoint++;
                            attemptedPoint = { x: dropPointX, z: dropPointZ };
                            if (placeAxis === "x") {
                                attemptedPoint.x += placePoint;
                            } else if (placeAxis === "z") {
                                attemptedPoint.z += placePoint;
                            }
                        } while (mainScene.mainWorld.tiles.some(tile => (tile instanceof Rocks || tile instanceof House || tile instanceof Bush || tile instanceof Tree || tile instanceof Chest || tile instanceof WorkBench) && tile.contains(attemptedPoint.x, attemptedPoint.z)));
                        const theAgent = new Agent({
                            x: attemptedPoint.x,
                            z: attemptedPoint.z,
                            scene: mainScene,
                            model: mainScene.agentModel,
                            team: "invader"
                        });
                        if (data.handItem) {
                            theAgent.memory.handItem = { type: data.handItem, amount: 1 };
                        }
                        theAgent.init();
                        mainScene.mainWorld.agents.push(theAgent);
                    }
                }
            }
            if (this.memory.timeLeft < -5000) {
                this.scene.mainWorld.agents.splice(this.scene.mainWorld.agents.indexOf(this), 1);
                this.scene.third.scene.children.splice(this.scene.third.scene.children.indexOf(this.mesh), 1);
            }
        }
    }
    async init() {
        const model = await this.scene.third.load.gltf("airship");
        model.scene.scale.set(0.003, 0.003, 0.003);
        this.mesh = new ExtendedObject3D();
        this.mesh.position.x = this.x;
        this.mesh.position.y = this.y;
        this.mesh.position.z = this.z;
        this.mesh.rotation.y = this.rotation;
        this.mesh.add(model.scene);
        this.scene.third.add.existing(this.mesh);
        //this.jet1 = await loadEmitter("smoke");
        //this.jet2 = await loadEmitter("smoke");
        if (this.passengers >= 1) {
            const passenger = await this.createPassenger();
            passenger.position.y = 3.5;
            passenger.position.x = 5.5;
            passenger.rotation.y = Math.PI / 2;
            this.passengerMeshes.push(passenger);
            this.mesh.add(passenger);
        }
        if (this.passengers >= 2) {
            const passenger = await this.createPassenger();
            passenger.position.y = 2.75;
            //passenger.position.x = 5.5;
            passenger.rotation.y = Math.PI / 2;
            this.passengerMeshes.push(passenger);
            this.mesh.add(passenger);
        }
        if (this.passengers >= 3) {
            const passenger = await this.createPassenger();
            passenger.position.y = 2.75;
            passenger.position.x = 2.5;
            passenger.rotation.y = Math.PI / 2;
            this.passengerMeshes.push(passenger);
            this.mesh.add(passenger);
        }
        if (this.passengers >= 4) {
            const passenger = await this.createPassenger();
            passenger.position.y = 2.75;
            passenger.position.x = -2.5;
            passenger.rotation.y = Math.PI / 2;
            this.passengerMeshes.push(passenger);
            this.mesh.add(passenger);
        }
        if (this.passengers >= 5) {
            const passenger = await this.createPassenger();
            passenger.position.y = 4.25;
            passenger.position.x = -5.65;
            passenger.rotation.y = -Math.PI / 2;
            this.passengerMeshes.push(passenger);
            this.mesh.add(passenger);
        }
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                //const oldMat = child.material;
                //child.material = new THREE.MeshPhongMaterial({ color: oldMat.color });
            }
        });
        this.initiated = true;
    }
    getInfo() {
        if (this.memory.timeLeft !== Infinity) {
            return `Time Left: ${Math.round(this.memory.timeLeft / 1000)} seconds.`
        }
        return "";
    }
    makeGui(rootNode) {
        if (this.merchant) {
            rootNode.innerHTML = `<h3 style="color:#ecddba">Trades:</h3>`;
            this.tradingMenu(rootNode, this.memory.trades, this.chest);
        }
    }
    tradingMenu(node, trades, chest) {
        node.innerHTML = `<h3 style="color:#ecddba">Trades: </h3>`;
        trades.forEach(recipe => {
            const recipeDiv = document.createElement("div");
            const inputsDiv = document.createElement("div");
            inputsDiv.style.width = "20%";
            inputsDiv.style.display = "inline-block";
            [recipe.in].forEach(input => {
                inputsDiv.innerHTML += `<img src="assets/images/items/${input.type}.png" style="width:32px"> <span style="color:#ecddba">${input.amount}</span><br>`;
            })
            recipeDiv.appendChild(inputsDiv);
            const craftDiv = document.createElement("div");
            craftDiv.style.width = "10%";
            craftDiv.style.display = "inline-block";
            craftDiv.style.color = "#ecddba";
            //craftDiv.style.position = "relative";
            //craftDiv.style.bottom = "32px";
            craftDiv.style.right = "10px";
            craftDiv.innerHTML = "➡️➡️";
            recipeDiv.appendChild(craftDiv);
            const outputsDiv = document.createElement("div");
            outputsDiv.style.width = "20%";
            outputsDiv.style.display = "inline-block";
            outputsDiv.style.position = "relative";
            outputsDiv.style.left = "8px";
            [recipe.out].forEach(output => {
                outputsDiv.innerHTML += `<img src="assets/images/items/${output.type}.png" style="width:32px"> <span style="color:#ecddba">${output.amount}</span><br>`;
            });
            recipeDiv.appendChild(outputsDiv);
            node.appendChild(recipeDiv);
            const craftButton = document.createElement("button");
            craftButton.innerHTML = "Trade";
            node.appendChild(craftButton);
            craftButton.onclick = () => {
                const canCraft = [recipe.in].every(input => {
                    const chestItem = chest.inventory.find(item => item.type === input.type);
                    if (chestItem && chestItem.amount >= input.amount) {
                        return true;
                    }
                    return false;
                });
                if (canCraft && this.memory.timeLeft > 0) {
                    [recipe.in].forEach(input => {
                        const chestItem = chest.inventory.find(item => item.type === input.type);
                        chestItem.amount -= input.amount;
                    });
                    [recipe.out].forEach(output => {
                        chest.addToInventory(output.type, output.amount);
                    });
                    this.memory.timeLeft -= 10000;
                    this.memory.timeLeft = Math.max(this.memory.timeLeft, 0);
                }
            }
            setInterval(() => {
                const canCraft = [recipe.in].every(input => {
                    const chestItem = chest.inventory.find(item => item.type === input.type);
                    if (chestItem && chestItem.amount >= input.amount) {
                        return true;
                    }
                    return false;
                });
                if (canCraft && this.memory.timeLeft > 0) {
                    craftButton.removeAttribute("disabled");
                } else {
                    craftButton.setAttribute("disabled", "true");
                }
            }, 500);
            node.appendChild(document.createElement("br"));
            node.appendChild(document.createElement("br"));
        })
    }
    async createPassenger() {
        const model = await this.scene.third.load.fbx("robot");
        model.scale.set(0.004, 0.004, 0.004);
        const containerMesh = new ExtendedObject3D();
        containerMesh.add(model);
        this.scene.third.animationMixers.add(containerMesh.animationMixer);
        const animsToLoad = ["idle"];
        for (const anim of animsToLoad) {
            const animText = await fetch(`./assets/characters/robot/animations/${anim}.json`);
            const animJson = await animText.json();
            const clip = THREE.AnimationClip.parse(animJson);
            clip.animName = anim;
            containerMesh.animation.add(anim, clip);
        }
        containerMesh.animation.play("idle");
        return containerMesh;
    }
}