class Bird {
    constructor({
        x,
        y = 3,
        z,
        target,
        scene
    }) {
        this.x = x;
        this.y = y;
        this.z = z;
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
            rotation: this.rotation,
            targetRotation: this.targetRotation,
            rotationZ: this.rotationZ,
            targetRotationZ: this.targetRotationZ,
            rotationX: this.rotationX,
            targetRotationX: this.targetRotationX,
            memory: this.memory,
            type: "Bird"
        }
    }
    static fromJSON(json) {
        const b = new Bird({
            x: json.x,
            y: json.y,
            z: json.z,
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
                this.x += 0.01 * Math.sin(angleToTarget);
                this.z += 0.01 * Math.cos(angleToTarget);
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
                    this.y += 0.05;
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
                    this.y -= 0.01;
                }
                if (this.memory.target.y > this.y) {
                    this.y += 0.01;
                }
                //this.y -= 0.01;
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
        this.scene.third.add.existing(this.mesh);
        this.initiated = true;
    }
}