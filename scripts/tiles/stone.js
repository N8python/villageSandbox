class Stone extends Tile {
    constructor({
        x,
        y = 0.5,
        z,
        scene
    }) {
        super({
            x,
            y,
            z,
            scene
        });
        this.cost = 0;
    }
    init() {
        this.mesh = this.scene.third.physics.add.box({ x: this.x, y: this.y, z: this.z }, { phong: { color: 'grey' } });
        this.mesh.body.setCollisionFlags(2);
    }
    static fromJSON({
        x,
        y,
        z,
        rotation
    }) {
        return new Stone({
            x,
            y,
            z,
            rotation,
            scene: mainScene
        })
    }
}