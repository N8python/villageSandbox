const chopWoodGoal = {
    name: "chopWood",
    update(agent) {
        if (!agent.goal.memory.startedGathering) {
            agent.goal.memory.startedGathering = true;
            const { chosen, path } = agent.findPathToNearest(Tree);
            agent.goal.memory.targetTile = chosen;
            if (path.length > 0 && agent.memory.handItem && (agent.memory.handItem.type === "handaxe" || agent.memory.handItem.type === "copperAxe" || agent.memory.handItem.type === "ironAxe")) {
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
        agent.state = { type: "chop", memory: {} };
    },
    onAnimationEnd(agent, e) {
        if (e.action.getClip().animName === "chop") {
            agent.memory.physicalEnergy -= 0.5;
            let chance = 0.25;
            if (agent.memory.handItem.type === "copperAxe") {
                chance = 0.35;
            }
            if (agent.memory.handItem.type === "ironAxe") {
                chance = 0.5;
            }
            if (Math.random() < chance) {
                const lootTable = Agent.classToGather[agent.goal.memory.targetTile.constructor.name];
                lootTable.forEach(item => {
                    let amount = Math.round(Math.random() * (item.max - item.min) + item.min);
                    if (agent.memory.handItem.type === "copperAxe") {
                        amount *= 1.25;
                        amount = Math.round(amount);
                    }
                    if (agent.memory.handItem.type === "ironAxe") {
                        amount *= 1.5;
                        amount = Math.round(amount);
                    }
                    agent.addToInventory(item.type, amount);
                })
                let xNegativeOne = Math.random() * 2 - 1;
                let zNegativeOne = Math.random() * 2 - 1;
                if (agent.goal.memory.targetTile) {
                    agent.goal.memory.targetTile.beginFall(xNegativeOne * 0.1, zNegativeOne * 0.1);
                }
                agent.goal.memory.times--;
                if (agent.memory.tasks.length > 0 && agent.memory.tasks[0].name === "chopWood") {
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

}
addRemoveFromTaskList(chopWoodGoal);