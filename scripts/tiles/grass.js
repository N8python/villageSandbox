class Grass extends Tile {
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
        })
    }
    init() {
        this.mesh = this.scene.third.physics.add.box({ x: this.x, y: this.y, z: this.z }, { phong: { color: 'darkgreen' } });
        this.mesh.body.setCollisionFlags(2);
    }
}