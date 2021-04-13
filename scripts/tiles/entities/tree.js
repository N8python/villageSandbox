class Tree extends Entity {
    constructor({
        x,
        y = 1,
        z,
        scene,
        model,
        rotation
    }) {
        super({
            x,
            y,
            z,
            scene
        });
        this.model = model;
        this.rotation = rotation;
    }
    init() {
        this.mesh = new ExtendedObject3D();
        this.mesh.add(this.model.clone());
        this.mesh.position.set(this.x, this.y, this.z);
        this.mesh.rotation.y = this.rotation;
        //this.mesh.scale.set(0.0075, 0.0075, 0.0075);
        this.scene.third.add.existing(this.mesh);
        /*this.scene.third.physics.add.existing(this.mesh, {
            shape: 'compound',
            compound: [
                { shape: 'box', width: 0.5, height: 2.5, depth: 0.5, y: 1.25 },
                { shape: "sphere", radius: 1, y: 2.75 }
            ]
        });*/
    }
    beginFall(zRot, xRot) {
        this.zRot = zRot;
        this.xRot = xRot;
        this.ignorePathfinding = true;
    }
    update() {
        /*if (this.mesh.body) {
            this.mesh.body.setAngularVelocity(this.mesh.body.angularVelocity.x * 0.9, this.mesh.body.angularVelocity.y * 0.9, this.mesh.body.angularVelocity.z * 0.9);
        }*/
        if (this.xRot && this.zRot) {
            if (Math.abs(this.mesh.rotation.x) < Math.PI / 2) {
                this.mesh.rotation.x += this.xRot;
            }
            if (Math.abs(this.mesh.rotation.z) < Math.PI / 2) {
                this.mesh.rotation.z += this.zRot;
            }
            let remove = !(Math.abs(this.mesh.rotation.x) < Math.PI / 2 && Math.abs(this.mesh.rotation.z) < Math.PI / 2);
            if (remove) {
                this.scene.mainWorld.tiles.splice(this.scene.mainWorld.tiles.indexOf(this), 1);
                this.scene.third.scene.children.splice(this.scene.third.scene.children.indexOf(this.mesh), 1);
            }
        }
    }
}