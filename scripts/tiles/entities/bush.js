class Bush extends Entity {
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
        this.model.children[1].material = new THREE.MeshPhongMaterial({ color: 0x005F00 });
        this.rotation = rotation;
    }
    init() {
        this.mesh = new ExtendedObject3D();
        this.mesh.add(this.model.clone());
        this.mesh.position.set(this.x, this.y, this.z);
        this.mesh.rotation.y = this.rotation;
        this.mesh.scale.set(0.5, 0.5, 0.5);
        //this.mesh.children[0].material = new THREE.MeshPhongMaterial({ color: 0x006400 })
        this.scene.third.add.existing(this.mesh);
        this.mesh.matrixAutoUpdate = false;
        this.mesh.updateMatrix();
    }
    static fromJSON({
        x,
        y,
        z,
        rotation
    }) {
        return new Bush({
            x,
            y,
            z,
            rotation,
            scene: mainScene,
            model: mainScene.bushModel
        })
    }
}