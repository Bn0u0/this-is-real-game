import Phaser from 'phaser';
import { Player } from './Player';
import { COLORS } from '../../constants';

export class Enemy extends Phaser.GameObjects.Container {
    public id: string;
    declare public body: Phaser.Physics.Arcade.Body;
    public isDead: boolean = false;

    // Custom stats
    private hp: number = 1;
    private moveSpeed: number = 100;

    declare public scene: Phaser.Scene;
    declare public x: number;
    declare public y: number;
    declare public rotation: number;
    declare public active: boolean;
    declare public scaleX: number;
    declare public scaleY: number;

    declare public add: (child: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]) => this;
    declare public setScale: (x: number, y?: number) => this;
    declare public setRotation: (radians?: number) => this;
    declare public destroy: (fromScene?: boolean) => void;

    private graphics: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        this.id = Math.random().toString(36).substr(2, 9);

        // 1. Visuals: Rhombus
        this.graphics = scene.add.graphics();
        this.drawShape(COLORS.secondary);
        this.add(this.graphics);

        this.setRotation(Math.PI / 4);

        // 2. Physics
        scene.add.existing(this);
        scene.physics.add.existing(this);

        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setCircle(14, -14, -14);
        body.setFriction(0, 0);
        body.setBounce(1);
        body.setCollideWorldBounds(false);
    }

    setDifficulty(speedMult: number, hpMult: number, isElite: boolean) {
        this.moveSpeed = 100 * speedMult;
        this.hp = Math.floor(1 * hpMult);

        if (isElite) {
            this.moveSpeed *= 0.8; // Elite is slower
            this.hp *= 5; // But tanky
            this.setScale(1.5);

            // Visual change for elite
            this.graphics.clear();
            this.graphics.lineStyle(2, 0xFFD700);
            this.graphics.fillStyle(COLORS.secondary, 1);
            this.graphics.fillRect(-12, -12, 24, 24);
            this.graphics.fillStyle(0x000000, 0.5);
            this.graphics.fillRect(-6, -6, 12, 12);
        }
    }

    drawShape(color: number) {
        this.graphics.clear();
        this.graphics.fillStyle(color, 1);
        this.graphics.fillRect(-12, -12, 24, 24);
        this.graphics.fillStyle(0x000000, 0.5);
        this.graphics.fillRect(-6, -6, 12, 12);
    }

    // Pure AI Logic: Find nearest player (Commander or Drone) and attack
    seekPlayer(players: Player[], baseSpeed: number) {
        if (this.isDead || !this.body) return;

        let nearestDist = Infinity;
        let target: Player | null = null;

        for (const p of players) {
            if (!p.active) continue;
            const dist = Phaser.Math.Distance.Between(this.x, this.y, p.x, p.y);
            if (dist < nearestDist) {
                nearestDist = dist;
                target = p;
            }
        }

        if (target) {
            // Use internal speed
            this.scene.physics.moveToObject(this, target, this.moveSpeed);
            this.rotation += 0.02;
        }
    }

    kill() {
        if (this.isDead) return;

        // HP Check
        this.hp--;
        if (this.hp > 0) {
            // Hit effect
            this.scene.tweens.add({
                targets: this,
                scale: { from: this.scaleX * 1.2, to: this.scaleX },
                duration: 50,
                yoyo: true
            });
            return; // Survived hit
        }

        this.isDead = true;
        if (this.body) this.body.stop();

        this.drawShape(0xFFFFFF);

        this.scene.tweens.add({
            targets: this,
            scale: this.scaleX * 1.3,
            duration: 50,
            yoyo: false,
            onComplete: () => {
                this.emitDeathParticles();
                this.scene.tweens.add({
                    targets: this,
                    scale: 0,
                    duration: 100,
                    onComplete: () => {
                        this.destroy();
                    }
                });
            }
        });
    }

    emitDeathParticles() {
        if (!this.scene.textures.exists('shard')) {
            const g = this.scene.make.graphics({ x: 0, y: 0 });
            g.fillStyle(COLORS.secondary, 1);
            g.fillTriangle(0, 0, 10, 0, 5, 10);
            g.generateTexture('shard', 10, 10);
        }

        const emitter = this.scene.add.particles(this.x, this.y, 'shard', {
            speed: { min: 100, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 1, end: 0 },
            lifespan: 400,
            quantity: 6,
            blendMode: 'ADD',
            emitting: false
        });

        emitter.explode(6);
        this.scene.time.delayedCall(500, () => emitter.destroy());
    }
}