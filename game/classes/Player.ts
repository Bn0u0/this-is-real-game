import Phaser from 'phaser';
import { COLORS, PHYSICS, FX } from '../../constants';
import { ItemDef } from '../data/Items';

export enum Role {
    Vanguard = 'Vanguard',
    Weaver = 'Weaver',
}

export class Player extends Phaser.GameObjects.Container {
    public id: string;
    public isLocal: boolean;
    declare public body: Phaser.Physics.Arcade.Body;
    public speedMultiplier: number = 1.0;
    public shielded: boolean = false;

    declare public scene: Phaser.Scene;
    declare public x: number;
    declare public y: number;
    declare public rotation: number;
    declare public active: boolean;

    declare public add: (child: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]) => this;
    declare public setScale: (x: number, y?: number) => this;
    declare public setRotation: (radians?: number) => this;
    declare public setDepth: (value: number) => this;

    protected coreShape: Phaser.GameObjects.Graphics;
    public visualSprite?: Phaser.GameObjects.Sprite | Phaser.GameObjects.Container;
    private emitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private shadow: Phaser.GameObjects.Ellipse; // 2.5D Anchor

    // 2.5D Coordinates (Simulated Height for Jumps/FX only - Pure 2D)
    public z: number = 0;
    public zVelocity: number = 0;

    // Dash State
    public isDashing: boolean = false;
    public isInvulnerable: boolean = false; // i-frame flag
    private dashTimer: number = 0;
    private dashCooldown: number = 0;

    // Inventory
    public lootBag: ItemDef[] = [];

    // Skills
    public cooldowns: { [key: string]: number } = {};
    public maxCooldowns: { [key: string]: number } = {};

    constructor(scene: Phaser.Scene, x: number, y: number, id: string, isLocal: boolean) {
        super(scene, x, y);
        this.id = id;
        this.isLocal = isLocal;

        // 0. Shadow (Ground anchor)
        this.shadow = scene.add.ellipse(0, 0, 40, 15, 0x000000, 0.4);
        this.shadow.setDepth(5);
        this.add(this.shadow);

        // 1. Particle Trail (The Wake)
        if (!scene.textures.exists('flare')) {
            const graphics = scene.make.graphics({ x: 0, y: 0 });
            graphics.fillStyle(0xffffff, 1);
            graphics.fillCircle(4, 4, 4);
            graphics.generateTexture('flare', 8, 8);
        }

        this.emitter = scene.add.particles(0, 0, 'flare', {
            speed: 10,
            scale: { start: 0.6, end: 0 },
            alpha: { start: 0.6, end: 0 },
            lifespan: FX.particles.lifespan,
            blendMode: 'ADD',
            frequency: FX.particles.interval,
            follow: this,
            tint: isLocal ? COLORS.primary : COLORS.secondary
        });
        this.emitter.setDepth(-1);

        // 2. Geometric Body (Hexagon)
        this.coreShape = scene.add.graphics();
        this.drawHexagon(isLocal ? COLORS.primary : COLORS.secondary);
        this.add(this.coreShape);

        // 3. Direction Indicator
        if (isLocal) {
            const arrow = scene.add.triangle(0, -22, 0, 0, 8, 12, -8, 12, 0xffffff);
            arrow.setOrigin(0.5, 0.5);
            arrow.setAlpha(0.6);
            this.add(arrow);
        }

        // 4. Physics Setup
        scene.add.existing(this);
        scene.physics.add.existing(this);

        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setCircle(16, -16, -16);
        body.setDrag(PHYSICS.drag);
        body.setDamping(false);
        body.setMaxVelocity(PHYSICS.maxVelocity);
        body.setCollideWorldBounds(false);
    }

    drawHexagon(color: number) {
        this.coreShape.clear();

        // Outer Glow Ring
        this.coreShape.lineStyle(2, color, 0.4);
        this.coreShape.strokeCircle(0, 0, 24);

        // Inner Hexagon
        this.coreShape.fillStyle(COLORS.bg, 1);
        this.coreShape.lineStyle(2, 0xffffff, 1);

        const radius = 12;
        const points: { x: number, y: number }[] = [];
        for (let i = 0; i < 6; i++) {
            const angle_deg = 60 * i - 30;
            const angle_rad = Math.PI / 180 * angle_deg;
            points.push({
                x: radius * Math.cos(angle_rad),
                y: radius * Math.sin(angle_rad)
            });
        }

        this.coreShape.beginPath();
        this.coreShape.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            this.coreShape.lineTo(points[i].x, points[i].y);
        }
        this.coreShape.closePath();
        this.coreShape.fillPath();
        this.coreShape.strokePath();

        // Central Core
        this.coreShape.fillStyle(color, 1);
        this.coreShape.fillCircle(0, 0, 5);
    }

    // Stats Container
    public stats = {
        atk: 10,
        crit: 0,
        cooldown: 0,
        speed: 0
    };

    update() {
        const body = this.body as Phaser.Physics.Arcade.Body;
        const dt = 16.6;

        // Cooldown Management (Apply CDR)
        // 10% CDR means time passes 1.1x faster for cooldowns, or we reduce max?
        // Let's effectively reduce cooldown time needed.
        // Simplified: Cooldowns tick down normally. When SETTING cooldown, we multiply by (1 - cdr).
        for (const key in this.cooldowns) {
            if (this.cooldowns[key] > 0) {
                this.cooldowns[key] -= dt;
            }
        }

        // ... (Z Logic) ...
        if (this.z > 0 || this.zVelocity !== 0) {
            this.z += this.zVelocity;
            this.zVelocity -= 0.8;
            if (this.z < 0) {
                this.z = 0;
                this.zVelocity = 0;
            }
        }
        this.coreShape.y = -this.z;
        if (this.visualSprite) this.visualSprite.y = -this.z;
        this.shadow.setScale(1 - (this.z / 200));
        this.shadow.setAlpha(0.4 - (this.z / 300));

        // Dash Logic
        if (this.dashCooldown > 0) this.dashCooldown -= dt;
        if (this.isDashing) {
            this.dashTimer -= dt;
            if (this.dashTimer <= 0) {
                this.isDashing = false;
                this.isInvulnerable = false;
                body.drag.set(PHYSICS.drag);
                // Reset Max Velocity to Stats Speed
                this.updateMaxSpeed();
            }
            return;
        }

        // Apply Stats Speed to Max Velocity
        // We do this continuously or just once? Continuously is safer for buffs.
        this.updateMaxSpeed();

        // Visual: Breathing Pulse based on speed
        const maxSpeed = body.maxVelocity.x || PHYSICS.maxVelocity; // Fallback
        const speedRatio = body.velocity.length() / maxSpeed;
        const scalePulse = 1 + Math.sin(this.scene.time.now / 200) * 0.05 + (speedRatio * 0.1);
        this.setScale(scalePulse);

        this.coreShape.rotation += 0.02 + (speedRatio * 0.1);
        this.coreShape.y = -this.z;

        // ... (Particles) ...
        if (body.velocity.length() > 50) {
            this.emitter.active = true;
            const angle = this.rotation + Math.PI / 2;
            this.emitter.followOffset.set(Math.cos(angle) * 15, Math.sin(angle) * 15);
        } else {
            this.emitter.active = false;
        }
    }

    private updateMaxSpeed() {
        const body = this.body as Phaser.Physics.Arcade.Body;
        if (!body) return;

        // Base 200 + (Speed% * 200)
        // items provide speed as e.g. 0.05 (5%)
        const base = PHYSICS.maxVelocity;
        const bonus = base * (this.stats.speed || 0);
        const final = base + bonus;

        body.setMaxVelocity(final);
    }

    public dash(direction?: Phaser.Math.Vector2) {
        if (this.dashCooldown > 0) return;

        // Calculate Cooldown with CDR
        const baseCd = 1200; // Faster dash for flick combat
        const cdr = Math.min(0.5, this.stats.cooldown || 0);
        const finalCd = baseCd * (1 - cdr);

        this.isDashing = true;
        this.isInvulnerable = true;
        this.dashTimer = 250; // Slightly longer dash
        this.dashCooldown = finalCd;

        // Physics push
        const body = this.body as Phaser.Physics.Arcade.Body;
        const speed = 1100 * (1 + (this.stats.speed || 0) * 0.5);

        body.drag.set(0);
        body.maxVelocity.set(1200);

        // Direction: Flick Vector or Current Rotation
        let vx = 0;
        let vy = 0;
        if (direction && (direction.x !== 0 || direction.y !== 0)) {
            vx = direction.x;
            vy = direction.y;
            // Snap rotation to dash
            this.rotation = Math.atan2(vy, vx) - Math.PI / 2;
        } else {
            const angle = this.rotation - Math.PI / 2;
            vx = Math.cos(angle);
            vy = Math.sin(angle);
        }

        body.setVelocity(vx * speed, vy * speed);

        this.zVelocity = 12;

        this.scene.tweens.add({
            targets: this.coreShape,
            scale: { from: 1.4, to: 1 },
            duration: 250,
            ease: 'Back.out'
        });

        // JUICE: Camera Shake?
        this.scene.cameras.main.shake(100, 0.005);
    }

    // Auto-Fire System (Stop & Shoot)
    private lastFireTime: number = 0;
    private fireRate: number = 200; // ms

    public autoFire(time: number, enemies: Phaser.GameObjects.Group, projectiles: Phaser.GameObjects.Group) {
        if (this.isDashing) return;

        const body = this.body as Phaser.Physics.Arcade.Body;
        const speed = body.velocity.length();

        // Stance Logic: If nearly stopped, Auto-Fire
        if (speed < 50) {
            // Find Target
            const target = this.scanForTarget(enemies);
            if (target) {
                const t = target as any; // Cast to access x,y
                // Rotate towards target
                const angle = Phaser.Math.Angle.Between(this.x, this.y, t.x, t.y);
                this.rotation = Phaser.Math.Angle.RotateTo(this.rotation, angle + Math.PI / 2, 0.2);

                // Fire
                if (time > this.lastFireTime + this.fireRate) {
                    this.fireProjectile(projectiles, angle);
                    this.lastFireTime = time;
                }
            }
        }
    }

    private scanForTarget(enemies: Phaser.GameObjects.Group): Phaser.GameObjects.GameObject | null {
        let closest: Phaser.GameObjects.GameObject | null = null;
        let minDist = 600; // Range

        enemies.children.each((child) => {
            const e = child as any; // Cast to access properties
            if (!e.active || e.isDead) return true; // continue
            const dist = Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y);
            if (dist < minDist) {
                minDist = dist;
                closest = e;
            }
            return true;
        });
        return closest;
    }

    private fireProjectile(projectiles: Phaser.GameObjects.Group, angle: number) {
        // Get projectile from pool (simplified here, in reality ProjectileGroup manages this)
        // Since we don't have direct access to Group methods without casting, 
        // we'll assume MainScene handles the actual creation if we emit event OR we assume projectiles group has `get()`.
        const bullet = projectiles.get(this.x, this.y) as any; // Projectile type
        if (bullet) {
            bullet.onEnable(
                this.x + Math.cos(angle) * 20,
                this.y + Math.sin(angle) * 20,
                angle,
                800, // Speed
                1000, // Duration
                COLORS.primary,
                this.stats.atk,
                this.id
            );
            // Recoil
            const body = this.body as Phaser.Physics.Arcade.Body;
            body.setVelocity(body.velocity.x - Math.cos(angle) * 20, body.velocity.y - Math.sin(angle) * 20);
        }
    }

    public getDamage(): { dmg: number, isCrit: boolean } {
        const isCrit = Math.random() < (this.stats.crit / 100);
        let dmg = this.stats.atk;
        if (isCrit) dmg *= 1.5;
        return { dmg, isCrit };
    }

    destroy(fromScene?: boolean) {
        this.emitter.destroy();
        super.destroy(fromScene);
    }

    // Virtual metods for subclasses
    public updateCombat(enemies: Phaser.GameObjects.Group, projectiles: Phaser.GameObjects.Group) { }

    // Generic Skill Hooks
    public triggerSkill1() { }
    public triggerSkill2() { }
}