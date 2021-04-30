const eatGoal = {
    name: "eat",
    update(agent) {
        if (agent.goal.memory.source === "inventory") {
            agent.eat(({
                "Tubers": "tuber"
            })[agent.goal.memory.itemType], agent.goal.memory.times);
            this.removeFromTaskList(agent);
            agent.goal = { type: "wander", memory: {} };
            agent.state = { type: "idle", memory: {} };
        } else if (agent.goal.memory.source === "chest") {
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
        }
    },
    onPathEnd(agent) {
        if (agent.goal.memory.source === "chest") {
            const itemType = ({
                "Tubers": "tuber"
            })[agent.goal.memory.itemType];
            const amount = Math.min(agent.goal.memory.times, agent.memory.chest.amountInInventory(itemType));
            if (amount > 0) {
                agent.addToInventory(itemType, amount);
                agent.memory.chest.addToInventory(itemType, -amount);
                agent.eat(itemType, amount);
                this.removeFromTaskList(agent);
                agent.goal = { type: "wander", memory: {} };
                agent.state = { type: "idle", memory: {} };
            } else {
                this.removeFromTaskList(agent);
                agent.goal = { type: "wander", memory: {} };
                agent.state = { type: "idle", memory: {} };
            }
        }
    }
}
addRemoveFromTaskList(eatGoal);