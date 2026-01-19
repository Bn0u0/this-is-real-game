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
import { PlayerRig } from '../visuals/PlayerRig'; // [NEW V2]
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

    // Visuals
    public classId: string = 'SCAVENGER'; // Default
    public z: number = 0;
    public zVelocity: number = 0;

    // Inventory / Legacy Props
    public lootBag: ItemInstance[] = [];
    public lootWeight: number = 0; // V4.0: Encumbrance
    public cooldowns: { [key: string]: number } = {};
    public maxCooldowns: { [key: string]: number } = {};
    public speedMultiplier: number = 1.0;
    public shielded: boolean = false;
    public emitter!: Phaser.GameObjects.Particles.ParticleEmitter;
    private lastFootprintTime: number = 0;

    // Derived Stats
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
        range: 300,
        hpMax: 100
    };

    // [V2] Visual Puppet (The Rig)
    public rig: PlayerRig;

    public level: number = 1; // [OPERATION ESCALATION] Step 3: Stat Scaling

    constructor(scene: Phaser.Scene, x: number, y: number, id: string, isLocal: boolean) {
        super(scene, x, y);
        this.id = id;
        this.isLocal = isLocal;

        // [V2] Initialize Rig
        this.rig = new PlayerRig(scene, 0, 0);
        this.add(this.rig);

        // [LEGACY CLEANUP] Manual graphics creation removed.
        // Shadow, Emitter, Graphics, etc. are now inside Rig or deprecated.

        // [PHYSICS RESTORATION]
        scene.physics.world.enable(this);
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setSize(24, 24);
        body.setOffset(-12, -12);
        body.setCollideWorldBounds(true);
        scene.add.existing(this);

        this.createEmitter(scene);
    }

    private createEmitter(scene: Phaser.Scene) {
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
            frequency: 40,
            follow: this,
            tint: [0x8B4513, 0xD2B48C, 0xA9A9A9] // Rust, Tan, Gray
        });
        this.emitter.setDepth(-1);
    }

    public configure(config: ClassConfig, classId: string) {
        this.classConfig = config;
        this.classId = classId;

        // [NEW] Recoil Listener
        EventBus.off('PLAYER_RECOIL');
        EventBus.on('PLAYER_RECOIL', (data: { force: number, angle: number }) => {
            if (this.scene && this.body) {
                const body = this.body as Phaser.Physics.Arcade.Body;
                body.velocity.x -= Math.cos(data.angle) * data.force;
                body.velocity.y -= Math.sin(data.angle) * data.force;
            }
        });

        // [Weapon 2.0] Trinity Weapon Mapping
        const T0_MAPPING: Partial<Record<string, string>> = {
            'SCAVENGER': 'weapon_crowbar_t0',
            'SKIRMISHER': 'weapon_pistol_t0',
            'GUARDIAN': 'weapon_shield_t0',
            'WEAVER': 'weapon_drone_t0'
        };

        const defId = T0_MAPPING[classId] || 'weapon_crowbar_t0';
        const def = ItemLibrary.get(defId);

        // Equip Initial Weapon (Data)
        // Equip Initial Weapon (Data)
        if (def) {
            this.equipWeapon(def);
        } else {
            console.warn(`[Player] Default weapon def not found for ${defId}`);
        }

        // Apply Base Stats
        this.stats.hp = config.stats.hp;
        this.stats.maxHp = config.stats.hp;
        this.stats.speed = config.stats.speed;

        // Initialize Mechanic
        if (this.mechanic) this.mechanic.destroy();

        switch (classId) {
            case 'SCAVENGER': this.mechanic = new ScavengerLogic(this); break;
            case 'SKIRMISHER': this.mechanic = new SkirmisherLogic(this); break;
            case 'WEAVER': this.mechanic = new WeaverLogic(this); break;
            default: this.mechanic = new ScavengerLogic(this); break;
        }
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

        // [V2] Sync with Rig
        if (this.equippedWeapon.def && this.rig) {
            this.rig.equipWeapon(this.equippedWeapon.def);
        }
    }

    // [V2] Animation Methods
    public playSwingAnimation(angle?: number) {
        if (this.rig) this.rig.playSwing();
        // 3. Screen Shake (Juice)
        if (this.scene) this.scene.cameras.main.shake(50, 0.002);
    }

    public playThrustAnimation(angle?: number) {
        if (this.rig) this.rig.playSwing(); // Fallback
        if (this.scene) this.scene.cameras.main.shake(30, 0.001);
    }

    public playShootAnimation(angle?: number) {
        // Delegated to Rig (Recoil handled in EventBus)
    }

    public playThrowAnimation(angle?: number) {
        // Delegated to Rig
    }

    public playDrawbowAnimation(angle?: number) {
        // Delegated to Rig
    }

    public updateLevelStats(newLevel: number) {
        this.level = newLevel;
        this.recalculateStats();

        // Heal on Level Up?
        this.stats.hp = this.stats.maxHp;
        EventBus.emit('SHOW_FLOATING_TEXT', { x: this.x, y: this.y - 60, text: "FULL HEAL", color: "#00FF00" });
    }

    public recalculateStats() {
        if (!this.classConfig) return;

        // 1. Get Loadout Stats
        const loadout = inventoryService.getState().loadout;
        const totalStats = inventoryService.calculateTotalStats(loadout, this.classId);

        // 2. Base Config
        const baseHp = this.classConfig.stats.hp;
        const baseSpeed = this.classConfig.stats.speed;

        // Scaling
        const levelMultHp = 1 + ((this.level - 1) * 0.1);
        const levelMultDmg = 1 + ((this.level - 1) * 0.05);

        // 3. Apply
        this.currentStats.maxHp = Math.floor((baseHp + totalStats.hpMax) * levelMultHp);
        this.stats.maxHp = this.currentStats.maxHp;
        this.currentStats.atk = Math.max(1, totalStats.damage) * levelMultDmg;
        this.currentStats.speed = baseSpeed + (totalStats.speed / 200);

        this.currentStats.defense = totalStats.defense;
        this.currentStats.crit = ((this.classConfig.stats as any).crit || 5) + (totalStats.critChance * 100);
        this.currentStats.fireRate = totalStats.fireRate;
        this.currentStats.range = totalStats.range;

        // 4. Update Physics
        this.updateMaxSpeed();

        // Update Fire Rate
        this.stats.hp = Math.min(this.stats.hp, this.stats.maxHp);

        // Visual Scale
        this.setScale(this.currentStats.sizeMod);
    }

    public update(time: number, delta: number) {
        if (!this.active) return;

        const body = this.body as Phaser.Physics.Arcade.Body;
        const speed = body.velocity.length();
        const isMoving = speed > 10;

        // [V2] Delegate Visuals to Rig
        if (this.rig) {
            this.rig.updateAnim(time, this.speedMultiplier, isMoving);
            this.rig.y = -this.z;
        }

        // Z-height (Jump/Bob)
        if (this.z > 0 || this.zVelocity !== 0) {
            this.z += this.zVelocity;
            this.zVelocity -= 0.8;
            if (this.z < 0) { this.z = 0; this.zVelocity = 0; }
        }

        if (speed > 50) {
            this.emitter.active = true;
            const angle = this.rotation + Math.PI / 2;
            this.emitter.followOffset.set(-Math.cos(angle) * 10, -Math.sin(angle) * 10);
        } else {
            this.emitter.active = false;
        }

        this.updateMaxSpeed();

        // Mechanic Update
        if (this.mechanic) {
            this.mechanic.update(delta);
        }
    }

    private updateMaxSpeed() {
        const body = this.body as Phaser.Physics.Arcade.Body;
        const base = PHYSICS.maxVelocity;
        const multiplier = this.stats.speed || 1.0;
        body.setMaxVelocity(base * multiplier);
    }

    // Auto-Fire System (WeaponSystem Hook)
    private lastFireTime: number = 0;
    private fireRate: number = 400; // Base fire rate
    private static enemyQuery: any = null;

    public autoFire(time: number, world: any) {
        if (!this.classConfig || !world) return;

        // [SIEGE MODE] Logic
        const isSiege = this.isSiegeMode;
        const canFire = true; // Always allow in running logic

        if (canFire) {
            const target = this.scanForECSTarget(world);

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

                if (time > this.lastFireTime + effectiveFireRate) {
                    // Fire via WeaponSystem
                    const ws = (this.scene as any).weaponSystem as WeaponSystem;
                    if (ws && this.equippedWeapon) {
                        ws.fire(this.equippedWeapon, {
                            x: this.x, y: this.y, rotation: this.rotation - Math.PI / 2, id: this.id,
                            isSiege: isSiege
                        } as any, this.currentStats, target);
                    }
                    this.lastFireTime = time;

                    // Recoil
                    if (this.body) {
                        const shootAngle = this.rotation - Math.PI / 2;
                        const body = this.body as Phaser.Physics.Arcade.Body;
                        body.setVelocity(
                            body.velocity.x - Math.cos(shootAngle) * 50,
                            body.velocity.y - Math.sin(shootAngle) * 50
                        );
                    }
                }
            }
        }
    }

    private scanForECSTarget(world: any, maxRange: number = 200): { x: number, y: number } | null {
        if (!Player.enemyQuery) {
            Player.enemyQuery = defineQuery([Transform, EnemyTag]);
        }

        const enemies = Player.enemyQuery(world);
        let closest: { x: number, y: number } | null = null;

        // Range check
        const checkRange = maxRange + 50;
        let minDistSq = checkRange * checkRange;

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
        if (this.isInvulnerable || this.shielded) return;

        if (this.mechanic) {
            amount = this.mechanic.onHit(amount);
        }

        if (amount > 0) {
            this.stats.hp -= amount;
            this.scene.cameras.main.shake(50, 0.001);
            EventBus.emit('SHOW_FLOATING_TEXT', { x: this.x, y: this.y, text: `-${Math.floor(amount)}`, color: '#FF0000' });

            if (this.stats.hp <= 0) {
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

    public startCombat() {
        // Hook
    }

    public updateCombat(enemies: Phaser.GameObjects.Group, projectiles: Phaser.GameObjects.Group) {
        // Hook
    }

    destroy(fromScene?: boolean) {
        if (this.emitter) this.emitter.destroy();
        EventBus.off('PLAYER_RECOIL');
        EventBus.off('PLAYER_WEAPON_ANIM');
        if (this.mechanic) this.mechanic.destroy();
        super.destroy(fromScene);
    }
}