setInterval(() => {
    if (mainScene && mainScene.toJSON && mainScene.mainWorld && mainScene.mainWorld.tiles && mainScene.mainWorld.tiles.length > 0 && mainScene.mainWorld.agents.length > 0) {
        localProxy.scene = mainScene.toJSON();
    }
}, 500);
const forceReset = () => {
    localProxy.scene = undefined;
    location.reload();
}