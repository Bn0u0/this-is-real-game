import Phaser from 'phaser';
import { ItemDef } from '../../../types';

export class PlayerRig extends Phaser.GameObjects.Container {
    // [PARTS]
    private shadow: Phaser.GameObjects.Image;
    private leftLeg: Phaser.GameObjects.Image;
    private rightLeg: Phaser.GameObjects.Image;
    private bodyGroup: Phaser.GameObjects.Container;

    // private backpack: Phaser.GameObjects.Image; // [REMOVED]
    private torso: Phaser.GameObjects.Image;
    private head: Phaser.GameObjects.Container;
    private face: Phaser.GameObjects.Image;

    private handRight: Phaser.GameObjects.Container; // The Weapon Hand (Pivot: Shoulder)
    private weaponContainer: Phaser.GameObjects.Container; // Inside HandRight
    private weaponSprite: Phaser.GameObjects.Graphics; // Inside WeaponContainer
    private swingEffect: Phaser.GameObjects.Graphics;

    // [STATE]
    private walkCycle: number = 0;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);

        // 1. Shadow (Baseline)
        this.shadow = scene.add.image(0, 0, 'tex_char_shadow');
        this.add(this.shadow);

        // 2. Legs (Behind Body)
        // Offset: -6, +6. Pivot: Top Center basically.
        this.leftLeg = scene.add.image(-6, -5, 'tex_char_leg');
        this.leftLeg.setOrigin(0.5, 0.1); // Pivot at Hip
        this.rightLeg = scene.add.image(6, -5, 'tex_char_leg');
        this.rightLeg.setOrigin(0.5, 0.1);
        this.add([this.leftLeg, this.rightLeg]);

        // 3. Body Group (The Squashy Part)
        // Pivot: Bottom Center (so squash keeps feet on ground)
        this.bodyGroup = scene.add.container(0, -10);
        this.add(this.bodyGroup);

        // 3.1 Backpack [REMOVED for Pure Baba Style]
        // this.backpack = scene.add.image(0, -15, 'tex_char_backpack');
        // this.bodyGroup.add(this.backpack);

        // 3.2 Torso
        this.torso = scene.add.image(0, -10, 'tex_char_body');
        // Origin Center is fine for Torso image itself? No, put it slightly up.
        this.bodyGroup.add(this.torso);

        // 3.3 Head (Can bob independently)
        this.head = scene.add.container(0, -25);
        this.bodyGroup.add(this.head);

        const headImg = scene.add.image(0, 0, 'tex_char_head');
        this.face = scene.add.image(0, 2, 'tex_char_face_neutral');
        this.head.add([headImg, this.face]);

        // 3.4 Right Hand (Weapon Arm)
        // Pivot: Shoulder (-10, -15 relative to BodyGroup?)
        this.handRight = scene.add.container(12, -12);
        this.bodyGroup.add(this.handRight);

        // Hand Visual (Mitten)
        const handImg = scene.add.image(0, 0, 'tex_char_hand');
        this.handRight.add(handImg);

        // Weapon Container (Child of Hand)
        this.weaponContainer = scene.add.container(0, 0); // At hand local 0,0
        this.handRight.add(this.weaponContainer);

        this.weaponSprite = scene.add.graphics();
        this.weaponContainer.add(this.weaponSprite);

        this.swingEffect = scene.add.graphics();
        this.swingEffect.setVisible(false);
        this.weaponContainer.addAt(this.swingEffect, 0);

        // [DEBUG]
        // scene.add.existing(this); // Usually handled by parent
    }

    public updateAnim(time: number, speed: number, isMoving: boolean) {
        // [LEG ANIMATION]
        if (isMoving) {
            this.walkCycle += 0.2; // Speed factor
            const legAmp = 20; // Degrees
            this.leftLeg.angle = Math.sin(this.walkCycle) * legAmp;
            this.rightLeg.angle = Math.cos(this.walkCycle) * legAmp;

            // Bobbing (Trot)
            this.bodyGroup.y = -10 + Math.abs(Math.sin(this.walkCycle)) * 2;
        } else {
            // Return to neutral
            this.leftLeg.angle = Phaser.Math.Linear(this.leftLeg.angle, 0, 0.1);
            this.rightLeg.angle = Phaser.Math.Linear(this.rightLeg.angle, 0, 0.1);
            this.bodyGroup.y = Phaser.Math.Linear(this.bodyGroup.y, -10, 0.1);
        }

        // [IDLE WOBBLE] (Baba Breathing)
        // Distinct frequencies for X and Y to feel organic
        const wobbleSpeed = time * 0.005;
        this.bodyGroup.scaleX = 1 + Math.sin(wobbleSpeed * 1.1) * 0.02; // +/- 2%
        this.bodyGroup.scaleY = 1 + Math.sin(wobbleSpeed * 0.8) * 0.02;
    }

    /**
     * Equips a weapon visually.
     */
    public equipWeapon(def: ItemDef) {
        this.weaponSprite.clear();
        this.weaponContainer.setVisible(true);

        const category = def.visualCategory || 'OTHER';
        const g = this.weaponSprite;
        const offset = def.hitbox?.offset || 10;

        // Align Sprite X with Hitbox Offset
        // Local x=0 is the Hand.
        // We want the "Center of Hitbox" to be at X = offset.
        // So the sprite should be drawn around that?
        // Let's assume the sprite drawing needs to be shifted.

        this.weaponSprite.x = offset;

        // Draw Logic (V2 Trash-Crayon)
        // Palette
        const C_IRON = 0x708090; // Scrap
        const C_RUST = 0xCD5C5C; // Oxide

        g.lineStyle(0, 0, 0); // No Outline for Pure Baba Mode

        switch (category) {
            case 'BLUNT':
                // Crowbar-ish
                g.fillStyle(C_RUST);
                g.fillRect(0, 0, 6, 24); // Handle
                // g.strokeRect(0, 0, 6, 24);

                g.fillStyle(C_IRON);
                g.fillRect(-2, 24, 10, 8); // Head
                // g.strokeRect(-2, 24, 10, 8);

                g.setAngle(-90); // Point forward
                break;

            case 'PISTOL':
                g.fillStyle(0x222222);
                g.fillRect(0, -2, 12, 6); // Barrel
                // g.strokeRect(0, -2, 12, 6);
                g.fillRect(0, 2, 4, 6); // Grip
                // g.strokeRect(0, 2, 4, 6);
                break;

            default:
                g.fillStyle(0xCCCCCC);
                g.fillRect(0, -2, 20, 6); // Generic Stick
                // g.strokeRect(0, -2, 20, 6);
                break;
        }
    }

    public playSwing() {
        if (!this.scene) return;
        this.scene.tweens.add({
            targets: this.handRight, // Rotate the ARM/HAND
            angle: { from: -60, to: 100 }, // Swing Arc
            duration: 120,
            yoyo: true,
            hold: 50
        });

        // Add smear effect here via swingEffect
    }
}
