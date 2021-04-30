const chopState = {
    name: "chop",
    update(agent) {
        if (agent.mesh.animation.current !== "chop") {
            agent.targetRotation = Math.atan2(agent.goal.memory.targetTile.x - agent.x, agent.goal.memory.targetTile.z - agent.z);
            agent.mesh.animation.play("chop");
        }
    }
}