const followPathState = {
    name: "followPath",
    update(agent) {
        if (agent.mesh.animation.current !== "walk") {
            agent.mesh.animation.play("walk");
        }
        if (agent.state.memory.goal === undefined && agent.state.memory.path.length > 0) {
            agent.state.memory.goal = agent.state.memory.path.shift();
            agent.targetRotation = Math.atan2(agent.state.memory.goal.x - agent.x, agent.state.memory.goal.z - agent.z);
        } else if (agent.state.memory.goal) {
            if (agent.state.memory.goal.x > agent.x) {
                agent.x += 0.025 * (mainScene.delta / 16.66);
            }
            if (agent.state.memory.goal.x < agent.x) {
                agent.x -= 0.025 * (mainScene.delta / 16.66);
            }
            if (agent.state.memory.goal.z > agent.z) {
                agent.z += 0.025 * (mainScene.delta / 16.66);
            }
            if (agent.state.memory.goal.z < agent.z) {
                agent.z -= 0.025 * (mainScene.delta / 16.66);
            }
            if (Math.abs(agent.state.memory.goal.z - agent.z) + Math.abs(agent.state.memory.goal.x - agent.x) <= 0.05) {
                agent.x = agent.state.memory.goal.x;
                agent.z = agent.state.memory.goal.z;
                agent.state.memory.goal = undefined;
                if (Math.hypot(agent.x - agent.memory.home.x, agent.z - agent.memory.home.z) > 8 && agent.scene.sunAngle < 0 && agent.goal.type !== "goHome" && !agent.memory.inCombat) {
                    agent.goal = { type: "goHome", memory: {} };
                    agent.goalManager = goals.find(goal => goal.name === agent.goal.type);
                    if (agent.memory.tasks.length > 0) {
                        agent.memory.tasks[0].doing = false;
                    }
                }
            }
        } else if (agent.state.memory.path.length === 0) {
            agent.state = { type: "idle", memory: {} };
            if (agent.goalManager.onPathEnd) {
                agent.goalManager.onPathEnd(agent);
                agent.updateStateManager();
                agent.updateGoalManager();
            }
        }
    }
}