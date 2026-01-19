import Phaser from 'phaser';
import { COLORS, PHYSICS } from '../../../constants';
// import { ItemDef } from '../data/Items'; // [VOID]
import { ItemInstance, ItemDef, ItemRarity } from '../../../types';
import { ItemLibrary } from '../../data/library/items';
import { ClassConfig } from '../factories/PlayerFactory';
import { WeaponSystem } from '../systems/WeaponSystem';
import { inventoryService } from '../../../services/InventoryService'; // [NEW]
import { EventBus } from '../../../services/EventBus';
// import { cardSystem } from '../systems/CardSystem'; // [VOID]
// import { WeaponInstance } from '../../types'; // [VOID]

import { ClassMechanic } from './mechanics/ClassMechanic';
import { ScavengerLogic } from './mechanics/ScavengerLogic';
import { SkirmisherLogic } from './mechanics/SkirmisherLogic';
import { WeaverLogic } from './mechanics/WeaverLogic';

import { defineQuery } from 'bitecs';
import { GAME_LAYER } from '../../constants/Depth';
import { logger } from '../../../services/LoggerService';
import { Transform, EnemyTag } from '../../ecs/components';

export class Player extends Phaser.GameObjects.Container {
    public id: string;
    public isLocal: boolean;
    // @ts-ignore: Suppress implementation override error
    declare public body: Phaser.Physics.Arcade.Body;

    // Logic
    public mechanic: ClassMechanic | null = null;

    // Class Config
    public classConfig: ClassConfig | null = null;
    public equippedWeapon: ItemInstance | null = null;

    // Stats
    public stats = {
        hp: 100, maxHp: 100,
        speed: 1.0,
        atk: 10,
        crit: 5,
        cooldown: 0
    };

    // State
    public isDashing: boolean = false; // [LEGACY] Kept for interface compat
    public isInvulnerable: boolean = false;
    public isMoving: boolean = false;
    public isSiegeMode: boolean = false; // [SIEGE MODE]
    // [REMOVED] Dash timers - focus on core loop

    // Visuals
    public classId: string = 'SCAVENGER'; // Default
    protected graphics: Phaser.GameObjects.Graphics;
    protected coreShape: Phaser.GameObjects.Graphics;
    protected mechanicGraphics: Phaser.GameObjects.Graphics; // [NEW]
    private emitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private shadow: Phaser.GameObjects.Ellipse;
    public z: number = 0;
    public zVelocity: number = 0;

    // Inventory / Legacy Props
    public lootBag: ItemInstance[] = [];
    public lootWeight: number = 0; // V4.0: Encumbrance
    public cooldowns: { [key: string]: number } = {};
    public maxCooldowns: { [key: string]: number } = {};
    public speedMultiplier: number = 1.0;
    public shielded: boolean = false;
    private footprintEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private lastFootprintTime: number = 0;

    // Derived Stats (calculated from Base + Cards + Loot)
    public currentStats = {
        hp: 100, maxHp: 100,
        speed: 1.0,
        atk: 10,
        crit: 5,
        cooldown: 0,
        sizeMod: 1.0,
        projectileCount: 1,
        dodge: 0,
        defense: 0,
        fireRate: 400,
        range: 300
    };

    // Systems
    // We assume Scene has weaponSystem. We can access via (scene as any).weaponSystem

    // Weapon Visuals
    private weaponContainer: Phaser.GameObjects.Container;
    private weaponSprite: Phaser.GameObjects.Graphics;
    private swingEffect: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene, x: number, y: number, id: string, isLocal: boolean) {
        super(scene, x, y);
        this.id = id;
        this.isLocal = isLocal;

        // Shadow
        this.shadow = scene.add.ellipse(0, 0, 40, 15, 0x000000, 0.4);
        this.shadow.setDepth(-1); // [FIX] Behind Character
        this.add(this.shadow);

        // Particle Trail (Dust)
        if (!scene.textures.exists('tex_particle_square')) {
            const g = scene.make.graphics({ x: 0, y: 0, add: false } as any);
            g.fillStyle(0xFFFFFF);
            g.fillRect(0, 0, 4, 4);
            g.generateTexture('tex_particle_square', 4, 4);
        }

        this.emitter = scene.add.particles(0, 0, 'tex_particle_square', {
            speed: 20,
            scale: { start: 1, end: 0 },
            alpha: { start: 0.6, end: 0 },
            lifespan: 600,
            // blendMode: Phaser.BlendModes.NORMAL, // Flat style
            frequency: 40,
            follow: this,
            tint: [0x8B4513, 0xD2B48C, 0xA9A9A9] // Rust, Tan, Gray
        });
        this.emitter.setDepth(-1);

        // Sprite REMOVED. Using Graphics Container.

        // 1. Base Structure (The "Skeleton")
        this.graphics = scene.add.graphics();
        this.add(this.graphics);

        // 2. Core Shape (Hitbox visualizer / shielding)
        // 2. Core Shape (Hitbox visualizer / shielding)
        this.coreShape = scene.add.graphics();
        this.add(this.coreShape);

        // 3. Mechanic Visuals (Overlay)
        this.mechanicGraphics = scene.add.graphics();
        this.add(this.mechanicGraphics);

        // [WEAPON] Container
        this.weaponContainer = scene.add.container(0, 0);
        this.add(this.weaponContainer);

        // Weapon Sprite
        this.weaponSprite = scene.add.graphics();
        this.weaponContainer.add(this.weaponSprite);

        // Swing Effect (Behind weapon)
        this.swingEffect = scene.add.graphics();
        this.swingEffect.setVisible(false);
        this.weaponContainer.addAt(this.swingEffect, 0); // Behind

        // [VISUAL] Footprint Emitter
        // Square pixels for footprints
        this.footprintEmitter = scene.add.particles(0, 0, 'tex_particle_square', {
            lifespan: 2000,
            speed: 0,
            scale: { start: 1, end: 1 }, // Constant pixel size
            alpha: { start: 0.4, end: 0 },
            tint: 0x1a1a1a,     // Dark Ash
            emitting: false,
            angle: 0
        });
        this.footprintEmitter.setDepth(GAME_LAYER.GROUND + 1);

        // Direction Arrow
        if (isLocal) {
            const arrow = scene.add.triangle(0, -28, 0, 0, 6, 10, -6, 10, 0xffffff);
            arrow.setOrigin(0.5, 0.5);
            arrow.setAlpha(0.8);
            this.add(arrow);
        }

        // Physics
        scene.add.existing(this);
        scene.physics.add.existing(this);
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setCircle(16, -16, -16);
        body.setDrag(PHYSICS.drag); // Was 800. Make it snappy.
        body.setDamping(false);
        body.setMaxVelocity(PHYSICS.maxVelocity);
        body.setCollideWorldBounds(true);

        // [V2] PLAYER_WEAPON_ANIM Listener (Data-Driven)
        EventBus.off('PLAYER_WEAPON_ANIM');
        EventBus.on('PLAYER_WEAPON_ANIM', (data: { type: string, weaponId: string }) => {
            switch (data.type) {
                case 'SWING': this.playSwingAnimation(); break;
                case 'THRUST': this.playThrustAnimation(); break;
                case 'SHOOT': this.playShootAnimation(); break;
                case 'THROW': this.playThrowAnimation(); break;
                case 'DRAWBOW': this.playDrawbowAnimation(); break;
            }
        });
    }

    public configure(config: ClassConfig, classId: string) {
        this.classConfig = config;
        this.classId = classId;

        // Input Listener
        // Note: Ideally in constructor, but configure is safe place for logic reset
        // [REMOVED] Dash listener - focusing on core movement/attack loop
        // this.scene.events.off('PLAYER_DASH');
        // this.scene.events.on('PLAYER_DASH', ...);

        // [NEW] Recoil Listener
        EventBus.off('PLAYER_RECOIL'); // Prevent dupes
        EventBus.on('PLAYER_RECOIL', (data: { force: number, angle: number }) => {
            if (this.scene && this.body) {
                const body = this.body as Phaser.Physics.Arcade.Body;
                // Apply force opposite to shooting angle
                body.velocity.x -= Math.cos(data.angle) * data.force;
                body.velocity.y -= Math.sin(data.angle) * data.force;
            }
        });

        // [Weapon 2.0] Trinity Weapon Mapping
        const T0_MAPPING: Partial<Record<string, string>> = {
            'SCAVENGER': 'weapon_crowbar_t0',
            'SKIRMISHER': 'weapon_pistol_t0',
            'WEAVER': 'weapon_drone_t0'
        };

        const defId = T0_MAPPING[classId] || 'weapon_pistol_t0';
        const def = ItemLibrary.get(defId);

        if (def) {
            this.equipWeapon(def);
        } else {
            console.warn(`[Player] Default weapon def not found for ${defId}`);
        }

        // Apply Base Stats
        this.stats.hp = config.stats.hp;
        this.stats.maxHp = config.stats.hp;
        this.stats.speed = config.stats.speed;

        // Redraw with Class Color
        // Initialize Mechanic
        if (this.mechanic) this.mechanic.destroy();

        switch (classId) {
            case 'SCAVENGER': this.mechanic = new ScavengerLogic(this); break;
            case 'SKIRMISHER': this.mechanic = new SkirmisherLogic(this); break;
            case 'WEAVER': this.mechanic = new WeaverLogic(this); break;
            default: this.mechanic = new ScavengerLogic(this); break;
        }

        this.drawGuardian(config.stats.markColor);

        // Initial Weapon Draw (V2: Pass full def for visualCategory)
        this.drawWeapon(def?.id || '', def);
    }

    public equipWeapon(item: ItemDef | ItemInstance) {
        // Method Overload Implementation
        if ('uid' in item) {
            // Already an Instance (RNG Applied)
            this.equippedWeapon = item as ItemInstance;
        } else {
            // Raw Definition (Fallback Construction)
            const def = item as ItemDef;
            this.equippedWeapon = {
                uid: Phaser.Utils.String.UUID(),
                defId: def.id,
                def: def, // [NEW] Link definition
                displayName: def.name,
                name: def.name,
                rarity: (def.rarity as ItemRarity) || ItemRarity.COMMON,
                computedStats: {
                    damage: def.baseStats.damage,
                    range: def.baseStats.range,
                    fireRate: def.baseStats.fireRate,
                    critChance: def.baseStats.critChance || 0,
                    speed: def.baseStats.speed || 0,
                    defense: def.baseStats.defense || 0,
                    hpMax: def.baseStats.hpMax || 0
                }
            };
        }
    }

    drawGuardian(color: number) {
        // [POTATO MODE] Redirect to Potato Architecture
        this.drawPotato(color);
        // Clear legacy graphics if any
        this.coreShape.clear();
    }

    private drawWeapon(defId: string, def?: any) {
        const g = this.weaponSprite;
        g.clear();

        // Default: Hidden
        this.weaponContainer.setVisible(false);

        // [V2] Data-Driven visualCategory
        const category = def?.visualCategory || 'OTHER';

        switch (category) {
            case 'BLUNT':
                // Crowbar / Hammer / Pipe
                this.weaponContainer.setVisible(true);
                this.weaponContainer.setPosition(15, 10);
                g.fillStyle(0x444444, 1);
                g.fillRect(0, 0, 4, 20); // Handle
                g.fillStyle(0xD35400, 1);
                g.fillRect(0, -4, 4, 16); // Grip
                g.fillStyle(0x888888, 1);
                g.fillRect(0, 20, 10, 4); // L-Hook
                break;
            case 'BLADE':
                // Sword / Knife
                this.weaponContainer.setVisible(true);
                this.weaponContainer.setPosition(12, 8);
                g.fillStyle(0xCCCCCC, 1);
                g.fillRect(0, 0, 3, 28); // Blade
                g.fillStyle(0x8B4513, 1);
                g.fillRect(-1, 28, 5, 6); // Hilt
                break;
            case 'PISTOL':
                // Handgun
                this.weaponContainer.setVisible(true);
                this.weaponContainer.setPosition(18, 5);
                g.fillStyle(0x333333, 1);
                g.fillRect(0, 0, 12, 6); // Barrel
                g.fillRect(8, 6, 4, 8); // Grip
                break;
            case 'RIFLE':
                // Long Gun
                this.weaponContainer.setVisible(true);
                this.weaponContainer.setPosition(20, 0);
                g.fillStyle(0x333333, 1);
                g.fillRect(0, 2, 24, 4); // Barrel
                g.fillStyle(0x5D4037, 1);
                g.fillRect(18, 6, 6, 10); // Stock
                break;
            case 'BOW':
                // Bow
                this.weaponContainer.setVisible(true);
                this.weaponContainer.setPosition(15, 0);
                g.lineStyle(2, 0x8B4513, 1);
                g.beginPath();
                g.arc(0, 15, 15, -Math.PI / 2, Math.PI / 2, false);
                g.strokePath();
                g.lineStyle(1, 0xCCCCCC, 1);
                g.beginPath();
                g.moveTo(0, 0);
                g.lineTo(0, 30);
                g.strokePath();
                break;
            case 'DRONE':
            case 'OTHER':
            default:
                // No visible melee weapon (e.g., drones, beams)
                break;
        }
    }

    // [V2] Animation Methods
    private playSwingAnimation() {
        if (!this.weaponContainer.visible) {
            console.warn('[Player] playMeleeAnimation ABORTED: weaponContainer not visible!');
            return;
        }

        // 1. Visual Swing
        this.scene.tweens.add({
            targets: this.weaponContainer,
            angle: { from: -60, to: 100 },
            duration: 120,
            yoyo: true,
            hold: 50,
            onStart: () => {
                // 2. Smear Frame (Solid Fan)
                this.swingEffect.clear();
                this.swingEffect.setVisible(true);
                this.swingEffect.fillStyle(0xFFFFFF, 0.8);
                this.swingEffect.slice(0, 0, 50, Phaser.Math.DegToRad(-20), Phaser.Math.DegToRad(120), false);
                this.swingEffect.fillPath();
            },
            onYoyo: () => {
                this.swingEffect.setVisible(false);
            },
            onComplete: () => {
                this.weaponContainer.angle = 0;
            }
        });

        // 3. Screen Shake (Juice)
        this.scene.cameras.main.shake(50, 0.002);
    }

    private playThrustAnimation() {
        if (!this.weaponContainer.visible) return;
        this.scene.tweens.add({
            targets: this.weaponContainer,
            x: { from: 15, to: 35 },
            duration: 80,
            yoyo: true,
            onStart: () => {
                this.swingEffect.clear();
                this.swingEffect.setVisible(true);
                this.swingEffect.fillStyle(0xFFFFFF, 0.6);
                this.swingEffect.fillRect(20, -5, 30, 10); // Thrust trail
            },
            onYoyo: () => this.swingEffect.setVisible(false),
            onComplete: () => this.weaponContainer.x = 15
        });
        this.scene.cameras.main.shake(30, 0.001);
    }

    private playShootAnimation() {
        // Shoot animation is handled by recoil system, just add muzzle flash
        if (!this.weaponContainer.visible) return;
        const flash = this.scene.add.circle(this.x + Math.cos(this.rotation - Math.PI / 2) * 30, this.y + Math.sin(this.rotation - Math.PI / 2) * 30, 8, 0xFFFF00);
        flash.setBlendMode(Phaser.BlendModes.ADD);
        this.scene.tweens.add({
            targets: flash,
            scale: 0,
            alpha: 0,
            duration: 60,
            onComplete: () => flash.destroy()
        });
    }

    private playThrowAnimation() {
        if (!this.weaponContainer.visible) return;
        this.scene.tweens.add({
            targets: this.weaponContainer,
            angle: { from: -30, to: 60 },
            duration: 150,
            yoyo: true
        });
    }

    private playDrawbowAnimation() {
        if (!this.weaponContainer.visible) return;
        this.scene.tweens.add({
            targets: this.weaponContainer,
            scaleX: { from: 1, to: 0.8 },
            duration: 200,
            yoyo: true
        });
    }

    /**
     * The Potato Scavenger Architecture
     * Concept: Rice-white irregular blob, deadpan face, giant backpack.
     */
    private drawPotato(primaryColor: number) {
        const g = this.graphics;
        g.clear();

        // [LAYER 1] The Giant Backpack (Behind Body)
        // Color: Worn Brown/Green
        g.fillStyle(0x5D4037, 1); // Dark Leather/Rust
        // No Outline
        g.lineStyle(0, 0, 0);

        // Shape: Big Rounded Rect, slightly wider than body
        g.fillRoundedRect(-22, -25, 44, 40, 8);
        // g.strokeRoundedRect(-22, -25, 44, 40, 8);

        // Bedroll on top?
        g.fillStyle(0x556B2F, 1); // Olive Drab
        g.fillRoundedRect(-20, -32, 40, 10, 4);
        // g.strokeRoundedRect(-20, -32, 40, 10, 4);


        // [LAYER 2] The Potato Body
        // Color: Rice White / Off-White
        const potatoColor = 0xF8F8F0;
        g.fillStyle(potatoColor, 1);
        // No Outline
        g.lineStyle(0, 0, 0);

        // Shape: Irregular Oval (Stacked Circles for organic look)
        // Main Body
        g.beginPath();
        g.fillEllipse(0, 5, 20, 18); // Bottom heavy
        // g.strokeEllipse(0, 5, 20, 18);

        // Head/Top
        g.fillEllipse(0, -5, 18, 16);
        // g.strokeEllipse(0, -5, 18, 16);

        // [LAYER 3] The Deadpan Face
        // Eyes: Small black dots, wide set
        g.fillStyle(0x000000, 1);
        g.fillCircle(-8, -5, 2.5); // Left Eye
        g.fillCircle(8, -5, 2.5);  // Right Eye

        // No Mouth (Deadpan)
    }

    public level: number = 1; // [OPERATION ESCALATION] Step 3: Stat Scaling

    // ... (lines 40-272)

    public updateLevelStats(newLevel: number) {
        this.level = newLevel;
        this.recalculateStats();

        // Heal on Level Up?
        this.stats.hp = this.stats.maxHp;
        EventBus.emit('SHOW_FLOATING_TEXT', { x: this.x, y: this.y - 60, text: "FULL HEAL", color: "#00FF00" });
    }

    public recalculateStats() {
        if (!this.classConfig) return;

        // 1. Get Loadout Stats from Inventory Service
        const loadout = inventoryService.getState().loadout;
        const totalStats = inventoryService.calculateTotalStats(loadout, this.classId);

        // 2. Base Config
        const baseHp = this.classConfig.stats.hp;
        const baseSpeed = this.classConfig.stats.speed;

        // [OPERATION ESCALATION] Level Scaling
        // HP: +10% per Level
        // DMG: +5% per Level
        const levelMultHp = 1 + ((this.level - 1) * 0.1);
        const levelMultDmg = 1 + ((this.level - 1) * 0.05);

        // 3. Apply
        this.currentStats.maxHp = Math.floor((baseHp + totalStats.hpMax) * levelMultHp);

        // Apply to current maxHp logic (update stats.maxHp)
        this.stats.maxHp = this.currentStats.maxHp;

        this.currentStats.atk = Math.max(1, totalStats.damage) * levelMultDmg;

        // Speed: Base * (1 + speed/1000?) or Base + Speed?
        // Let's say 100 speed = +1.0 base speed.
        this.currentStats.speed = baseSpeed + (totalStats.speed / 200);
        this.currentStats.atk = Math.floor(this.classConfig.stats.atk + totalStats.damage); // Add item damage to base atk? Or replace? 
        // WeaponSystem uses 'currentStats.damage' usually? 
        // Let's assume WEAPON DAMAGE is the main source, and we add Class ATK as bonus?
        // Actually, logic: Weapon Base + Stats.
        // If totalStats.damage includes Weapon Damage, then we use that.
        this.currentStats.atk = Math.max(1, totalStats.damage);

        // Speed: Base * (1 + speed/1000?) or Base + Speed?
        // Let's treat item speed as flat addition for now or multiplier?
        // T3 legs gives "30". Base speed is 1.0 (approx 200px/s).
        // Let's say 100 speed = +1.0 base speed.
        this.currentStats.speed = baseSpeed + (totalStats.speed / 200);

        this.currentStats.defense = totalStats.defense;
        this.currentStats.crit = ((this.classConfig.stats as any).crit || 5) + (totalStats.critChance * 100);
        this.currentStats.fireRate = totalStats.fireRate;
        this.currentStats.range = totalStats.range;

        // 4. Update Physics
        this.updateMaxSpeed();
        this.drawLootStack();

        // Update Fire Rate
        this.fireRate = this.currentStats.fireRate > 0 ? this.currentStats.fireRate : 400;

        // Visual Scale
        this.setScale(this.currentStats.sizeMod);
    }

    private drawLootStack() {
        // Simple visual: Boxes stacked on back
        if (!this.coreShape) return;
        // Optimization: Don't redraw every frame, only on change? 
        // For now, Player.recalculateStats is only called on change, so this is fine.

        this.coreShape.clear(); // Clear strictly here now

        // We need a separate container for Loot if we want it "on back"?
        // Just cheat and draw rectangles in coreShape for now
        this.coreShape.lineStyle(2, 0xFFD700, 1);
        for (let i = 0; i < this.lootBag.length; i++) {
            this.coreShape.strokeRect(-10, -30 - (i * 6), 20, 6);
        }
    }

    update() {
        // ... (Keep Squash & Stretch Logic mostly same, simplified) ...
        const dt = 16.6;
        const body = this.body as Phaser.Physics.Arcade.Body;
        const speed = body.velocity.length();

        // [REMOVED] Dash Logic - focusing on core movement/attack loop
        // if (this.dashCooldown > 0) this.dashCooldown -= dt;
        // if (this.isDashing) { ... }

        // Z-height (Jump/Bob)
        if (this.z > 0 || this.zVelocity !== 0) {
            this.z += this.zVelocity;
            this.zVelocity -= 0.8;
            if (this.z < 0) { this.z = 0; this.zVelocity = 0; }
        }

        // Update Sprite Y for jump effect (and other attached visuals)
        // this.sprite.y = -this.z; // Deprecated
        // [POTATO MODE] GLOBAL SHADER ACTIVE
        // [VISUAL] Manual Wobble (Re-enabled for Object-Based Wobble)
        // Only wobble the body parts, not the world position
        const time = this.scene.time.now;

        // Body Breathing
        this.graphics.rotation = Math.sin(time / 200) * 0.05; // Gentle rotation
        this.graphics.scaleX = 1 + Math.sin(time / 150) * 0.02; // Squash
        this.graphics.scaleY = 1 + Math.cos(time / 150) * 0.02; // Stretch

        // Backpack Counter-Wobble (Lag behind)
        this.mechanicGraphics.rotation = Math.sin((time - 100) / 200) * 0.05;
        this.mechanicGraphics.y = Math.sin(time / 300) * 2; // Bobbing

        // Z-Height Animation
        this.graphics.y = -this.z;
        this.coreShape.y = -this.z;

        if (speed > 50) {
            this.emitter.active = true;
            const angle = this.rotation + Math.PI / 2;
            this.emitter.followOffset.set(-Math.cos(angle) * 10, -Math.sin(angle) * 10);

            // [VISUAL] Footprint Logic
            // Emit footprint every 250ms if moving
            const now = this.scene.time.now;
            if (now > this.lastFootprintTime + 250) {
                this.footprintEmitter.emitParticleAt(this.x, this.y + 10); // Offset to feet
                this.lastFootprintTime = now;
            }

        } else {
            this.emitter.active = false;
        }

        this.updateMaxSpeed();

        // Mechanic Update
        if (this.mechanic) {
            this.mechanic.update(dt);
            this.mechanicGraphics.clear();
            this.mechanic.draw(this.mechanicGraphics);
        }
    }

    private updateMaxSpeed() {
        const body = this.body as Phaser.Physics.Arcade.Body;
        const base = PHYSICS.maxVelocity;
        const multiplier = this.stats.speed || 1.0;
        body.setMaxVelocity(base * multiplier);
    }

    // [REMOVED] Dash method - focusing on core movement/attack loop
    /*
    public dash() {
        // Disabled for MVP
    }
    */

    // Auto-Fire System (WeaponSystem Hook)
    private lastFireTime: number = 0;
    private fireRate: number = 400; // Base fire rate
    private static enemyQuery: any = null; // [FIX] Static ECS Query

    public autoFire(time: number, world: any) {
        if (!this.classConfig) {
            // logger.debug("AutoFire", `BLOCKED: classConfig=${!!this.classConfig}`);
            return;
        }
        if (!world) {
            // logger.debug("AutoFire", "BLOCKED: world is null");
            return;
        }

        // [SIEGE MODE] Logic
        const isSiege = this.isSiegeMode;

        // [MVP FIX] Always allow firing - no speed restriction
        // Original stop-to-shoot logic was causing issues. For run-and-gun MVP, just fire.
        const canFire = true;

        if (canFire) {
            const target = this.scanForECSTarget(world);

            // logger.debug("AutoFire", `Scanning... target=${target ? `(${target.x.toFixed(0)}, ${target.y.toFixed(0)})` : 'NONE'}`);

            if (target) {
                const controlType = this.equippedWeapon?.def?.controlType || 'AUTO';
                if (!isSiege || controlType === 'AUTO') {
                    const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
                    this.rotation = Phaser.Math.Angle.RotateTo(this.rotation, angle + Math.PI / 2, 0.2);
                }

                // Fire Rate Logic
                let effectiveFireRate = this.fireRate;
                if (isSiege && controlType === 'AUTO') {
                    effectiveFireRate *= 0.7;
                }

                const timeSinceFire = time - this.lastFireTime;
                // logger.debug("AutoFire", `timeSinceFire=${timeSinceFire.toFixed(0)}, fireRate=${effectiveFireRate}, weapon=${this.equippedWeapon?.displayName || 'NONE'}`);

                if (time > this.lastFireTime + effectiveFireRate) {
                    // Fire via WeaponSystem
                    const ws = (this.scene as any).weaponSystem as WeaponSystem;
                    if (ws && this.equippedWeapon) {
                        logger.debug("AutoFire", "FIRING!", { weapon: this.equippedWeapon.displayName, target: `(${target.x.toFixed(0)}, ${target.y.toFixed(0)})` });
                        ws.fire(this.equippedWeapon, {
                            x: this.x, y: this.y, rotation: this.rotation - Math.PI / 2, id: this.id,
                            isSiege: isSiege
                        } as any, this.currentStats, target);
                    } else {
                        logger.debug("AutoFire", `BLOCKED: ws=${!!ws}, equippedWeapon=${!!this.equippedWeapon}`);
                    }
                    this.lastFireTime = time;

                    // Recoil
                    const shootAngle = this.rotation - Math.PI / 2;
                    const body = this.body as Phaser.Physics.Arcade.Body;
                    body.setVelocity(
                        body.velocity.x - Math.cos(shootAngle) * 50,
                        body.velocity.y - Math.sin(shootAngle) * 50
                    );
                }
            } else if (isSiege) {
                // No target in siege mode
            }
        }
    }

    private scanForECSTarget(world: any): { x: number, y: number } | null {
        // [FIX] ECS-based target scanning
        if (!Player.enemyQuery) {
            Player.enemyQuery = defineQuery([Transform, EnemyTag]);
        }

        const enemies = Player.enemyQuery(world);
        let closest: { x: number, y: number } | null = null;
        let minDistSq = 600 * 600; // Range squared (increased from 400)

        for (let i = 0; i < enemies.length; i++) {
            const eid = enemies[i];
            const ex = Transform.x[eid];
            const ey = Transform.y[eid];
            const dx = ex - this.x;
            const dy = ey - this.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < minDistSq) {
                minDistSq = distSq;
                closest = { x: ex, y: ey };
            }
        }
        return closest;
    }

    public takeDamage(amount: number) {
        if (this.isInvulnerable || this.shielded) return; // Legacy shield check?

        // Mechanic Hook
        if (this.mechanic) {
            amount = this.mechanic.onHit(amount);
        }

        if (amount > 0) {
            this.stats.hp -= amount;
            // Standard Take Damage Visuals
            this.scene.cameras.main.shake(50, 0.001);
            EventBus.emit('SHOW_FLOATING_TEXT', { x: this.x, y: this.y, text: `-${Math.floor(amount)}`, color: '#FF0000' });

            // [NEW] Visual Flash (Graphics based)
            if (this.coreShape) {
                this.coreShape.clear();
                this.coreShape.fillStyle(0xff0000, 0.6);
                this.coreShape.fillCircle(0, 0, 20); // Flash circle
                this.scene.time.delayedCall(100, () => {
                    if (this.coreShape) this.coreShape.clear();
                });
            }

            if (this.stats.hp <= 0) {
                // [FIX] Player Death
                this.stats.hp = 0;
                EventBus.emit('PLAYER_DEATH');
            }
        }
    }

    public getDamage(): { dmg: number, isCrit: boolean } {
        const isCrit = Math.random() < (this.stats.crit / 100);
        let dmg = this.stats.atk;
        if (isCrit) dmg *= 1.5;
        return { dmg, isCrit };
    }

    // Zero-Button System: Active skills removed.
    // Logic handled in update() or by InputSystem flick detection.

    destroy(fromScene?: boolean) {
        this.emitter.destroy();
        EventBus.off('PLAYER_RECOIL');
        EventBus.off('PLAYER_WEAPON_ANIM'); // [V2] Cleanup
        super.destroy(fromScene);
    }

    public updateCombat(enemies: Phaser.GameObjects.Group, projectiles: Phaser.GameObjects.Group) {
        // Core Logic for Auto-Fire moved here?
        // Or just keep it as hook.
        // For now, implementing empty to pass build, logic is handled in MainScene update -> commander.autoFire().
        // this.autoFire(this.scene.time.now, enemies);
    }
}