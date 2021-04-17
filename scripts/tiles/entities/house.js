class House extends Entity {
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
        this.width = 2;
        this.height = 2;
    }
    entrance() {
        if (this.rotation === 3 * Math.PI / 2 || this.rotation === 0) {
            return {
                x: Math.round(this.x + 2 * Math.sin(this.rotation + Math.PI / 2)),
                z: Math.round(this.z + 2 * Math.cos(this.rotation + Math.PI / 2))
            }
        } else {
            return {
                x: Math.round(this.x + Math.sin(this.rotation + Math.PI / 2)),
                z: Math.round(this.z + Math.cos(this.rotation + Math.PI / 2))
            }
        }
    }
    init() {
        this.mesh = new ExtendedObject3D();
        this.mesh.add(this.model.clone());
        this.mesh.position.set(this.x + 0.5, this.y, this.z + 0.5);
        this.mesh.rotation.y = this.rotation;
        this.mesh.scale.set(1, 1, 1);
        this.scene.third.add.existing(this.mesh);
    }
    static fromJSON({
        x,
        y,
        z,
        rotation
    }) {
        return new House({
            x,
            y,
            z,
            rotation,
            scene: mainScene,
            model: mainScene.houseModel
        })
    }
}