import Phaser from 'phaser';
import { PlayerSprite } from '../../game/phaser/visuals/PlayerSprite';
import { generateSpriteSheet } from '../../game/phaser/generators/TextureGenerator';
import { ArtLabState } from '../ArtLabConfig';

export class CharacterMode {
    private scene: Phaser.Scene;
    private sprite: PlayerSprite | null = null;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    create() {
        // 1. Generate Textures (Force Refresh)
        generateSpriteSheet(this.scene);

        // 2. Spawn Sprite (Centered)
        this.sprite = new PlayerSprite(this.scene, 0, 0);
        this.scene.add.existing(this.sprite);
    }

    updateConfig(config: ArtLabState) {
        if (!this.sprite || !this.sprite.scene) return;

        // Apply Scale
        this.sprite.setScale(config.charScaleX, config.charScaleY);

        // Apply Wobble Speed
        this.sprite.setWobbleSpeed(config.wobbleSpeed);

        // [NEW] Apply Movement Status
        this.sprite.setIsMoving(config.simulatingMove);

        // [NEW] Show Hand only in Weapon mode
        this.sprite.setHandVisible(config.activeMode === 'WEAPON');

        if (config.activeMode === 'CHARACTER' || config.activeMode === 'WEAPON') {
            this.sprite.setVisible(true);
        } else {
            this.sprite.setVisible(false);
        }
    }

    update(time: number, delta: number) {
        // Sprite handles its own animation in preUpdate
    }
}
