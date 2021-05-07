const gatherGoal = {
    name: "gather",
    update(agent) {
        if (!agent.goal.memory.startedGathering) {
            agent.goal.memory.startedGathering = true;
            const { chosen, path } = agent.findPathToNearest(Agent.typeToClass[agent.goal.memory.itemType]);
            agent.goal.memory.targetTile = chosen;
            if (path.length > 0) {
                agent.state = { type: "followPath", memory: {} };
                agent.state.memory.path = path;
            } else {
                this.removeFromTaskList(agent);
                agent.goal = { type: "wander", memory: {} };
            }
        }
    },
    onPathEnd(agent) {
        agent.state = { type: "gather", memory: {} };
    },
    onAnimationEnd(agent, e) {
        if (e.action.getClip().animName === "gather") {
            agent.memory.physicalEnergy -= 0.5;
            agent.goal.memory.targetTile.mesh.visible = false;
            agent.scene.mainWorld.tiles.splice(agent.scene.mainWorld.tiles.indexOf(agent.goal.memory.targetTile), 1);
            agent.scene.third.scene.children.splice(agent.scene.third.scene.children.indexOf(agent.goal.memory.targetTile.mesh), 1);
            const lootTable = Agent.classToGather[agent.goal.memory.targetTile.constructor.name];
            lootTable.forEach(item => {
                const amount = Math.round(Math.random() * (item.max - item.min) + item.min);
                agent.addToInventory(item.type, amount);
            })
            if (agent.goal.memory.targetTile.constructor.name === "GrassBlades") {
                if (Math.random() < 0.25) {
                    agent.addToInventory("tuber", 1);
                }
            }
            agent.goal.memory.times--;
            if (agent.memory.tasks.length > 0 && agent.memory.tasks[0].name === "gather") {
                agent.memory.tasks[0].parameters[1]--;
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
addRemoveFromTaskList(gatherGoal);