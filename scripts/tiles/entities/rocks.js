class Rocks extends Entity {
    constructor({
        x,
        y = 1,
        z,
        scene,
        model,
        rotation,
        kind = "stone"
    }) {
        super({
            x,
            y,
            z,
            scene
        });
        this.model = model;
        this.rotation = rotation;
        this.kind = kind;
        if (this.kind === "copperOre") {
            this.model = this.scene.copperoreModel;
        } else if (this.kind === "ironOre") {
            this.model = this.scene.ironoreModel;
        }
    }
    init() {
        this.mesh = new ExtendedObject3D();
        this.mesh.add(this.model.clone());
        this.mesh.position.set(this.x, this.y, this.z);
        this.mesh.rotation.y = this.rotation;
        this.mesh.scale.set(0.01, 0.01, 0.01);
        this.scene.third.add.existing(this.mesh);
        this.mesh.matrixAutoUpdate = false;
        this.mesh.updateMatrix();
    }
    toJSON() {
        const json = super.toJSON();
        json.kind = this.kind;
        return json;
    }
    static fromJSON({
        x,
        y,
        z,
        rotation,
        kind = "stone"
    }) {
        return new Rocks({
            x,
            y,
            z,
            rotation,
            scene: mainScene,
            model: mainScene.rockModel,
            kind
        })
    }
}