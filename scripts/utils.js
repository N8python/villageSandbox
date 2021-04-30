function angleDifference(angle1, angle2) {
    const diff = ((angle2 - angle1 + Math.PI) % (Math.PI * 2)) - Math.PI;
    return (diff < -Math.PI) ? diff + (Math.PI * 2) : diff;
}
const loadEmitter = async(name) => {
    const text = await fetch(`./assets/particles/${name}.json`);
    const json = await text.json();
    const system = await Nebula.System.fromJSONAsync(json.particleSystemState, THREE, { shouldAutoEmit: false });
    const renderer = new Nebula.SpriteRenderer(mainScene.third.scene, THREE);
    const particles = system.addRenderer(renderer);
    particles.emit({
        onStart: () => {},
        onUpdate: () => {},
        onEnd: () => {},
    });
    setInterval(() => {
        particles.update();
    }, 33);
    return system;
}
const addRemoveFromTaskList = (goal) => {
    goal.removeFromTaskList = function(agent) {
        if (agent.memory.tasks.length > 0 && agent.memory.tasks[0].name === this.name) {
            agent.memory.tasks.shift();
            if (document.getElementById("taskList") && selected === agent) {
                agent.generateTaskList(document.getElementById("taskList"));
            }
        }
    }
}