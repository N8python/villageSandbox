class Chest extends Entity {
    constructor({
        x,
        y = 2,
        z,
        scene,
        model,
        rotation
    }) {
        super({
            x,
            y,
            z,
            scene
        });
        this.model = model;
        this.rotation = rotation;
        this.width = 2;
        this.height = 2;
        this.inventory = [{
            type: "grass",
            amount: 0
        }, {
            type: "rocks",
            amount: 0
        }, {
            type: "shell",
            amount: 0,
        }, {
            type: "wood",
            amount: 0
        }];
    }
    makeGui(rootNode) {
        rootNode.innerHTML = verticalInventory(this.inventory);
    }
    entrance() {
        if (this.rotation === 3 * Math.PI / 2 || this.rotation === 0) {
            return {
                x: Math.round(this.x + 2 * Math.sin(this.rotation + Math.PI / 2)),
                z: Math.round(this.z + 2 * Math.cos(this.rotation + Math.PI / 2))
            }
        } else {
            return {
                x: Math.round(this.x + Math.sin(this.rotation + Math.PI / 2)),
                z: Math.round(this.z + Math.cos(this.rotation + Math.PI / 2))
            }
        }
    }
    addToInventory(item, amt) {
        if (amt === 0) {
            return;
        }
        const itemSelected = this.inventory.find(i => i.type === item);
        if (itemSelected) {
            itemSelected.amount += amt;
        } else {
            this.inventory.push({
                type: item,
                amount: amt
            })
        }
        if (document.getElementById("unitGui") && selected === this) {
            document.getElementById("unitGui").innerHTML = verticalInventory(this.inventory);
        }
    }
    amountInInventory(item) {
        const itemSelected = this.inventory.find(i => i.type === item);
        if (itemSelected) {
            return itemSelected.amount;
        }
        return 0;
    }
    init() {
        this.mesh = new ExtendedObject3D();
        this.mesh.add(this.model.clone());
        this.mesh.position.set(this.x + 0.5, this.y, this.z + 0.5);
        this.mesh.rotation.y = this.rotation;
        this.mesh.scale.set(0.01, 0.01, 0.01);
        this.scene.third.add.existing(this.mesh);
        this.mesh.matrixAutoUpdate = false;
        this.mesh.updateMatrix();
    }
    toJSON() {
        const json = super.toJSON();
        json.inventory = this.inventory;
        return json;
    }
    static fromJSON({
        x,
        y,
        z,
        inventory,
        rotation
    }) {
        const chest = new Chest({
            x,
            y,
            z,
            rotation,
            scene: mainScene,
            model: mainScene.chestModel
        });
        chest.inventory = inventory;
        return chest;
    }
}