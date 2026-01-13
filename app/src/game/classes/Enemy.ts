import Phaser from 'phaser';
import { Player } from './Player';
import { IPoolable } from '../core/ObjectPool';
// import { EnemyConfig } from '../factories/EnemyFactory'; // Deprecated
import { EnemyDef, EnemyBehavior } from '../../types';

export class Enemy extends Phaser.GameObjects.Container implements IPoolable {
    public id: string;

    // @ts-ignore: Suppress implementation override error
    declare public body: Phaser.Physics.Arcade.Body;
    public isDead: boolean = false;

    // Core Stats
    public hp: number = 10;
    public maxHp: number = 10;
    public speed: number = 100;
    public damage: number = 10;
    public value: number = 10;
    public attackRange: number = 50;

    // AI State
    public defId: string = 'unknown';
    public behavior: EnemyBehavior = 'CHASER';
    public faction: string = 'NONE';

    private nextActionTime: number = 0; // For shooting/teleporting cooldowns

    // Components
    protected graphics: Phaser.GameObjects.Graphics;
    protected shadow: Phaser.GameObjects.Ellipse;

    // Context
    private _scene: Phaser.Scene;
    private target: Player | null = null;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        this._scene = scene;
        this.id = Phaser.Utils.String.UUID();

        // 1. Shadow
        this.shadow = scene.add.ellipse(0, 0, 30, 10, 0x000000, 0.4);
        this.add(this.shadow);

        // 2. Main Visual Body
        this.graphics = scene.add.graphics();
        this.add(this.graphics);

        scene.add.existing(this);
        scene.physics.world.enable(this);

        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setCircle(20);
        body.setBounce(0.5);
        body.setDrag(200);
        body.setCollideWorldBounds(true);
    }

    // New Init using EnemyDef
    configure(def: EnemyDef) {
        this.defId = def.id;
        this.faction = def.faction;
        this.behavior = def.behavior;

        // Stats
        this.hp = def.stats.hp;
        this.maxHp = def.stats.hp;
        this.speed = def.stats.speed;
        this.damage = def.stats.damage;
        this.attackRange = def.stats.attackRange || 50;
        this.value = def.tier * 10; // Simple XP formula

        // Visuals
        const color = def.visuals.color;
        const radius = 20 * (def.visuals.scale || 1);

        this.graphics.clear();
        this.graphics.fillStyle(color, 1);

        // Shape based on faction?
        if (this.faction === 'RUSTED') {
            this.graphics.fillCircle(0, 0, radius); // Round blobs
        } else if (this.faction === 'OVERGROWN') {
            this.graphics.fillTriangle(-radius, radius, radius, radius, 0, -radius); // Spiky
        } else if (this.faction === 'GLITCHED') {
            this.graphics.fillRect(-radius, -radius, radius * 2, radius * 2); // Digital blocks
        } else {
            this.graphics.fillCircle(0, 0, radius);
        }

        // Physics
        const body = this.body as Phaser.Physics.Arcade.Body;
        if (body) {
            body.setCircle(radius, -radius, -radius);
        }

        this.setScale(1); // Reset scale
        if (def.visuals.effect === 'flicker') {
            // TODO: Add flicker tween or flag
        }
    }

    update(time: number, delta: number, player: Player) {
        if (this.isDead || !this.body) return;
        this.target = player;

        // Ensure depth sorting
        this.setDepth(this.y);

        this.updateAI(time, player);
    }

    private updateAI(time: number, player: Player) {
        if (!player || !player.body) return;

        const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

        switch (this.behavior) {
            case 'CHASER':
                this._scene.physics.moveToObject(this, player, this.speed);
                break;

            case 'SHOOTER':
                // Kite logic
                if (dist < this.attackRange * 0.5) {
                    // Too close, back off
                    const angle = Phaser.Math.Angle.Between(player.x, player.y, this.x, this.y);
                    this._scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);
                } else if (dist > this.attackRange) {
                    // Chase
                    this._scene.physics.moveToObject(this, player, this.speed);
                } else {
                    // Chill and Shoot
                    this.body.setVelocity(0, 0);
                    if (time > this.nextActionTime) {
                        this.tryShoot(player);
                        this.nextActionTime = time + 2000; // 2s Fire Rate
                    }
                }
                break;

            case 'TELEPORTER':
                // Check teleport
                if (time > this.nextActionTime) {
                    if (dist > 150) {
                        this.teleportNear(player);
                    }
                    this.nextActionTime = time + 3000; // 3s Blink
                } else {
                    // Slow creep
                    this._scene.physics.moveToObject(this, player, this.speed * 0.2);
                }
                break;
        }
    }

    private tryShoot(player: Player) {
        // Simple Enemy Projectile "Orb"
        // HACK: Creating a sprite that looks like a bullet
        const proj = this._scene.physics.add.sprite(this.x, this.y, 'tex_orb');
        proj.setTexture('tex_orb');
        proj.setTint(this.faction === 'OVERGROWN' ? 0x00FF00 : 0xFF0000);
        proj.setScale(0.5);

        this._scene.physics.moveToObject(proj, player, 400);

        // Tag it for collision? Currently CombatManager checks 'projectiles' vs 'enemies'
        // We need 'enemy_projectiles' vs 'player'
        // For now, let's just make it visually threatening or do direct check.
        // Actually this will just float through player unless we register it.
        // Let's tag it 'enemy_projectile' in data.
        proj.setData('isEnemyProjectile', true);
        proj.setData('damage', this.damage);

        // We need to add it to a group that collides with player? 
        // For V0.4, maybe just visual + direct distance check update?
        // Let's stick to visual for the moment to avoid breaking physics groups.

        this._scene.time.delayedCall(2000, () => proj.destroy());
    }

    private teleportNear(player: Player) {
        // Teleport 50-100px away from player
        const angle = Math.random() * Math.PI * 2;
        const r = 80 + Math.random() * 50;
        const tx = player.x + Math.cos(angle) * r;
        const ty = player.y + Math.sin(angle) * r;

        // Visual FX
        this.alpha = 0;
        this.x = tx;
        this.y = ty;
        this._scene.tweens.add({
            targets: this,
            alpha: 1,
            duration: 200
        });
    }

    public takeDamage(amount: number): boolean {
        this.hp -= amount;

        // Basic Feedback
        this.alpha = 0.5;
        this._scene.tweens.add({
            targets: this,
            alpha: 1,
            duration: 100
        });

        if (this.hp <= 0) {
            this.die();
            return true;
        }
        return false;
    }

    public die() {
        this.isDead = true;
        this.setActive(false);
        this.setVisible(false);
        this.body.enable = false;
        (this._scene as any).events.emit('ENEMY_KILLED', this);
    }

    // [PROXY] Physics & Visuals Compat for CombatManager
    public setTintFill(color: number) {
        this.alpha = 0.5; // Fallback for Container
    }

    public clearTint() {
        this.alpha = 1;
    }

    public setMaxVelocity(v: number) {
        if (this.body) this.body.setMaxVelocity(v);
    }

    public setVelocity(x: number, y: number) {
        if (this.body) this.body.setVelocity(x, y);
    }

    public onEnable() {
        this.setActive(true);
        this.setVisible(true);
        this.isDead = false;
        if (this.body) this.body.enable = true;
        this.alpha = 1;
        this.setScale(1);
    }

    public onDisable() {
        this.setActive(false);
        this.setVisible(false);
        this.body.enable = false;
    }
}