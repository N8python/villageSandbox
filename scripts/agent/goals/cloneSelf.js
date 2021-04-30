const cloneSelfGoal = {
    name: "cloneSelf",
    update(agent) {
        if (agent.memory.physicalEnergy > 95 && agent.memory.mentalEnergy > 95) {
            agent.memory.physicalEnergy -= 25;
            agent.memory.mentalEnergy -= 25;
            const tileTarget = agent.adjacentTile();
            let start = {};
            let end = {};
            let seed = Math.random();
            if (seed < 0.25) {
                start = { x: tileTarget.x - 24, y: 4, z: tileTarget.z };
                end = { x: tileTarget.x + 24, y: 4, z: tileTarget.z };
            } else if (seed < 0.5) {
                start = { x: tileTarget.x + 24, y: 4, z: tileTarget.z };
                end = { x: tileTarget.x - 24, y: 4, z: tileTarget.z };
            } else if (seed < 0.75) {
                start = { x: tileTarget.x, y: 4, z: tileTarget.z + 24 };
                end = { x: tileTarget.x, y: 4, z: tileTarget.z - 24 };
            } else {
                start = { x: tileTarget.x, y: 4, z: tileTarget.z - 24 };
                end = { x: tileTarget.x, y: 4, z: tileTarget.z + 24 };
            }
            const theBird = new Bird({
                x: start.x,
                y: start.y,
                z: start.z,
                scene: mainScene,
                deleteOnTarget: true,
                carryingAgent: true,
                velocity: 5
            });
            theBird.init();
            theBird.memory.target = end;
            theBird.memory.dropPoint = {...tileTarget };
            agent.scene.mainWorld.agents.push(theBird);
        }
        this.removeFromTaskList(agent);
        agent.goal = { type: "wander", memory: {} };
        agent.state = { type: "idle", memory: {} };
    }
}
addRemoveFromTaskList(cloneSelfGoal);