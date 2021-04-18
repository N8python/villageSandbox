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
        });
        this.spawnChance = 0.00001;
    }
    init() {
        this.mesh = this.scene.third.physics.add.box({ x: this.x, y: this.y, z: this.z }, { phong: { color: 'darkgreen' } });
        this.mesh.body.setCollisionFlags(2);
    }
    spawn(world) {
        const tiles = world.tiles.filter(tile => tile.contains(this.x, this.z) && tile !== this);
        if (tiles.length === 0) {
            let seed = Math.random();
            if (seed < 0.65) {
                const theBlades = new GrassBlades({
                    x: this.x,
                    z: this.z,
                    rotation: Math.floor(Random.random(0, 4)) * Math.PI / 2,
                    scene: this.scene,
                    model: this.scene.grassModel
                });
                theBlades.init();
                world.tiles.push(theBlades);
            } else if (seed < 0.85) {
                const theBush = new Bush({
                    x: this.x,
                    z: this.z,
                    rotation: Math.floor(Random.random(0, 4)) * Math.PI / 2,
                    scene: this.scene,
                    model: this.scene.bushModel
                });
                theBush.init();
                world.tiles.push(theBush);
            } else {
                const theTree = new Tree({
                    x: this.x,
                    z: this.z,
                    rotation: Math.floor(Random.random(0, 4)) * Math.PI / 2,
                    scene: this.scene,
                    model: this.scene.treeModel
                });
                theTree.init();
                world.tiles.push(theTree);
            }
        }
    }
    static fromJSON({
        x,
        y,
        z,
        rotation
    }) {
        return new Grass({
            x,
            y,
            z,
            rotation,
            scene: mainScene
        })
    }
}