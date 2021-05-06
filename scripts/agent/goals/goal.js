const goals = [attackGoal, chopWoodGoal, cloneSelfGoal, deathGoal, eatGoal, equipItemGoal, gatherGoal, goHomeGoal, mineRocksGoal, storeInventoryGoal, wanderGoal];
const setToCombat = (agent) => {
    agent.memory.inCombat = true;
    agent.chooseTarget();
    agent.goal = { type: "attack", memory: {} };
    agent.state = { type: "idle", memory: {} };
    agent.updateStateManager();
    agent.updateGoalManager();
}
const takeOutOfCombat = (agent) => {
    agent.memory.inCombat = false;
    agent.goal = { type: "wander", memory: {} };
    agent.state = { type: "idle", memory: {} };
    agent.updateStateManager();
    agent.updateGoalManager();
}