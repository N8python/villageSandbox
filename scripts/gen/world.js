class World {
    constructor(tiles = []) {
        this.tiles = [];
        this.agents = [];
        this.initiated = false;
    }
    static generateWorld(world, {
        scene,
        seed,
        width = 32,
        height = 32
    }) {
        Random.randomSeed(seed);
        Random.noiseSeed(seed);
        for (let x = -height / 2; x < height / 2; x++) {
            for (let z = -width / 2; z < width / 2; z++) {
                const grassiness = Random.noise((z + 16) / 5, (x + 16) / 5);
                let tile;
                if (grassiness > 0.5) {
                    tile = new Grass({
                        x,
                        z,
                        scene
                    });
                } else {
                    tile = new Dirt({
                        x,
                        z,
                        scene
                    });
                }
                const stoniness = Random.noise((z + 16 + 64) / 5, (x + 16 + 64) / 7.5);
                if (stoniness > 0.6) {
                    tile = new Stone({
                        x,
                        z,
                        scene
                    });
                }
                const wateriness = Random.noise((z + 16 + 128) / 5, (x + 16 + 128) / 7.5);
                if (wateriness > 0.6) {
                    tile = new Sand({
                        x,
                        z,
                        scene
                    });
                }
                if (wateriness > 0.65) {
                    tile = new Water({
                        x,
                        z,
                        scene,
                        tex1: scene.waterTextures[0],
                        tex2: scene.waterTextures[1]
                    });
                }
                tile.init();
                world.tiles.push(tile);
                if (tile instanceof Grass) {
                    const treeiness = Random.noise((z + 16 + 124), (x + 16 + 124));
                    if (treeiness > 0.75) {
                        const theTree = new Tree({
                            x,
                            z,
                            rotation: Math.floor(Random.random(0, 4)) * Math.PI / 2,
                            scene,
                            model: scene.treeModel
                        });
                        theTree.init();
                        world.tiles.push(theTree);
                    } else if (treeiness > 0.6) {
                        const theBlades = new GrassBlades({
                            x,
                            z,
                            rotation: Math.floor(Random.random(0, 4)) * Math.PI / 2,
                            scene,
                            model: scene.grassModel
                        });
                        theBlades.init();
                        world.tiles.push(theBlades);
                    } else if (treeiness < 0.25) {
                        const theBush = new Bush({
                            x,
                            z,
                            rotation: Math.floor(Random.random(0, 4)) * Math.PI / 2,
                            scene,
                            model: scene.bushModel
                        });
                        theBush.init();
                        world.tiles.push(theBush);
                    }
                }
                if (tile instanceof Stone) {
                    const rockiness = Random.noise((z + 256 + 800), (x + 256 + 800));
                    if (rockiness > 0.65) {
                        const theRocks = new Rocks({
                            x,
                            z,
                            rotation: Math.floor(Random.random(0, 4)) * Math.PI / 2,
                            scene,
                            model: scene.rockModel
                        });
                        theRocks.init();
                        world.tiles.push(theRocks);
                    }
                }
                if (tile instanceof Sand) {
                    const rockiness = Random.noise((z + 16 + 512), (x + 16 + 512));
                    if (rockiness > 0.65) {
                        const theSeashell = new Seashell({
                            x,
                            z,
                            rotation: Math.floor(Random.random(0, 4)) * Math.PI / 2,
                            scene,
                            model: scene.seashellModel
                        });
                        theSeashell.init();
                        world.tiles.push(theSeashell);
                    }
                }
            }
        }
        const theHouse = new House({
            x: 0,
            z: 0,
            rotation: Math.PI / 2,
            scene,
            model: scene.houseModel
        });
        theHouse.init();
        world.tiles.push(theHouse);
        const theChest = new Chest({
            x: -3,
            z: 0,
            rotation: Math.PI / 2,
            scene,
            model: scene.chestModel
        });
        theChest.init();
        world.tiles.push(theChest);
        const theBench = new WorkBench({
            x: 3,
            z: 0,
            rotation: Math.PI / 2,
            scene,
            model: scene.workbenchModel
        });
        theBench.init();
        world.tiles.push(theBench);
        const theAgent = new Agent({
            x: 3,
            z: 3,
            scene,
            model: scene.agentModel
        });
        theAgent.init();
        world.agents.push(theAgent);
        world.tiles.forEach(tile => {
            tile.mesh.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            if (!(tile instanceof Entity)) {
                tile.mesh.traverse(child => {
                    if (child.isMesh) {
                        child.castShadow = false;
                        child.receiveShadow = true;
                    }
                });
            }
        });
        world.initiated = true;
    }
    static generateWorldFromJSON(world, json) {
        json.world.tiles.forEach(tile => {
            const t = typeToConstructor[tile.type].fromJSON(tile);
            t.init();
            world.tiles.push(t);
        });
        json.world.agents.forEach(agent => {
            const a = typeToConstructor[agent.type].fromJSON(agent);
            a.init();
            world.agents.push(a);
        });
        world.tiles.forEach(tile => {
            tile.mesh.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            if (!(tile instanceof Entity)) {
                tile.mesh.traverse(child => {
                    if (child.isMesh) {
                        child.castShadow = false;
                        child.receiveShadow = true;
                    }
                });
            }
        });
        world.initiated = true;
    }
    update() {
        this.agents.forEach(agent => {
            agent.update();
        });
        this.tiles.forEach(tile => {
            if (tile.update) {
                tile.update();
            }
            if (Math.random() < tile.spawnChance) {
                tile.spawn(this);
            }
        })
    }
    toJSON() {
        return {
            tiles: this.tiles.map(tile => tile.toJSON()),
            agents: this.agents.map(agent => agent.toJSON())
        }
    }
}