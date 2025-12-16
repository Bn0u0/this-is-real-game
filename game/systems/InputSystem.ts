import Phaser from 'phaser';
import { Player } from '../classes/Player';

export class InputSystem {
    private scene: Phaser.Scene;

    // Virtual Input State
    private virtualMove = { x: 0, y: 0 };
    private virtualAim = { x: 0, y: 0, isFiring: false };
    private targetMovePosition: Phaser.Math.Vector2 | null = null;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    public setVirtualAxis(x: number, y: number) {
        this.virtualMove.x = x;
        this.virtualMove.y = y;
        if (x !== 0 || y !== 0) this.targetMovePosition = null;
    }

    public setVirtualAim(x: number, y: number, firing: boolean) {
        this.virtualAim.x = x;
        this.virtualAim.y = y;
        this.virtualAim.isFiring = firing;
    }

    public triggerSkill(skill: string) {
        this.scene.events.emit('TRIGGER_SKILL', skill);
    }

    processInput(
        input: Phaser.Input.InputPlugin,
        cameras: Phaser.Cameras.Scene2D.CameraManager,
        player: Player,
        modifiers: { playerSpeed: number }
    ): void {
        // CRITICAL: Lock input during dash to preserve momentum
        if (player.isDashing) return;

        const body = player.body as Phaser.Physics.Arcade.Body;
        const pointer = input.activePointer;
        const accel = 1200 * modifiers.playerSpeed;

        let moveX = this.virtualMove.x;
        let moveY = this.virtualMove.y;

        // Mouse/Touch Click-to-Move Logic
        if (pointer.isDown && moveX === 0 && moveY === 0) {
            const worldPoint = pointer.positionToCamera(cameras.main) as Phaser.Math.Vector2;

            // Set target
            this.targetMovePosition = new Phaser.Math.Vector2(worldPoint.x, worldPoint.y);
        }

        // Apply Click Movement
        if (this.targetMovePosition) {
            const dist = Phaser.Math.Distance.Between(player.x, player.y, this.targetMovePosition.x, this.targetMovePosition.y);
            if (dist < 10) {
                this.targetMovePosition = null; // Arrived
            } else {
                const angle = Math.atan2(this.targetMovePosition.y - player.y, this.targetMovePosition.x - player.x);
                moveX = Math.cos(angle);
                moveY = Math.sin(angle);
            }
        }

        // Apply Movement
        if (moveX !== 0 || moveY !== 0) {
            body.setDrag(600);
            body.setAcceleration(moveX * accel, moveY * accel);

            const targetRotation = Math.atan2(moveY, moveX) + Math.PI / 2;
            player.setRotation(Phaser.Math.Angle.RotateTo(player.rotation, targetRotation, 0.15));
        } else {
            body.setAcceleration(0, 0);
        }

        // Keyboard Skills
        if (input.keyboard) {
            if (Phaser.Input.Keyboard.JustDown(input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE))) player.dash();
            if (Phaser.Input.Keyboard.JustDown(input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q))) player.triggerSkill1();
            if (Phaser.Input.Keyboard.JustDown(input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E))) player.triggerSkill2();
        }
    }
}
