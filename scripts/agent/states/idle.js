const idleState = {
    name: "idle",
    update(agent) {
        agent.memory.physicalEnergy += 0.002;
        agent.memory.mentalEnergy += 0.001;
        if (agent.mesh.animation.current !== "idle") {
            agent.mesh.animation.play("idle");
        }
    }
};