const equipItemGoal = {
    name: "equipItem",
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
        if (agent.memory.tasks.length > 0 && agent.memory.tasks[0].name === "equipItem") {
            const itemType = ({
                "Handaxe": "handaxe",
                "Pickaxe": "pickaxe",
                "Copper Axe": "copperAxe",
                "Copper Pickaxe": "copperPickaxe",
                "Copper Sword": "copperSword",
                "Iron Axe": "ironAxe",
                "Iron Pickaxe": "ironPickaxe",
                "Iron Sword": "ironSword"
            })[agent.memory.tasks[0].parameters[0]];
            if (agent.memory.chest.amountInInventory(itemType) > 0) {
                if (agent.memory.handItem && agent.memory.handItem.type) {
                    agent.memory.chest.addToInventory(agent.memory.handItem.type, 1);
                }
                agent.memory.handItem = { type: itemType, amount: 1 };
                agent.memory.chest.addToInventory(itemType, -1);
            }
            agent.memory.tasks.shift();
            if (document.getElementById("taskList")) {
                agent.generateTaskList(document.getElementById("taskList"));
            }
        }
        agent.goal = { type: "wander", memory: {} };
    }
}
addRemoveFromTaskList(equipItemGoal);