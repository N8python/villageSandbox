const mineRocksGoal = {
    name: "mineRocks",
    update(agent) {
        if (!agent.goal.memory.startedGathering) {
            agent.goal.memory.startedGathering = true;
            const { chosen, path } = agent.findPathToNearest(Rocks);
            agent.goal.memory.targetTile = chosen;
            if (path.length > 0 && agent.memory.handItem && (agent.memory.handItem.type === "pickaxe" || agent.memory.handItem.type === "copperPickaxe" || agent.memory.handItem.type === "ironPickaxe")) {
                agent.state = { type: "followPath", memory: {} };
                agent.state.memory.path = path;
            } else {
                this.removeFromTaskList(agent);
                agent.goal = { type: "wander", memory: {} };
                agent.state = { type: "idle", memory: {} };
            }
        }
    },
    onPathEnd(agent) {
        agent.state = { type: "mine", memory: {} };
    },
    onAnimationEnd(agent, e) {
        if (e.action.getClip().animName === "mine") {
            agent.memory.physicalEnergy -= 1;
            if (agent.goal.memory.targetTile.kind === "ironOre") {
                agent.addToInventory("iron", 1);
            }
            if (agent.goal.memory.targetTile.kind === "copperOre") {
                agent.addToInventory("copper", 1);
            }
            let iterations = 1;
            if (agent.memory.handItem.type === "copperPickaxe") {
                iterations = 2;
            }
            if (agent.memory.handItem.type === "ironPickaxe") {
                iterations = 3;
            }
            for (let i = 0; i < iterations; i++) {
                if (Math.random() < 0.1) {
                    agent.addToInventory("iron", 1);
                }
                if (Math.random() < 0.25) {
                    agent.addToInventory("copper", 1);
                }
            }
            agent.goal.memory.targetTile.mesh.visible = false;
            agent.scene.mainWorld.tiles.splice(agent.scene.mainWorld.tiles.indexOf(agent.goal.memory.targetTile), 1);
            agent.scene.third.scene.children.splice(agent.scene.third.scene.children.indexOf(agent.goal.memory.targetTile.mesh), 1);
            const lootTable = Agent.classToGather[agent.goal.memory.targetTile.constructor.name];
            lootTable.forEach(item => {
                const amount = Math.round(Math.random() * (item.max - item.min) + item.min);
                agent.addToInventory(item.type, amount * 2);
            });
            agent.goal.memory.times--;
            if (agent.memory.tasks.length > 0 && agent.memory.tasks[0].name === "mineRocks") {
                agent.memory.tasks[0].parameters[0]--;
            }
            if (document.getElementById("taskList") && selected === agent) {
                agent.generateTaskList(document.getElementById("taskList"));
            }
            if (agent.goal.memory.times > 0) {
                agent.goal.memory.startedGathering = false;
            } else {
                this.removeFromTaskList(agent);
                agent.goal = { type: "wander", memory: {} };
                agent.state = { type: "idle", memory: {} };
            }
        }
    }
}
addRemoveFromTaskList(mineRocksGoal);