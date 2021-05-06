setInterval(() => {
    if (mainScene && mainScene.toJSON && mainScene.mainWorld && mainScene.mainWorld.tiles && mainScene.mainWorld.tiles.length > 0 && Array.isArray(mainScene.mainWorld.agents) && mainScene.initiated === true) {
        localProxy.scene = mainScene.toJSON();
    }
}, 500);
const forceReset = () => {
    localProxy.scene = undefined;
    location.reload();
}