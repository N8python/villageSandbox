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
        this.spawnChance = 0.00001;
    }
    init() {
        //this.tex1.needsUpdate = true;
        //this.tex2.needsUpdate = true;
        //this.mesh = this.scene.third.physics.add.box({ x: this.x, y: this.y, z: this.z }, { phong: { color: '#1da2d8' } });
        //this.mesh.body.setCollisionFlags(2);
    }
    spawn(world) {
        if (mainScene.mainWorld.tiles.filter(x => x instanceof Seashell).length > 20) {
            return;
        }
        const sandTiles = world.tiles.filter(tile => Math.hypot(this.x - tile.x, this.z - tile.z) <= 1 && tile instanceof Sand);
        if (sandTiles.length > 0) {
            const chosenTile = sandTiles[Math.floor(sandTiles.length * Math.random())];
            const tiles = world.tiles.filter(tile => tile.contains(chosenTile.x, chosenTile.z) && tile !== chosenTile);
            if (tiles.length === 0) {
                const theSeashell = new Seashell({
                    x: chosenTile.x,
                    z: chosenTile.z,
                    rotation: Math.floor(Random.random(0, 4)) * Math.PI / 2,
                    scene: this.scene,
                    model: this.scene.seashellModel
                });
                theSeashell.init();
                world.tiles.push(theSeashell);
            }
        }
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