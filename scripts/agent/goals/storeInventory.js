const storeInventoryGoal = {
    name: "storeInventory",
    update(agent) {
        if (!agent.goal.memory.headingToChest) {
            agent.goal.memory.headingToChest = true;
            const path = Pathfind.findPath({ world: agent.scene.mainWorld, start: { x: Math.round(agent.x), z: Math.round(agent.z) }, end: agent.memory.chest.entrance() });
            if (path.length > 0) {
                agent.state = { type: "followPath", memory: {} };
                agent.state.memory.path = path;
            } else {
                agent.goal = { type: "wander", memory: {} };
                this.removeFromTaskList(agent);
            }
        }
    },
    onPathEnd(agent) {
        agent.targetRotation = Math.atan2(agent.memory.chest.x - agent.x, agent.memory.chest.z - agent.z);
        agent.memory.inventory.forEach(item => {
            agent.memory.chest.addToInventory(item.type, item.amount);
        });
        agent.memory.inventory = [];
        this.removeFromTaskList(agent);
        agent.goal = { type: "wander", memory: {} };
    }
}
addRemoveFromTaskList(storeInventoryGoal);