class TextSprite {
    constructor({ scene, message, position, color }) {
        this.scene = scene;
        this.message = message;
        this.texture = new FLAT.TextTexture(this.message, { fillStyle: color });
        this.sprite = new FLAT.TextSprite(this.texture);
        this.scene.third.add.existing(this.sprite);
        this.sprite.setScale(0.01);
        this.sprite.position.set(position.x, position.y, position.z);
    }
}
class DamageIndicator extends TextSprite {
    constructor({ scene, message, position, crit }) {
        super({ scene, message, position, color: crit ? "yellow" : "red" });
        this.updateInterval = setInterval(() => {
            this.update();
        }, 30);
        this.tick = 0;
    }
    update() {
        this.tick++;
        this.sprite.position.y += 0.1 - ((0.08) / 20) * this.tick;
        this.sprite.setScale(Math.max(0.01 - ((0.01) / 20) * this.tick, 0));
        if (this.tick === 20) {
            this.sprite.visible = false;
            clearInterval(this.updateInterval);
            this.scene.third.scene.children.splice(this.scene.third.scene.children.indexOf(this.sprite), 1);
        }
    }
}