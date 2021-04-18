const pos = ({ x, z }) => `${x},${z}`;
const neighbors = ({ x, z }) => {
    return [
        { x: x + 1, z },
        { x: x - 1, z },
        { x, z: z + 1 },
        { x, z: z - 1 }
    ].filter(({ x, z }) => x >= -16 && z >= -16 && x < 16 && z < 16);
}
const Pathfind = {
    findPath({
        world,
        start,
        end
    }) {
        if (start.x === end.x && start.z === end.z) {
            return [{ x: start.x, z: start.z }];
        }
        const frontier = new TinyQueue([{ x: start.x, z: start.z, cost: 0 }], function(a, b) {
            return b.cost - a.cost;
        });
        const visited = {};
        const cameFrom = {};
        const costSoFar = {};
        cameFrom[pos({ x: start.x, z: start.z })] = null;
        costSoFar[pos({ x: start.x, z: start.z })] = 0;
        let iterations = 0;
        while (frontier.length !== 0 && iterations < 1000) {
            const current = frontier.pop();
            if (pos(current) === pos(end)) {
                break;
            }
            neighbors(current).forEach(neighbor => {
                if (world.tiles.some(tile => (tile instanceof Rocks || tile instanceof House || tile instanceof Bush || tile instanceof Tree || tile instanceof Chest || tile instanceof WorkBench) && tile.contains(neighbor.x, neighbor.z))) {
                    return;
                }
                const graphCost = world.tiles.filter(tile => tile.contains(neighbor.x, neighbor.z)).reduce((t, v) => t + v.cost, 0);
                const newCost = costSoFar[pos(current)] + graphCost;
                if ((costSoFar[pos(neighbor)] === undefined) || newCost < costSoFar[pos(neighbor)]) {
                    costSoFar[pos(neighbor)] = newCost;
                    frontier.push({ x: neighbor.x, z: neighbor.z, cost: newCost - Math.hypot(end.z - neighbor.z, end.x - neighbor.x) });
                    visited[pos(neighbor)] = true;
                    cameFrom[pos(neighbor)] = current;
                }
            });
            iterations++;
        }
        if (iterations >= 1000) {
            return [];
        }
        let current = {
            x: end.x,
            z: end.z
        };
        const path = [];
        let iterationsBack = 0;
        while (pos(current) !== pos(start) && iterationsBack < 1000) {
            path.push({
                x: current.x,
                z: current.z
            });
            current = cameFrom[pos(current)];
            iterationsBack++;
        }
        if (iterationsBack >= 1000) {
            return [];
        }
        path.reverse();
        return path;
    }
}