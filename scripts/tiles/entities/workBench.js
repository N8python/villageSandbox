class WorkBench extends Entity {
    constructor({
        x,
        y = 1,
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
    makeGui(rootNode) {
        craftingMenu(rootNode, craftingRecipes, this.chest);
    }
    init() {
        this.mesh = new ExtendedObject3D();
        this.mesh.add(this.model.clone());
        this.mesh.position.set(this.x + 0.5, this.y, this.z + 0.5);
        this.mesh.rotation.y = this.rotation;
        this.mesh.scale.set(1, 1, 1);
        this.scene.third.add.existing(this.mesh);
        if (this.chest === undefined) {
            this.scene.mainWorld.tiles.forEach(tile => {
                if (tile instanceof Chest) {
                    this.chest = tile;
                }
            })
        }
    }
    update() {
        if (this.chest === undefined) {
            this.scene.mainWorld.tiles.forEach(tile => {
                if (tile instanceof Chest) {
                    this.chest = tile;
                }
            })
        }
    }
}
const craftingMenu = (node, recipes, chest) => {
    node.innerHTML = "";
    recipes.forEach(recipe => {
        const recipeDiv = document.createElement("div");
        const inputsDiv = document.createElement("div");
        inputsDiv.style.width = "20%";
        inputsDiv.style.display = "inline-block";
        recipe.inputs.forEach(input => {
            inputsDiv.innerHTML += `<img src="assets/images/items/${input.type}.png" style="width:32px"> <span style="color:#ecddba">${input.amount}</span><br>`;
        })
        recipeDiv.appendChild(inputsDiv);
        const craftDiv = document.createElement("div");
        craftDiv.style.width = "10%";
        craftDiv.style.display = "inline-block";
        craftDiv.style.color = "#ecddba";
        craftDiv.style.position = "relative";
        craftDiv.style.bottom = "32px";
        craftDiv.style.right = "10px";
        craftDiv.innerHTML = "➡️➡️";
        recipeDiv.appendChild(craftDiv);
        const outputsDiv = document.createElement("div");
        outputsDiv.style.width = "20%";
        outputsDiv.style.display = "inline-block";
        outputsDiv.style.position = "relative";
        outputsDiv.style.bottom = "16px";
        recipe.outputs.forEach(output => {
            outputsDiv.innerHTML += `<img src="assets/images/items/${output.type}.png" style="width:32px"> <span style="color:#ecddba">${output.amount}</span><br>`;
        });
        recipeDiv.appendChild(outputsDiv);
        node.appendChild(recipeDiv);
        const craftButton = document.createElement("button");
        craftButton.innerHTML = "Craft";
        node.appendChild(craftButton);
        craftButton.onclick = () => {
            const canCraft = recipe.inputs.every(input => {
                const chestItem = chest.inventory.find(item => item.type === input.type);
                if (chestItem && chestItem.amount >= input.amount) {
                    return true;
                }
                return false;
            });
            if (canCraft) {
                recipe.inputs.forEach(input => {
                    const chestItem = chest.inventory.find(item => item.type === input.type);
                    chestItem.amount -= input.amount;
                });
                recipe.outputs.forEach(output => {
                    chest.addToInventory(output.type, output.amount);
                })
            }
        }
        setInterval(() => {
            const canCraft = recipe.inputs.every(input => {
                const chestItem = chest.inventory.find(item => item.type === input.type);
                if (chestItem && chestItem.amount >= input.amount) {
                    return true;
                }
                return false;
            });
            if (canCraft) {
                craftButton.removeAttribute("disabled");
            } else {
                craftButton.setAttribute("disabled", "true");
            }
        }, 500);
        node.appendChild(document.createElement("br"));
    })
}