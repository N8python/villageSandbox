class Seashell extends Entity {
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
        this.cost = 0;
    }
    init() {
        this.mesh = new ExtendedObject3D();
        this.mesh.add(this.model.clone());
        this.mesh.position.set(this.x, this.y, this.z);
        this.mesh.rotation.y = this.rotation;
        this.mesh.scale.set(0.0025, 0.0025, 0.0025);
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
        return new Seashell({
            x,
            y,
            z,
            rotation,
            scene: mainScene,
            model: mainScene.seashellModel
        })
    }
}