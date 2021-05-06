const deathGoal = {
    name: "death",
    update(agent) {
        if (agent.state.type !== "death") {
            agent.state = { type: "death", memory: {} };
        }
    },
    onAnimationEnd(agent, e) {
        if (e.action.getClip().animName === "death" && agent.mesh.visible === true) {
            agent.mesh.visible = false;
            const agentIndex = agent.scene.mainWorld.agents.indexOf(agent);
            if (agentIndex >= 0) {
                agent.scene.mainWorld.agents.splice(agentIndex, 1);
            }
            const agentMeshIndex = agent.scene.mainWorld.agents.indexOf(agent);
            if (agentMeshIndex >= 0) {
                agent.scene.third.scene.children.splice(agent.scene.third.scene.children.indexOf(agent.mesh), 1);
            }
        }
    }
}
addRemoveFromTaskList(deathGoal);