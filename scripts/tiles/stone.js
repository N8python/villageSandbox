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
        this.spawnChance = 0.00001;
    }
    init() {
        this.mesh = this.scene.third.physics.add.box({ x: this.x, y: this.y, z: this.z }, { phong: { color: 'grey' } });
        this.mesh.body.setCollisionFlags(2);
    }
    spawn(world) {
        if (mainScene.mainWorld.tiles.filter(x => x instanceof Rocks).length > 35) {
            return;
        }
        const tiles = world.tiles.filter(tile => tile.contains(this.x, this.z) && tile !== this);
        if (tiles.length === 0) {
            let seed = Math.random();
            let kind = "stone";
            if (seed < 0.35) {
                kind = "copperOre";
            }
            if (seed < 0.1) {
                kind = "ironOre";
            }
            const theRocks = new Rocks({
                x: this.x,
                z: this.z,
                rotation: Math.floor(Random.random(0, 4)) * Math.PI / 2,
                scene: this.scene,
                model: this.scene.rockModel,
                kind
            });
            theRocks.init();
            world.tiles.push(theRocks);
        }
    }
    static fromJSON({
        x,
        y,
        z,
        rotation,
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