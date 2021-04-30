const goHomeGoal = {
    name: "goHome",
    update(agent) {
        if (!agent.goal.memory.headingHome) {
            agent.goal.memory.headingHome = true;
            const path = Pathfind.findPath({ world: agent.scene.mainWorld, start: { x: Math.round(agent.x), z: Math.round(agent.z) }, end: agent.memory.home.entrance() });
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
        agent.targetRotation = Math.atan2(agent.memory.home.x - agent.x, agent.memory.home.z - agent.z);
        this.removeFromTaskList(agent);
        agent.goal = { type: "wander", memory: {} };
    }

}
addRemoveFromTaskList(goHomeGoal);