p5.disableFriendlyErrors = true;
const Random = new p5(p => {
    p.setup = () => {
        p.createCanvas(0, 0);
    }
});
const displayName = {
    GrassBlades: "Grass Blades",
    Agent: "Robot",
    WorkBench: "Work Bench"
}
let mainScene;
//let testPath;
//let testCircle;
let selected;
let selectedMesh;
let tick = 0;
Random.randomSeed(1);
Random.noiseSeed(20);
class MainScene extends Scene3D {
    constructor() {
        super({ key: 'MainScene' });
    }

    async init() {
        this.accessThirdDimension();
    }

    async create() {
        //this.third.physics.debug.enable()
        this.third.warpSpeed("-ground", "-sky", "-light");
        //this.tiles = [];
        this.waterTextures = await Promise.all([
            this.third.load.texture('./assets/images/waterNormal.jpeg'),
            this.third.load.texture('./assets/images/waterNormal2.jpeg')
        ]);
        this.third.load.preload("tree", "./assets/models/tree.fbx");
        this.third.load.preload("grass", "./assets/models/grass.fbx");
        this.third.load.preload("bush", "./assets/models/bush.fbx");
        this.third.load.preload("rocks", "./assets/models/rocks.fbx");
        this.third.load.preload("copperOre", "./assets/models/copperOre.fbx");
        this.third.load.preload("ironOre", "./assets/models/ironOre.fbx");
        this.third.load.preload("seashell", "./assets/models/seashell.fbx");
        this.third.load.preload("house", "./assets/models/house.fbx");
        this.third.load.preload("robot", "./assets/characters/robot/model.fbx");
        this.third.load.preload("chest", "./assets/models/chest.fbx");
        this.third.load.preload("workbench", "./assets/models/workbench.fbx");
        this.third.load.preload("handaxe", "./assets/models/handaxe.fbx");
        this.third.load.preload("pickaxe", "./assets/models/pickaxe.fbx");
        this.third.load.preload("copperAxe", "./assets/models/copperAxe.fbx");
        this.third.load.preload("copperPickaxe", "./assets/models/copperPickaxe.fbx");
        this.third.load.preload("ironAxe", "./assets/models/ironAxe.fbx");
        this.third.load.preload("ironPickaxe", "./assets/models/ironPickaxe.fbx");
        this.treeModel = await this.third.load.fbx("tree");
        this.grassModel = await this.third.load.fbx("grass");
        this.bushModel = await this.third.load.fbx("bush");
        this.rockModel = await this.third.load.fbx("rocks");
        this.copperoreModel = await this.third.load.fbx("copperOre");
        this.ironoreModel = await this.third.load.fbx("ironOre");
        this.seashellModel = await this.third.load.fbx("seashell");
        this.houseModel = await this.third.load.fbx("house");
        this.agentModel = await this.third.load.fbx("robot");
        this.chestModel = await this.third.load.fbx("chest");
        this.workbenchModel = await this.third.load.fbx("workbench");
        this.mainWorld = new World();
        mainScene = this;
        if (localProxy.scene) {
            World.generateWorldFromJSON(this.mainWorld, localProxy.scene);
        } else {
            World.generateWorld(this.mainWorld, {
                scene: this,
                seed: 20
            });
        }
        selectedMesh = this.third.add.box({ x: 1000, y: 1000, z: 1000 }, { phong: { color: "orange", opacity: 0.5, transparent: true } });
        selectedMesh.castShadow = false;
        selectedMesh.recieveShadow = false;
        const skydom = new THREEx.DayNight.Skydom();
        this.third.scene.add(skydom.object3d);
        const starField = new THREEx.DayNight.StarField();
        this.third.scene.add(starField.object3d);
        const sunSphere = new THREEx.DayNight.SunSphere()
        this.third.scene.add(sunSphere.object3d);
        const sunLight = new THREEx.DayNight.SunLight();
        this.third.scene.add(sunLight.object3d);
        this.skyDome = skydom;
        this.starField = starField;
        this.sunSphere = sunSphere;
        this.sunLight = sunLight;
        const intensity = 0.2;
        const hemisphereLight = this.third.lights.hemisphereLight({ skyColor: 0xffffff, groundColor: 0x000000, intensity })
        const ambientLight = this.third.lights.ambientLight({ color: 0xffffff, intensity })
            /*const directionalLight = this.third.lights.directionalLight({ color: 0xffffff, intensity })

            directionalLight.position.set(100, 200, 50)
            const d = 20
            directionalLight.shadow.camera.top = d
            directionalLight.shadow.camera.bottom = -d
            directionalLight.shadow.camera.left = -d
            directionalLight.shadow.camera.right = d

            directionalLight.shadow.mapSize.set(1024, 1024)*/
        this.hemisphereLight = hemisphereLight;
        this.ambientLight = ambientLight;
        this.sunAngle = 0;
        if (localProxy.scene) {
            this.sunAngle = localProxy.scene.sunAngle;
        }
        this.initiated = true;
        /*testPath = Pathfind.findPath({ world: mainScene.mainWorld, start: { x: -16, z: -16 }, end: { x: 15, z: 15 } });*/
        //testCircle = this.third.add.sphere({ x: -16, y: 1, z: -16, radius: 0.5 }, { phong: { color: 'red' } })
    }
    update(time, delta) {
        if (!this.initiated) {
            return;
        }
        this.sunAngle += delta / (5 * 60 * 1000) * Math.PI * 2;
        if (this.sunAngle >= Math.PI) {
            this.sunAngle = -Math.PI;
        }
        this.skyDome.update(this.sunAngle);
        this.starField.update(this.sunAngle);
        this.sunSphere.update(this.sunAngle);
        this.sunLight.update(this.sunAngle);
        /*if (this.sunAngle < 0) {
            this.hemisphereLight.intensity = 0.33;
            this.ambientLight.intensity = 0.33;
        } else {
            this.hemisphereLight.intensity = 0.33 - ;
            this.ambientLight.intensity = 0.33 - ;
        }*/
        this.hemisphereLight.intensity = 0.25 + Math.max(Math.min(-this.sunAngle, 0.08), 0);
        this.ambientLight.intensity = 0.25 + Math.max(Math.min(-this.sunAngle, 0.08), 0);
        tick++;
        /*if (tick % 15 === 0 && testPath.length > 0) {
            const coord = testPath.shift();
            testCircle.position.x = coord.x;
            testCircle.position.z = coord.z;
        }*/
        if (this.mainWorld) {
            this.mainWorld.update();
        }
        if (selected) {
            displayInfoFor(selected);
        }
    }
    toJSON() {
        return {
            world: this.mainWorld.toJSON(),
            sunAngle: this.sunAngle
        }
    }
}

const config = {
    type: Phaser.WEBGL,
    transparent: true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth * Math.max(1, window.devicePixelRatio / 2),
        height: window.innerHeight * Math.max(1, window.devicePixelRatio / 2)
    },
    scene: [MainScene],
    ...Canvas({ antialias: true })
}
document.onclick = (e) => {
    const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    const mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    if (mouseX > 0.63) {
        return;
    }
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera({ x: mouseX, y: -mouseY }, mainScene.third.camera);
    //console.log(mainScene.mainWorld.tiles.filter(tile => tile.mesh && tile instanceof Entity).map(tile => tile.mesh.children[0]))
    //const intersects = raycaster.intersectObjects(mainScene.mainWorld.tiles.filter(tile => tile.mesh).map(tile => tile.mesh));
    /*const intersectables = [...mainScene.mainWorld.agents, ...mainScene.mainWorld.tiles]
    intersects.forEach(intersect => {
        const intersectObj = intersectables.find(i => i.mesh === intersect.object);
        console.log(intersectObj);
    })*/
    /*testCircle.position.x = intersects[0].point.x;
    testCircle.position.y = intersects[0].point.y;
    testCircle.position.z = intersects[0].point.z;
    const agentBox = new THREE.Box3().setFromObject(mainScene.mainWorld.agents[0].mesh);
    console.log(raycaster.ray.intersectsBox(agentBox))*/
    const meshes = mainScene.mainWorld.tiles.filter(tile => tile.mesh).map(tile => tile.mesh).concat(mainScene.mainWorld.agents.filter(agent => agent.mesh).map(agent => agent.mesh));
    let minDist = Infinity;
    let chosenMesh = undefined;
    meshes.forEach(mesh => {
        const meshBox = new THREE.Box3().setFromObject(mesh);
        if (raycaster.ray.intersectsBox(meshBox)) {
            const distanceFromSource = mainScene.third.camera.position.distanceTo(mesh.position);
            if (distanceFromSource < minDist) {
                minDist = distanceFromSource;
                chosenMesh = mesh;
            }
        }
    });
    const chosen = [...mainScene.mainWorld.tiles, ...mainScene.mainWorld.agents].find(x => x.mesh === chosenMesh);
    if (chosen) {
        selected = chosen;
    } else {
        selected = undefined;
        selectedMesh.position.x = 1000;
        selectedMesh.position.y = 1000;
        selectedMesh.position.z = 1000;
    }
}
window.addEventListener('load', () => {
    enable3d(() => new Phaser.Game(config)).withPhysics('./lib')
})