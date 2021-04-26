class Airship {
    constructor({
        x,
        y = 2,
        z,
        rotation = 0,
        passengers = 0,
        scene
    }) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.rotation = rotation;
        this.passengers = passengers;
        this.passengerMeshes = [];
        this.memory = {
            agents: []
        };
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
            scene: mainScene
        })
        a.memory = json.memory;
        return a;
    }
    update() {
        if (!this.initiated) {
            return;
        }
        this.mesh.position.x = this.x;
        this.mesh.position.y = this.y + this.yBob;
        this.mesh.position.z = this.z;
        this.mesh.rotation.y = this.rotation + this.rotationBob;
        this.yBob += 0.025 * Math.sin(performance.now() / 1000);
        this.rotationBob += 0.002 * Math.sin((performance.now() + 24543) / 1000);
        let backOffset = 6 + 2 * Math.sin((performance.now() + 32843) / 25)
        this.jet1.emitters[0].position.x = this.x - backOffset * Math.sin(this.rotation + Math.PI / 2) + 1.5 * Math.sin(this.rotation);
        this.jet1.emitters[0].position.y = this.y + 2;
        this.jet1.emitters[0].position.z = this.z - backOffset * Math.cos(this.rotation + Math.PI / 2) + 1.5 * Math.cos(this.rotation);
        this.jet1.emitters[0].currentEmitTime = 0;
        this.jet2.emitters[0].position.x = this.x - backOffset * Math.sin(this.rotation + Math.PI / 2) - 1.5 * Math.sin(this.rotation);
        this.jet2.emitters[0].position.y = this.y + 2;
        this.jet2.emitters[0].position.z = this.z - backOffset * Math.cos(this.rotation + Math.PI / 2) - 1.5 * Math.cos(this.rotation);
        this.jet2.emitters[0].currentEmitTime = 0;
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
        this.jet1 = await loadEmitter("smoke");
        this.jet2 = await loadEmitter("smoke");
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