class Bird {
    constructor({
        x,
        y = 3,
        z,
        target,
        velocity = 1,
        carryingAgent = false,
        deleteOnTarget = false,
        scene,
    }) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.velocity = velocity;
        this.deleteOnTarget = deleteOnTarget;
        this.carryingAgent = carryingAgent;
        this.scene = scene;
        this.rotation = 0;
        this.targetRotation = 0;
        this.rotationZ = 0;
        this.targetRotationZ = 0;
        this.rotationX = 0;
        this.targetRotationX = 0;
        this.memory = {
            health: 25,
            target
        };
        this.initiated = false;
        this.yAdjCooldown = 0;
    }
    getInfo() {
        return `
        Health: ${this.memory.health} / 25
        `
    }
    toJSON() {
        return {
            x: this.x,
            y: this.y,
            z: this.z,
            velocity: this.velocity,
            rotation: this.rotation,
            targetRotation: this.targetRotation,
            rotationZ: this.rotationZ,
            targetRotationZ: this.targetRotationZ,
            rotationX: this.rotationX,
            targetRotationX: this.targetRotationX,
            deleteOnTarget: this.deleteOnTarget,
            carryingAgent: this.carryingAgent,
            memory: this.memory,
            type: "Bird"
        }
    }
    static fromJSON(json) {
        const b = new Bird({
            x: json.x,
            y: json.y,
            z: json.z,
            velocity: json.velocity,
            deleteOnTarget: json.deleteOnTarget,
            carryingAgent: json.carryingAgent,
            scene: mainScene,
        });
        b.rotation = json.rotation;
        b.targetRotation = json.targetRotation;
        if (json.rotationZ !== undefined) {
            b.rotationZ = json.rotationZ;
        }
        if (json.targetRotationZ !== undefined) {
            b.targetRotationZ = json.targetRotationZ;
        }
        if (json.rotationX !== undefined) {
            b.rotationX = json.rotationX;
        }
        if (json.targetRotationX !== undefined) {
            b.targetRotationX = json.targetRotationX;
        }
        b.memory = json.memory;
        return b;
    }
    update() {
        this.yAdjCooldown--;
        if (!this.initiated) {
            return;
        }
        this.mesh.position.set(this.x, this.y, this.z);
        this.mesh.rotation.y = this.rotation;
        this.mesh.rotation.z = this.rotationZ;
        this.mesh.rotation.x = this.rotationX;
        if (this.memory.target === undefined) {
            this.memory.target = { x: 0, y: 0, z: 0 };
        } else {
            const angleToTarget = Math.atan2(this.memory.target.x - this.x, this.memory.target.z - this.z);
            this.targetRotation = angleToTarget;
            this.rotation += angleDifference(this.rotation, this.targetRotation + Math.PI) / 10;
            this.rotationZ += angleDifference(this.rotationZ, this.targetRotationZ) / 10;
            this.rotationX += angleDifference(this.rotationX, this.targetRotationX) / 10;
            if (Math.hypot(this.memory.target.x - this.x, this.memory.target.z - this.z) > 0.15) {
                this.x += 0.01 * Math.sin(angleToTarget) * this.velocity * ((mainScene.delta / 16.66));
                this.z += 0.01 * Math.cos(angleToTarget) * this.velocity * ((mainScene.delta / 16.66));
            } else if (Math.abs(this.memory.target.y - this.y) <= 0.15) {
                if (this.deleteOnTarget) {
                    this.scene.mainWorld.agents.splice(this.scene.mainWorld.agents.indexOf(this), 1);
                    this.scene.third.scene.children.splice(this.scene.third.scene.children.indexOf(this.mesh), 1);
                }
            }
            const meshes = mainScene.mainWorld.tiles.filter(tile => tile.mesh).map(tile => tile.mesh).concat(mainScene.mainWorld.agents.filter(agent => agent.mesh && agent !== this).map(agent => agent.mesh));
            let touchingMesh = false;
            let somethingDown = false;
            meshes.forEach(mesh => {
                const meshBox = new THREE.Box3().setFromObject(mesh);
                if (meshBox.containsPoint(new THREE.Vector3(this.x, this.y - 0.25, this.z))) {
                    touchingMesh = true;
                    this.yAdjCooldown = 15;
                    //this.targetRotationX += 0.01;
                    this.y += 0.05 * this.velocity * ((mainScene.delta / 16.66));
                }
                if (meshBox.containsPoint(new THREE.Vector3(this.x, this.y - 0.35, this.z))) {
                    somethingDown = true;
                }
            });
            if (!touchingMesh && this.yAdjCooldown < 1 && !somethingDown) {
                if (this.targetRotationX > 0) {
                    //this.targetRotationX -= 0.01;
                }
                if (this.targetRotationX < 0) {
                    //this.targetRotationX += 0.01;
                }
                if (this.memory.target.y < this.y) {
                    this.y -= 0.01 * this.velocity * this.velocity * ((mainScene.delta / 16.66));
                }
                if (this.memory.target.y > this.y) {
                    this.y += 0.01 * this.velocity * this.velocity * ((mainScene.delta / 16.66));
                }
                //this.y -= 0.01;
            }
        }
        if (this.memory.dropPoint !== undefined) {
            if (Math.hypot(this.memory.dropPoint.x - this.x, this.memory.dropPoint.z - this.z) < 0.25 && this.carryMesh.visible === true) {
                this.carryMesh.visible = false;
                const theAgent = new Agent({
                    x: this.memory.dropPoint.x,
                    z: this.memory.dropPoint.z,
                    scene: this.scene,
                    model: this.scene.agentModel
                });
                theAgent.init();
                theAgent.memory.physicalEnergy -= 25;
                theAgent.memory.mentalEnergy -= 25;
                this.scene.mainWorld.agents.push(theAgent);
            }
        }
    }
    async init() {
        const model = await this.scene.third.load.gltf("bird");
        this.mesh = new ExtendedObject3D();
        this.mesh.add(model.scene);
        this.mesh.position.set(this.x, this.y, this.z);
        this.mesh.scale.set(0.25, 0.25, 0.25);
        this.mesh.rotation.y = this.rotation;
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
        this.scene.third.animationMixers.add(this.mesh.animationMixer);
        this.mesh.animation.add("flap", model.animations[0]);
        this.mesh.animation.play("flap");
        if (this.carryingAgent) {
            const model = await this.scene.third.load.fbx("robot");
            model.scale.set(0.0175, 0.0175, 0.0175);
            model.position.y = -9;
            model.rotation.y = this.rotation + Math.PI;
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
                this.carryMesh = containerMesh;
            }
            containerMesh.animation.play("idle");
            this.mesh.add(containerMesh);
        }
        this.scene.third.add.existing(this.mesh);
        this.initiated = true;
    }
}