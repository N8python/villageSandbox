class Tile {
    constructor({
        x,
        y,
        z,
        scene
    }) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.scene = scene;
        this.width = 1;
        this.height = 1;
        this.cost = 1;
    }
    contains(x, z) {
        return x >= this.x && x < this.x + this.height && z >= this.z && z < this.z + this.width;
    }
    entrance(origin) {
        const spots = [
            { x: this.x + 1, z: this.z },
            { x: this.x, z: this.z + 1 },
            { x: this.x - 1, z: this.z },
            { x: this.x, z: this.z - 1 }
        ].filter(spot => {
            return !this.scene.mainWorld.tiles.some(tile => (tile instanceof Rocks || tile instanceof House || tile instanceof Bush || tile instanceof Tree || tile instanceof Chest || tile instanceof WorkBench) && tile.contains(spot.x, spot.z))
        });
        if (origin) {
            let minDist = Infinity;
            let chosen;
            spots.forEach(spot => {
                if (Math.hypot(spot.x - origin.x, spot.z - origin.z) < minDist) {
                    minDist = Math.hypot(spot.x - origin.x, spot.z - origin.z);
                    chosen = spot;
                }
            });
            return chosen;
        }
        return spots[Math.floor(Math.random() * spots.length)];
    }
}