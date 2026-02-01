import Phaser from 'phaser';

export class PlayerSprite extends Phaser.GameObjects.Sprite {
    private timer: number = 0;
    private currentFrameIndex: number = 0;
    private frameNames: string[] = ['tex_char_frame_0', 'tex_char_frame_1', 'tex_char_frame_2'];
    private frameSpeed: number = 150; // ms per frame
    private isMoving: boolean = false;
    private baseY: number = 0;

    private handSprite: Phaser.GameObjects.Sprite;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'tex_char_frame_0');
        this.baseY = y;

        // Center pivot
        this.setOrigin(0.5, 0.5);
        this.setDepth(10); // Character body

        // Add Hand Sprite (Visual Only)
        // Note: The Rig might manage a separate Weapon Hand, 
        // but this "Hand Sprite" is the "Floating Ball Hand" of the character itself.
        this.handSprite = scene.add.sprite(x, y, 'tex_char_hand');
        this.handSprite.setOrigin(0.5, 0.5);
        this.handSprite.setDepth(20); // Hand above body
        this.handSprite.setVisible(false);
    }

    public setHandVisible(visible: boolean) {
        if (this.handSprite) this.handSprite.setVisible(visible);
    }

    public setIsMoving(moving: boolean) {
        this.isMoving = moving;
        if (!moving) {
            this.setRotation(0);
            this.y = this.baseY;
        }
    }

    public setWobbleSpeed(factor: number) {
        // Factor 0.0 to 5.0. Default 1.0 = 150ms
        // Higher speed = Lower ms
        if (factor <= 0.1) {
            this.frameSpeed = 999999; // Stop
        } else {
            this.frameSpeed = 150 / factor;
        }
    }

    preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);

        this.timer += delta;
        if (this.timer >= this.frameSpeed) {
            this.timer = 0;
            this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frameNames.length;
            this.setTexture(this.frameNames[this.currentFrameIndex]);
        }

        // 2. Procedural Movement trot (Waddle/Hop)
        // [FIX] Character is now UPRIGHT by default. Rotation only for small waddle tilt.
        if (this.isMoving) {
            const moveFreq = 0.015; // Slightly faster frequency
            const bounce = Math.abs(Math.sin(time * moveFreq)) * 12; // Increased to 12px hop
            const tilt = Math.sin(time * moveFreq * 0.5) * 0.2; // Doubled the tilt (approx 11 degrees)

            this.y = this.baseY - bounce;
            this.setRotation(tilt);
        } else {
            this.setRotation(0);
            this.y = this.baseY;
        }

        // 3. Sync Hand Position (Always follows world-space body)
        if (this.handSprite) {
            // Get world position of the character
            const matrix = this.getWorldTransformMatrix();
            const worldX = matrix.tx;
            const worldY = matrix.ty;

            // Flip offset based on the parent's scale (Rig's scaleX)
            const parentScaleX = this.parentContainer ? this.parentContainer.scaleX : 1;
            const direction = parentScaleX > 0 ? 1 : -1;

            this.handSprite.x = worldX + (30 * direction); // Tighter offset for 0.5 scale
            this.handSprite.y = worldY + 10;
            this.handSprite.setScale(Math.abs(parentScaleX), Math.abs(this.scaleY));
            this.handSprite.setAlpha(this.alpha);
        }
    }

    public destroy(fromScene?: boolean) {
        if (this.handSprite) this.handSprite.destroy();
        super.destroy(fromScene);
    }
}
