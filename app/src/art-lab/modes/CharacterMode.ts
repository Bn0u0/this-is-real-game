import Phaser from 'phaser';
import { PlayerRig } from '../../game/phaser/visuals/PlayerRig'; // Standard Game Path
import { generateCharacterTextures } from '../../game/phaser/generators/TextureGenerator';
import { ArtLabState } from '../ArtLabConfig';

export class CharacterMode {
    private scene: Phaser.Scene;
    private rig: PlayerRig | null = null;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    create() {
        // 1. Generate Textures (Force Refresh)
        generateCharacterTextures(this.scene);

        // 2. Spawn Rig
        this.rig = new PlayerRig(this.scene, 0, 0);
        this.scene.add.existing(this.rig);

        // 3. Default State
        // this.rig.equipWeapon(...) // Optional
    }

    updateConfig(config: ArtLabState) {
        if (!this.rig) return;

        // Apply Wobble Params (If Shader)
        // Apply Scale
        this.rig.setScale(config.charScaleX, config.charScaleY);

        if (config.activeMode === 'CHARACTER') {
            this.rig.setVisible(true);
        } else {
            this.rig.setVisible(false);
        }
    }

    update(time: number, delta: number) {
        if (this.rig && this.rig.visible) {
            // Force Idle Animation (Wobble)
            this.rig.updateAnim(time, 1, false);
        }
    }
}
