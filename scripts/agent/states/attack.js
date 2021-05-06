const attackState = {
    name: "attack",
    update(agent) {
        if (agent.mesh.animation.current !== "attack") {
            agent.targetRotation = Math.atan2(agent.memory.target.x - agent.x, agent.memory.target.z - agent.z);
            agent.mesh.animation.play("attack");
        }
        agent.targetRotation = Math.atan2(agent.memory.target.x - agent.x, agent.memory.target.z - agent.z);
        agent.state.memory.tick += mainScene.delta;
        if (agent.state.memory.tick >= 1000 && !agent.state.memory.attackDone) {
            agent.state.memory.attackDone = true;
            if ((
                    Math.abs(agent.memory.target.x - agent.x) +
                    Math.abs(agent.memory.target.z - agent.z)
                ) <= 2) {
                const angleToTarget = Math.atan2(agent.memory.target.x - agent.x, agent.memory.target.z - agent.z);
                agent.memory.target.xVel += Math.sin(angleToTarget);
                agent.memory.target.zVel += Math.cos(angleToTarget);
                let minDamage = 0;
                let maxDamage = 0;
                let crit = false;
                let weaponInfo = weapons[(agent.memory.handItem && agent.memory.handItem.type) ? agent.memory.handItem.type : "unarmed"];
                if (Math.random() < weaponInfo.critChance) {
                    crit = true;
                }
                if (crit) {
                    minDamage = weaponInfo.crit[0];
                    maxDamage = weaponInfo.crit[1];
                } else {
                    minDamage = weaponInfo.damage[0];
                    maxDamage = weaponInfo.damage[1];
                }
                let damage = Math.round(Math.random() * (maxDamage - minDamage) + minDamage);
                new DamageIndicator({
                    scene: mainScene,
                    message: damage.toString(),
                    position: {
                        x: agent.memory.target.x,
                        y: agent.memory.target.y + 1,
                        z: agent.memory.target.z
                    },
                    crit
                });
                agent.memory.target.memory.health -= damage;
                if (!agent.memory.target.memory.inCombat) {
                    setToCombat(agent.memory.target);
                }
                agent.memory.target.getAllies().forEach(ally => {
                    if (!ally.memory.inCombat) {
                        setToCombat(ally);
                    }
                });
                if (agent.memory.target.memory.health <= 0) {
                    let toRemove = agent.memory.target;
                    //agent.memory.target = undefined;
                    // takeOutOfCombat(agent);
                    mainScene.mainWorld.agents.forEach(agent => {
                        if (agent.memory.target === toRemove) {
                            agent.memory.target = undefined;
                            takeOutOfCombat(agent);
                        }
                    })
                }
            }
        }
    }
}