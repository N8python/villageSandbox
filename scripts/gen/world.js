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
            if (tile instanceof Entity) {
                tile.mesh.traverse(child => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
            }
        });
        const blocks = [];
        for (let x = -16; x < 16; x++) {
            blocks[x + 16] = [];
            for (let z = -16; z < 16; z++) {
                blocks[x + 16][z + 16] = world.tiles.find(tile => !(tile instanceof Entity) && tile.x === x && tile.z === z).constructor.name;
            }
        }
        const blockColors = {
            "Dirt": new THREE.Color(0x9b7653),
            "Grass": new THREE.Color(0x006400),
            "Sand": new THREE.Color(0xC2B280),
            "Stone": new THREE.Color(0x808080),
            "Water": new THREE.Color(0x1da2d8)
        }
        const data = new Uint8Array(3 * 1024);
        for (let i = 0; i < 1024; i++) {
            const x = Math.floor(i / 32);
            const z = i - x * 32;
            const block = blocks[x][z];
            const color = blockColors[block];
            const stride = i * 3;
            data[stride] = color.r * 255;
            data[stride + 1] = color.g * 255;
            data[stride + 2] = color.b * 255;
        }
        const tex = new THREE.DataTexture(data, 32, 32, THREE.RGBFormat);
        tex.center = new THREE.Vector2(0.5, 0.5);
        tex.rotation = -Math.PI / 2;
        const sides = new THREE.DataTexture(dataFromColor({
            r: blockColors["Dirt"].r * 255,
            g: blockColors["Dirt"].g * 255,
            b: blockColors["Dirt"].b * 255,
            width: 16,
            height: 16
        }), 16, 16, THREE.RGBFormat);
        const textureCube = mainScene.third.misc.textureCube([sides, sides, tex, tex, sides, sides]);
        world.ground = mainScene.third.add.box({ x: -0.5, y: 0.5, z: -0.5, width: 32, depth: 32 }, { custom: textureCube.materials });
        // world.ground.material = new THREE.MeshPhongMaterial({ map: tex });
        world.ground.receiveShadow = true;
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
            if (tile instanceof Entity) {
                tile.mesh.traverse(child => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
            }
        });
        const blocks = [];
        for (let x = -16; x < 16; x++) {
            blocks[x + 16] = [];
            for (let z = -16; z < 16; z++) {
                blocks[x + 16][z + 16] = world.tiles.find(tile => !(tile instanceof Entity) && tile.x === x && tile.z === z).constructor.name;
            }
        }
        const blockColors = {
            "Dirt": new THREE.Color(0x9b7653),
            "Grass": new THREE.Color(0x006400),
            "Sand": new THREE.Color(0xC2B280),
            "Stone": new THREE.Color(0x808080),
            "Water": new THREE.Color(0x1da2d8)
        }
        const data = new Uint8Array(3 * 1024);
        for (let i = 0; i < 1024; i++) {
            const x = Math.floor(i / 32);
            const z = i - x * 32;
            const block = blocks[x][z];
            const color = blockColors[block];
            const stride = i * 3;
            data[stride] = color.r * 255;
            data[stride + 1] = color.g * 255;
            data[stride + 2] = color.b * 255;
        }
        const tex = new THREE.DataTexture(data, 32, 32, THREE.RGBFormat);
        tex.center = new THREE.Vector2(0.5, 0.5);
        tex.rotation = -Math.PI / 2;
        const sides = new THREE.DataTexture(dataFromColor({
            r: blockColors["Dirt"].r * 255,
            g: blockColors["Dirt"].g * 255,
            b: blockColors["Dirt"].b * 255,
            width: 16,
            height: 16
        }), 16, 16, THREE.RGBFormat);
        const textureCube = mainScene.third.misc.textureCube([sides, sides, tex, tex, sides, sides]);
        world.ground = mainScene.third.add.box({ x: -0.5, y: 0.5, z: -0.5, width: 32, depth: 32 }, { custom: textureCube.materials });
        // world.ground.material = new THREE.MeshPhongMaterial({ map: tex });
        world.ground.receiveShadow = true;
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
    dayEnd() {
        if (Math.random() < 0.5) {
            let x = 0;
            let z = 0;
            if (Math.random() < 0.5) {
                if (Math.random() < 0.5) {
                    x = -18;
                } else {
                    x = 18;
                }
            } else {
                if (Math.random() < 0.5) {
                    z = -18;
                } else {
                    z = 18;
                }
            }
            const airship = new Airship({ x: z !== 0 ? -z : x, z: x !== 0 ? -x : z, target: { x, y: 1, z }, y: 1, rotation: x !== 0 ? Math.PI / 2 : 0, passengers: 1, scene: mainScene, merchant: true, timeLeft: 90000 });
            airship.init();
            mainScene.mainWorld.agents.push(airship)
        }
    }
}

const dataFromColor = ({
    r,
    g,
    b,
    width,
    height
}) => {

    const size = width * height;
    const data = new Uint8Array(3 * size);

    for (let i = 0; i < size; i++) {

        const stride = i * 3;

        data[stride] = r;
        data[stride + 1] = g;
        data[stride + 2] = b;

    }
    return data;
}