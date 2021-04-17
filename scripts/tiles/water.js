class Water extends Tile {
    constructor({
        x,
        y = 0.5,
        z,
        scene //,
        //tex1,
        //tex2
    }) {
        super({
            x,
            y,
            z,
            scene
        });
        //this.tex1 = tex1;
        //this.tex2 = tex2;
        this.cost = -2;
    }
    init() {
        //this.tex1.needsUpdate = true;
        //this.tex2.needsUpdate = true;
        this.mesh = this.scene.third.physics.add.box({ x: this.x, y: this.y, z: this.z }, { phong: { color: '#1da2d8' } });
        this.mesh.body.setCollisionFlags(2);
    }
    static fromJSON({
        x,
        y,
        z,
        rotation
    }) {
        return new Water({
            x,
            y,
            z,
            rotation,
            scene: mainScene
        })
    }
}