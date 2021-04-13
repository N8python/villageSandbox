class Sand extends Tile {
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
        this.mesh = this.scene.third.physics.add.box({ x: this.x, y: this.y, z: this.z }, { phong: { color: '#C2B280' } });
        this.mesh.body.setCollisionFlags(2);
    }
}