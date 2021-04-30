const wanderGoal = {
    name: "wander",
    update(agent) {
        agent.memory.physicalEnergy += 0.002;
        agent.memory.mentalEnergy += 0.001;
        agent.memory.idleTicks++;
        if (agent.state.type === "gather") {
            agent.state = { type: "idle", memory: {} };
        }
        if (Math.random() < 0.005 && agent.state.type === "idle") {
            let chosenSquare;
            for (let i = 0; i < 20; i++) {
                chosenSquare = { x: Math.round(Math.round(agent.x) + Math.random() * 6 - 3), z: Math.round(Math.round(agent.z) + Math.random() * 6 - 3) };
                const occupied = agent.scene.mainWorld.tiles.some(tile => (tile instanceof Rocks || tile instanceof House || tile instanceof WorkBench || tile instanceof Bush || tile instanceof Tree || tile instanceof Chest) && tile.contains(chosenSquare.x, chosenSquare.z));
                if (occupied || chosenSquare.x < -16 || chosenSquare.x > 15 || chosenSquare.z < -16 || chosenSquare.z > 15) {
                    chosenSquare = undefined;
                } else {
                    break;
                }
            }
            if (chosenSquare) {
                const path = Pathfind.findPath({ world: agent.scene.mainWorld, start: { x: Math.round(agent.x), z: Math.round(agent.z) }, end: chosenSquare });
                if (path.length > 0) {
                    agent.state = { type: "followPath", memory: {} };
                    agent.state.memory.path = path;
                }
            }
        }
        if (agent.memory.tasks.length > 0) {
            if (agent.memory.tasks[0].name === "goHome" && !agent.memory.tasks[0].doing) { // done
                agent.memory.tasks[0].doing = true;
                agent.goal = { type: "goHome", memory: {} };
            }
            if (agent.memory.tasks[0].name === "storeInventory" && !agent.memory.tasks[0].doing) { // done
                agent.memory.tasks[0].doing = true;
                agent.goal = { type: "storeInventory", memory: {} };
            }
            if (agent.memory.tasks[0].name === "equipItem" && !agent.memory.tasks[0].doing) { // done
                agent.memory.tasks[0].doing = true;
                agent.goal = { type: "equipItem", memory: {} };
            }
            if (agent.memory.tasks[0].name === "chopWood" && !agent.memory.tasks[0].doing) { // done
                agent.memory.tasks[0].doing = true;
                agent.goal = { type: "chopWood", memory: { times: agent.memory.tasks[0].parameters[0] } };
            }
            if (agent.memory.tasks[0].name === "mineRocks" && !agent.memory.tasks[0].doing) { // done
                agent.memory.tasks[0].doing = true;
                agent.goal = { type: "mineRocks", memory: { times: agent.memory.tasks[0].parameters[0] } };
            }
            if (agent.memory.tasks[0].name === "gather" && !agent.memory.tasks[0].doing) { // done
                agent.memory.tasks[0].doing = true;
                agent.goal = { type: "gather", memory: { itemType: agent.memory.tasks[0].parameters[0], times: agent.memory.tasks[0].parameters[1] } };
            }
            if (agent.memory.tasks[0].name === "eat" && !agent.memory.tasks[0].doing) { // done
                agent.memory.tasks[0].doing = true;
                agent.goal = { type: "eat", memory: { itemType: agent.memory.tasks[0].parameters[1], times: agent.memory.tasks[0].parameters[0], source: agent.memory.tasks[0].parameters[2] } };
            }
            if (agent.memory.tasks[0].name === "cloneSelf" && !agent.memory.tasks[0].doing) {
                agent.memory.tasks[0].doing = true;
                agent.goal = { type: "cloneSelf", memory: {} };
            }
        }
    }
}
addRemoveFromTaskList(wanderGoal);