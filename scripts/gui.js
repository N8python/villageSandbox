let lastTile;
const displayInfoFor = (tile) => {
    if (!tile.mesh) {
        return;
    }
    document.getElementById("unitName").innerHTML = displayName[tile.constructor.name] ? displayName[tile.constructor.name] : tile.constructor.name;
    if (tile.getInfo) {
        document.getElementById("unitInfo").innerHTML = tile.getInfo();
    } else {
        document.getElementById("unitInfo").innerHTML = "";
    }
    if (tile.makeGui && (document.getElementById("unitGui").innerHTML === "" || tile !== lastTile)) {
        tile.makeGui(document.getElementById("unitGui"));
    } else if (!tile.makeGui) {
        document.getElementById("unitGui").innerHTML = "";
    }
    if (tile.createBoundingBox) {
        tile.createBoundingBox(selectedMesh);
    } else {
        const meshBox = new THREE.Box3().setFromObject(tile.mesh);
        const width = meshBox.max.x - meshBox.min.x;
        const height = meshBox.max.y - meshBox.min.y;
        const depth = meshBox.max.z - meshBox.min.z;
        selectedMesh.position.x = meshBox.min.x + width / 2;
        selectedMesh.position.y = meshBox.min.y + height / 2;
        selectedMesh.position.z = meshBox.min.z + depth / 2;
        selectedMesh.scale.set(width, height, depth);
    }
    lastTile = tile;
}

const verticalInventory = (inventory) => {
    let invHTML = "";
    inventory.forEach(item => {
        invHTML += `<img src="assets/images/items/${item.type}.png" style="width:32px"> <span style="color:#ecddba">${item.amount}</span><br>`;
    })
    if (inventory.length === 0) {
        invHTML = `<span style="color:#ecddba">Empty...</span>`;
    }
    return invHTML;
}
const robotDiv = document.getElementById("robotDiv");
const robotTyper = new Typewriter('#robotSpeech', {
    delay: 20
});
robotDiv.style.display = "none";
const displayRobotText = (str) => {
    robotDiv.style.display = "block";
    robotDiv.style.innerHTML = "";
    robotTyper.deleteAll(1).typeString(str).start();
}
document.getElementById("okCool").onclick = () => {
    robotDiv.style.display = "none";
    robotTyper.deleteAll(1).start();
}