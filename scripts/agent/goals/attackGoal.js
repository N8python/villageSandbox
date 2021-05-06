const attackGoal = {
    name: "attack",
    update(agent) {
        if ((agent.state.type !== "followPath" || !agent.goal.memory.lastTargetTile ||
                (Math.abs(agent.memory.target.x - agent.goal.memory.lastTargetTile.x) +
                    Math.abs(agent.memory.target.z - agent.goal.memory.lastTargetTile.z)
                ) >= 1) && agent.state.type !== "attack") {
            this.goAfterTarget(agent);
        }
        if ((Math.abs(agent.memory.target.x - agent.x) +
                Math.abs(agent.memory.target.z - agent.z)
            ) <= 1.5 && agent.state.type !== "attack") {
            agent.state = { type: "attack", memory: { tick: 0, attackDone: false } };
        }
    },
    goAfterTarget(agent) {
        const { path } = agent.findPathToTarget();
        agent.goal.memory.lastTargetTile = { x: Math.round(agent.memory.target.x), z: Math.round(agent.memory.target.z) };
        if (path.length > 0) {
            agent.state = { type: "followPath", memory: {} };
            agent.state.memory.path = path;
        } else {
            this.removeFromTaskList(agent);
            agent.memory.inCombat = false;
            agent.goal = { type: "wander", memory: {} };
            agent.state = { type: "idle", memory: {} };
        }
    },
    onAnimationEnd(agent, e) {
        if (e.action.getClip().animName === "attack") {
            if ((
                    Math.abs(agent.memory.target.x - agent.x) +
                    Math.abs(agent.memory.target.z - agent.z)
                ) >= 1) {
                this.goAfterTarget(agent);
            } else {
                agent.state.memory.tick = 0;
                agent.state.memory.attackDone = false;
                /*const angleToTarget = Math.atan2(agent.memory.target.x - agent.x, agent.memory.target.z - agent.z);
                let k = 0;
                let knockbackInterval = setInterval(() => {
                    k++;
                    if (k === 30) {
                        clearInterval(knockbackInterval);
                        return;
                    }
                    agent.memory.target.x += Math.sin(angleToTarget) / 30;
                    agent.memory.target.z += Math.cos(angleToTarget) / 30;
                }, 4);
                if (!agent.memory.target.memory.inCombat) {
                    setToCombat(agent.memory.target);
                }
                agent.memory.target.getAllies().forEach(ally => {
                    if (!ally.memory.inCombat) {
                        setToCombat(ally);
                    }
                })*/
            }
        }
    }
}
addRemoveFromTaskList(attackGoal);