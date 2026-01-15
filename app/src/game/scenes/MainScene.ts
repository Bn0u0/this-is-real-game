import Phaser from 'phaser';
import { Player } from '../phaser/actors/Player';
// import { Enemy } from '../classes/Enemy'; // [REMOVED]
import { COLORS, PHYSICS } from '../../constants';
import { EventBus } from '../../services/EventBus';
import { LootService } from '../../services/LootService';
import { inventoryService } from '../../services/InventoryService';
import { WeaponSystem } from '../phaser/systems/WeaponSystem';
import { WaveManager } from '../phaser/managers/WaveManager';
import { ExtractionManager } from '../phaser/managers/ExtractionManager';
// import { CombatManager } from '../managers/CombatManager'; [REMOVED]
import { TerrainManager } from '../phaser/managers/TerrainManager';
import { InputSystem } from '../phaser/systems/InputSystem';
import { EffectManager } from '../phaser/managers/EffectManager';
import { NetworkSyncSystem } from '../phaser/systems/NetworkSyncSystem';
import { GlitchPipeline } from '../phaser/pipelines/GlitchPipeline';
import { InputRecorder } from '../phaser/systems/InputRecorder';
import { SoundManager } from '../phaser/managers/SoundManager';
import { createWorld, addEntity, addComponent, System } from 'bitecs';
import { createMovementSystem } from '../ecs/systems/MovementSystem';
import { createRenderSystem } from '../ecs/systems/RenderSystem';
import { createCollisionSystem } from '../ecs/systems/CollisionSystem';
import { createLifetimeSystem } from '../ecs/systems/LifetimeSystem';
import { createChaseSystem } from '../ecs/systems/ChaseSystem';
import { createDeathSystem } from '../ecs/systems/DeathSystem';
import { createPlayerCollisionSystem } from '../ecs/systems/PlayerCollisionSystem';
import { Transform, Velocity, SpriteConfig } from '../ecs/components';

// [NEW MANAGERS]
import { CameraDirector } from '../phaser/managers/CameraDirector';
import { PlayerLifecycleManager } from '../phaser/managers/PlayerLifecycleManager';
import { ProgressionManager } from '../phaser/managers/ProgressionManager';
import { WaypointManager } from '../phaser/managers/WaypointManager';
import { AllyManager } from '../phaser/managers/AllyManager'; // [NEW]

type GameMode = 'SINGLE' | 'MULTI';

const AMBER_STYLE = {
    bg: 0x2D1B2E,
    ambient: 0x665566,
    playerLight: 0xFFD1A9,
    glitchBase: 0.02,
    glitchPeak: 0.5
};

export class MainScene extends Phaser.Scene {
    declare public cameras: Phaser.Cameras.Scene2D.CameraManager;
    declare public add: Phaser.GameObjects.GameObjectFactory;
    declare public time: Phaser.Time.Clock;
    declare public events: Phaser.Events.EventEmitter;
    declare public physics: Phaser.Physics.Arcade.ArcadePhysics;
    declare public input: Phaser.Input.InputPlugin;
    declare public scale: Phaser.Scale.ScaleManager;
    declare public renderer: Phaser.Renderer.WebGL.WebGLRenderer;

    // Managers (Refactored)
    public cameraDirector!: CameraDirector;
    public playerManager!: PlayerLifecycleManager;
    public progression!: ProgressionManager;
    public waypointManager!: WaypointManager;
    public allyManager!: AllyManager; // [NEW]

    private enemyGroup!: Phaser.GameObjects.Group;
    private projectileGroup!: Phaser.GameObjects.Group;
    // allyGroup removed (Moved to Manager)

    // [NEW] Declarations for Build Fix
    public statsModifiers: { playerSpeed: number } = { playerSpeed: 1.0 }; // [FIX] Added default
    public worldWidth: number = 3200; // 50 * 64 (TerrainManager)
    public worldHeight: number = 3200;

    public lootService!: LootService;
    public effectManager!: EffectManager;
    public terrainManager!: TerrainManager;
    public weaponSystem!: WeaponSystem;
    public inputSystem!: InputSystem;
    public inputRecorder!: InputRecorder;
    public networkSyncSystem!: NetworkSyncSystem;
    // public combatManager!: CombatManager;
    public extractionManager!: ExtractionManager;
    public waveManager!: WaveManager;
    public soundManager!: SoundManager;
    // public ecsWorld!: World; // [REMOVED] Old ECS
    private world: any;
    private systems: System[] = [];

    public isPaused: boolean = false;
    public isGameActive: boolean = false;

    constructor() {
        super('MainScene');
    }

    // [FIX] Missing Methods stub
    public handleStartMatch(data: any) {
        console.log("?? [MainScene] START_MATCH Received:", data);
        this.isGameActive = true;
        this.isPaused = false;
        this.cleanStart();

        // 1. Spawn Player
        const role = data.hero || 'SCAVENGER';
        const startX = this.worldWidth / 2;
        const startY = this.worldHeight / 2;

        const player = this.playerManager.spawnPlayer(role, this.worldWidth, this.worldHeight, this.networkSyncSystem, this.waveManager);

        // 2. Setup Camera
        this.cameraDirector.follow(player);
        this.cameras.main.setZoom(1.0);
        this.cameras.main.fadeIn(1000);

        // 3. Start Systems
        this.waveManager.start(1); // Start Wave 1

        // 4. UI Notification
        EventBus.emit('MATCH_STARTED', { hero: role });
    }

    public runCombatLogic(dt: number) {
        if (!this.playerManager.myUnit) return;

        // Player Updates (Collision, Stats) handled in Player class mostly
        // Here we could handle global combat rules or objectives
    }

    public handleEnemyKill(enemy: any) {
        this.waveManager.onEnemyKilled(enemy);
        this.lootService.tryDropLoot(enemy.x, enemy.y);

        // Score/XP
        EventBus.emit('ADD_SCORE', 100);
    }

    public gameOver(success: boolean) {
        this.isGameActive = false;
        this.physics.pause();

        console.log(`?? [MainScene] GAME OVER. Success: ${success}`);
        EventBus.emit('GAME_OVER', { success, score: 0, wave: this.waveManager.currentWave });

        // Visuals
        this.cameras.main.shake(500, 0.01);
        this.cameras.main.fade(2000, 0x000000);
    }

    public handleExtraction() {
        if (!this.playerManager.myUnit) return;

        // Check overlap with extraction zones
        if (this.extractionManager.checkExtraction(this.playerManager.myUnit)) {
            // [CORE LOOP] Success!
            console.log("?? [MainScene] Extraction Successful!");

            // 1. Secure Loot
            const securedCount = inventoryService.secureBackpack();
            EventBus.emit('SHOW_FLOATING_TEXT', {
                x: this.playerManager.myUnit.x,
                y: this.playerManager.myUnit.y - 100,
                text: `EXTRACTED! +${securedCount} ITEMS`,
                color: '#00FF00'
            });

            // 2. Play Sound
            EventBus.emit('PLAY_SFX', 'EXTRACTION_COMPLETE');

            // 3. Game Over (Win)
            this.gameOver(true);
        }
    }

    public handleLootPickup(item: any) {
        if (this.playerManager.myUnit) {
            // Apply item effect or add to inventory
            // For now, destroy visuals
            item.destroy();
            // Play Sound
        }
    }

    public emitStatsUpdate() {
        if (this.playerManager.myUnit) {
            const p = this.playerManager.myUnit;
            EventBus.emit('STATS_UPDATE', {
                hp: p.stats.hp,
                maxHp: p.stats.maxHp,
                xp: this.progression.xp,
                level: p.level,
                xpToNextLevel: this.progression.xpToNextLevel,
                score: this.progression.score,
                survivalTime: this.progression.survivalTime
            });
        }
    }

    public handleResize(width: number, height: number) {
        this.cameras.main.setViewport(0, 0, width, height);
        this.cameraDirector?.resize(width, height);
    }

    public setupDevTools() {
        // Optional key bindings
        this.input.keyboard?.on('keydown-K', () => {
            this.enemyGroup.clear(true, true);
        });
    }

    // ... (Lines 60-118 skipped) ...

    create() {
        console.log("?? [MainScene] Creating Scene...");

        // [CRITICAL FIX] Initialize ECS World FIRST
        // This ensures all Managers/Systems that receive it in constructor have a valid reference.
        this.world = createWorld();
        this.world.playerDamageAccumulator = 0; // [FIX] Initialize
        console.log("?? [ECS] World Initialized.");

        this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

        // Groups
        this.enemyGroup = this.add.group();
        this.projectileGroup = this.add.group();

        // Init Managers
        this.cameraDirector = new CameraDirector(this, this.worldWidth, this.worldHeight);
        this.playerManager = new PlayerLifecycleManager(this);
        this.progression = new ProgressionManager(this);
        this.waypointManager = new WaypointManager(this);
        this.allyManager = new AllyManager(this); // [NEW]

        // Init Systems
        this.lootService = new LootService(this);
        this.effectManager = new EffectManager(this);
        this.terrainManager = new TerrainManager(this);
        this.terrainManager.generateWorld();

        this.weaponSystem = new WeaponSystem(this, this.world);
        this.inputSystem = new InputSystem(this);
        this.inputRecorder = new InputRecorder();
        this.networkSyncSystem = new NetworkSyncSystem(this);
        // this.combatManager = new CombatManager(this); // [REMOVED]
        this.extractionManager = new ExtractionManager(this, this.worldWidth, this.worldHeight);

        // [NEW] Register Waypoints
        this.extractionManager.getZones().forEach((z: any) => {
            this.waypointManager.addTarget({
                x: z.x,
                y: z.y,
                label: 'EXIT',
                color: 0x00FF00
            });
        });

        this.waveManager = new WaveManager(this, this.world);
        this.soundManager = new SoundManager();

        // ECS (Phase 1: bitecs)
        console.log("?? [ECS] Initializing Phase 1 Systems...");
        // this.world = createWorld(); // [REMOVED] Moved to top of create()

        // ???頂蝯?
        this.systems = [
            createChaseSystem(this.world), // [NEW] ??餈質馱)
            createMovementSystem(this.world), // ????蝘餃?)
            createPlayerCollisionSystem(this.world), // [NEW] 瑼Ｘ葫?拙振鋡急?
            createCollisionSystem(this, this.world), // ?１??
            createDeathSystem(this.world),           // [NEW] 瑼Ｘ葫甇颱滿銝行?撖?
            createLifetimeSystem(this.world), // 瑼Ｘ憯賢
            createRenderSystem(this, this.world) // ?敺?箔?
        ];

        // ?? ECS ?澆?香鈭∩?隞?
        EventBus.on('ENEMY_KILLED_AT', (data: { x: number, y: number, textureId: number }) => {
            // 閫貊 ECS ?窄 (?湔?喳漣璅?憿?)
            this.waveManager.spawnLootAt(data.x, data.y, data.textureId);
            // ??
            EventBus.emit('ADD_SCORE', 10);
        });

        // ?妒 皜祈岫嚗???100 ??ECS 撖阡?
        // 蝣箔???'tex_orb' ??嚗?????隢雿?獢???? key ?踵?
        if (!this.textures.exists('tex_orb')) {
            // ?萄遣銝????質?耦蝝?雿 fallback
            const graphics = this.make.graphics({ x: 0, y: 0, add: false } as any);
            graphics.fillStyle(0xffffff);
            graphics.fillCircle(10, 10, 10);
            graphics.generateTexture('tex_orb', 20, 20);
        }

        for (let i = 0; i < 100; i++) {
            const eid = addEntity(this.world);

            // 瘛餃?蝯辣
            addComponent(this.world, Transform, eid);
            addComponent(this.world, Velocity, eid);
            addComponent(this.world, SpriteConfig, eid);

            // ?????
            Transform.x[eid] = this.worldWidth / 2;
            Transform.y[eid] = this.worldHeight / 2;

            // ?冽???漲
            Velocity.x[eid] = (Math.random() - 0.5) * 400;
            Velocity.y[eid] = (Math.random() - 0.5) * 400;

            // 閬死閮剖?
            SpriteConfig.textureId[eid] = 1; // 撠? 'tex_orb'
            SpriteConfig.scale[eid] = 0.5 + Math.random() * 0.5;
            SpriteConfig.tint[eid] = 0x00FF00; // 蝬蝎?
        }

        // Register Glitch Pipeline
        if (this.renderer instanceof Phaser.Renderer.WebGL.WebGLRenderer) {
            this.renderer.pipelines.addPostPipeline('GlitchPipeline', GlitchPipeline);
            this.cameras.main.setPostPipeline('GlitchPipeline');
        }

        EventBus.on('JOYSTICK_MOVE', (vec: { x: number, y: number }) => {
            this.inputSystem.setVirtualAxis(vec.x, vec.y);
        });
        EventBus.on('TRIGGER_SKILL', (skill: string) => this.inputSystem.triggerSkill(skill));

        console.log("?? [MainScene] Registering START_MATCH Listener...");
        EventBus.on('START_MATCH', this.handleStartMatch, this);
        console.log(`?? [MainScene] Listener Registered. Count: ${EventBus.listenerCount('START_MATCH')}`);

        (window as any).SceneEventBus = EventBus;

        EventBus.on('ENEMY_KILLED', (enemy: any) => this.handleEnemyKill(enemy));
        EventBus.on('GAME_OVER_SYNC', this.gameOver, this);
        EventBus.on('RESUME_GAME', () => { this.isPaused = false; this.physics.resume(); });

        this.physics.add.collider(this.projectileGroup, this.terrainManager.wallGroup, (proj: any) => proj.destroy());

        this.setupDevTools();
        EventBus.emit('SCENE_READY');

        // [FIX] Player Death Listener
        EventBus.on('PLAYER_DEATH', () => {
            console.log("?? [MainScene] Player Died!");
            this.gameOver(false);
        });

        // [FIX] Listen for Return to Base
        EventBus.once('RETURN_TO_BASE', () => {
            console.log("?? [MainScene] Returning to Workbench...");
            this.scene.start('WorkbenchScene');
        });
    }

    // ... (Handles & CleanStart) ...

    private cleanStart() {
        console.log("[MainScene] ?完 Cleaning up previous match state...");

        // [FIX] Safety Check
        if (this.physics && this.physics.world) {
            if (this.physics.world.isPaused) {
                this.physics.resume();
            }
        }
        this.isPaused = false;
        this.isGameActive = false;

        if (this.enemyGroup) this.enemyGroup.clear(true, true);
        if (this.projectileGroup) this.projectileGroup.clear(true, true);

        // [NEW] Clean Allies
        if (this.allyManager) this.allyManager.clear();

        if (this.lootService && this.lootService['group']) {
            // @ts-ignore
            this.lootService['group'].clear(true, true);
        }

        if (this.playerManager.myUnit) {
            this.playerManager.myUnit.destroy();
            this.playerManager.myUnit = null;
        }
    }

    // ... (StartMatch) ...

    // [REMOVED] fixedUpdate (Logic merged into update)

    // ... (Rest of file) ...

    cleanup() {
        this.scale.off('resize', this.handleResize, this);

        // [FIX] Clean up ALL EventBus Listeners
        EventBus.off('START_MATCH', this.handleStartMatch, this);
        EventBus.off('JOYSTICK_MOVE');
        EventBus.off('JOYSTICK_AIM');
        EventBus.off('JOYSTICK_SKILL');
        EventBus.off('ENEMY_KILLED');
        EventBus.off('GAME_OVER_SYNC', this.gameOver, this);
        EventBus.off('RESUME_GAME');

        if (this.allyManager) this.allyManager.destroy(); // [NEW]
    }
    update(time: number, delta: number) {
        if (!this.world) return;

        // Update ECS World Context
        this.world.dt = delta;
        this.world.time = time; // [NEW] Time Injection for Systems

        // [NEW] ?迄 ECS ?拙振?典鋆?
        if (this.playerManager.myUnit) {
            this.world.playerX = this.playerManager.myUnit.x;
            this.world.playerY = this.playerManager.myUnit.y;
        }

        // ?瑁???頂蝯?
        this.systems.forEach(system => system(this.world));

        // [NEW] ???拙振?蝝舐?
        if (this.world.playerDamageAccumulator && this.world.playerDamageAccumulator > 1 && this.playerManager.myUnit) {
            // ?芣?蝝舐?頞? 1 暺摰單??瑁?嚗???潮蝜??
            const damage = Math.floor(this.world.playerDamageAccumulator);
            this.playerManager.myUnit.takeDamage(damage);

            // ??撌脰????瑕拿 (靽?撠暺??
            this.world.playerDamageAccumulator -= damage;
        }

        // [CLEANUP] Remove old Manager updates that drive OOP objects
        // this.waveManager.update(...) -> Removed
        // this.enemyGroup.update(...) -> Removed
        // this.ecsWorld.update(...) -> Removed

        // Managers that still need update (Logic only, no Heavy Loop)
        this.progression.update(delta);

        const myUnit = this.playerManager.myUnit;
        if (myUnit) {
            this.inputSystem.processInput(this.input, this.cameras, myUnit, this.statsModifiers);
            this.cameraDirector.updateLookahead(this.inputSystem.getVirtualAxis().x, this.inputSystem.getVirtualAxis().y);
            if (this.world) myUnit.autoFire(time, this.world); // [FIX] Pass ECS World
        }

        // Keep WaveManager only for spawning timer
        this.waveManager.update(time, delta, this.progression.survivalTime);

        // Ally Manager (ECS-incompatible features disabled)
        this.allyManager.update(time, delta);

        this.runCombatLogic(delta);
        this.extractionManager.update(time, delta);
        this.waypointManager.update();
        this.handleExtraction();

        if (this.lootService && this.lootService.group && myUnit) {
            this.lootService.update(time, delta, myUnit);
            this.physics.overlap(myUnit, this.lootService.group, (p, l) => this.handleLootPickup(l));
        }

        // [FIX] Emit Stats Every Frame for Immediate UI Update
        this.emitStatsUpdate();
    }
}
