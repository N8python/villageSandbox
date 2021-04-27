class Dirt extends Tile {
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
        //this.mesh = this.scene.third.physics.add.box({ x: this.x, y: this.y, z: this.z }, { phong: { color: '#9b7653' } });
        //this.mesh.body.setCollisionFlags(2);
    }
    static fromJSON({
        x,
        y,
        z,
        rotation
    }) {
        return new Dirt({
            x,
            y,
            z,
            rotation,
            scene: mainScene
        })
    }
}