import Phaser from 'phaser';
import { Player } from '../classes/Player';
// import { Enemy } from '../classes/Enemy'; // [REMOVED]
import { COLORS, PHYSICS } from '../../constants';
import { EventBus } from '../../services/EventBus';
import { LootService } from '../../services/LootService';
import { inventoryService } from '../../services/InventoryService';
import { WeaponSystem } from '../systems/WeaponSystem';
import { WaveManager } from '../managers/WaveManager';
import { ExtractionManager } from '../managers/ExtractionManager';
// import { CombatManager } from '../managers/CombatManager'; [REMOVED]
import { TerrainManager } from '../managers/TerrainManager';
import { InputSystem } from '../systems/InputSystem';
import { EffectManager } from '../managers/EffectManager';
import { NetworkSyncSystem } from '../systems/NetworkSyncSystem';
import { GlitchPipeline } from '../pipelines/GlitchPipeline';
import { InputRecorder } from '../systems/InputRecorder';
import { SoundManager } from '../managers/SoundManager';
import { createWorld, addEntity, addComponent, System } from 'bitecs';
import { createMovementSystem } from '../ecs/systems/MovementSystem';
import { createRenderSystem } from '../ecs/systems/RenderSystem';
import { createCollisionSystem } from '../ecs/systems/CollisionSystem';
import { createLifetimeSystem } from '../ecs/systems/LifetimeSystem';
import { createChaseSystem } from '../ecs/systems/ChaseSystem';
import { createDeathSystem } from '../ecs/systems/DeathSystem';
import { createPlayerCollisionSystem } from '../ecs/systems/PlayerCollisionSystem';
import { Transform, Velocity, SpriteConfig } from '../ecs/Components';

// [NEW MANAGERS]
import { CameraDirector } from '../managers/CameraDirector';
import { PlayerLifecycleManager } from '../managers/PlayerLifecycleManager';
import { ProgressionManager } from '../managers/ProgressionManager';
import { WaypointManager } from '../managers/WaypointManager';
import { AllyManager } from '../managers/AllyManager'; // [NEW]

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
        console.log("⚔️ [MainScene] START_MATCH Received:", data);
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

        console.log(`🏁 [MainScene] GAME OVER. Success: ${success}`);
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
            console.log("🚁 [MainScene] Extraction Successful!");

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
        console.log("🚀 [MainScene] Creating Scene...");
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

        this.waveManager = new WaveManager(this, this.enemyGroup, this.world);
        this.soundManager = new SoundManager();

        // ECS (Phase 1: bitecs)
        console.log("🚀 [ECS] Initializing Phase 1...");
        this.world = createWorld();

        // 初始化系統
        this.systems = [
            createChaseSystem(this.world), // [NEW] 先思考(追蹤)
            createMovementSystem(this.world), // 再行動(移動)
            createPlayerCollisionSystem(this.world), // [NEW] 檢測玩家被撞
            createCollisionSystem(this, this.world), // 再碰撞
            createDeathSystem(this.world),           // [NEW] 檢測死亡並掉寶
            createLifetimeSystem(this.world), // 檢查壽命
            createRenderSystem(this, this.world) // 最後畫出來
        ];

        // 監聽 ECS 發出的死亡事件
        EventBus.on('ENEMY_KILLED_AT', (data: { x: number, y: number, tier: number }) => {
            // 觸發掉寶
            if (this.lootService) this.lootService.trySpawnLoot(data.x, data.y);
            // 加分
            EventBus.emit('ADD_SCORE', 10 * data.tier);
        });

        // 🧪 測試：生成 100 個 ECS 實體
        // 確保有 'tex_orb' 圖片，如果沒有，請用你專案現有的圖片 key 替換
        if (!this.textures.exists('tex_orb')) {
            // 創建一個臨時的白色圓形紋理作為 fallback
            const graphics = this.make.graphics({ x: 0, y: 0, add: false } as any);
            graphics.fillStyle(0xffffff);
            graphics.fillCircle(10, 10, 10);
            graphics.generateTexture('tex_orb', 20, 20);
        }

        for (let i = 0; i < 100; i++) {
            const eid = addEntity(this.world);

            // 添加組件
            addComponent(this.world, Transform, eid);
            addComponent(this.world, Velocity, eid);
            addComponent(this.world, SpriteConfig, eid);

            // 初始化數據
            Transform.x[eid] = this.worldWidth / 2;
            Transform.y[eid] = this.worldHeight / 2;

            // 隨機爆炸速度
            Velocity.x[eid] = (Math.random() - 0.5) * 400;
            Velocity.y[eid] = (Math.random() - 0.5) * 400;

            // 視覺設定
            SpriteConfig.textureId[eid] = 1; // 對應 'tex_orb'
            SpriteConfig.scale[eid] = 0.5 + Math.random() * 0.5;
            SpriteConfig.tint[eid] = 0x00FF00; // 綠色粒子
        }

        // ... (Skipping Test Entity & Lighting & Glitch & Events) ...

        // ... (Skipping Test Entity & Lighting & Glitch & Events) ...

        EventBus.on('JOYSTICK_MOVE', (vec: { x: number, y: number }) => {
            this.inputSystem.setVirtualAxis(vec.x, vec.y);
        });
        EventBus.on('TRIGGER_SKILL', (skill: string) => this.inputSystem.triggerSkill(skill));

        console.log("🔊 [MainScene] Registering START_MATCH Listener...");
        EventBus.on('START_MATCH', this.handleStartMatch, this);
        console.log(`🔊 [MainScene] Listener Registered. Count: ${EventBus.listenerCount('START_MATCH')}`);

        (window as any).SceneEventBus = EventBus;

        EventBus.on('ENEMY_KILLED', (enemy: any) => this.handleEnemyKill(enemy));
        EventBus.on('GAME_OVER_SYNC', this.gameOver, this);
        EventBus.on('RESUME_GAME', () => { this.isPaused = false; this.physics.resume(); });

        this.physics.add.collider(this.projectileGroup, this.terrainManager.wallGroup, (proj: any) => proj.destroy());

        this.setupDevTools();
        EventBus.emit('SCENE_READY');

        // [FIX] Listen for Return to Base
        EventBus.once('RETURN_TO_BASE', () => {
            console.log("🏠 [MainScene] Returning to Workbench...");
            this.scene.start('WorkbenchScene');
        });
    }

    // ... (Handles & CleanStart) ...

    private cleanStart() {
        console.log("[MainScene] 🧹 Cleaning up previous match state...");

        if (this.physics.world.isPaused) {
            this.physics.resume();
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

        // [NEW] 告訴 ECS 玩家在哪裡
        if (this.playerManager.myUnit) {
            this.world.playerX = this.playerManager.myUnit.x;
            this.world.playerY = this.playerManager.myUnit.y;
        }

        // 執行所有系統
        this.systems.forEach(system => system(this.world));

        // [NEW] 處理玩家受傷累積
        if (this.world.playerDamageAccumulator && this.world.playerDamageAccumulator > 1 && this.playerManager.myUnit) {
            // 只有累積超過 1 點傷害才執行，避免過於頻繁呼叫
            const damage = Math.floor(this.world.playerDamageAccumulator);
            this.playerManager.myUnit.takeDamage(damage);

            // 扣除已處理的傷害 (保留小數點部分)
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
            if (this.enemyGroup) myUnit.autoFire(time, this.enemyGroup);
        }

        // Keep WaveManager only for spawning timer
        this.waveManager.update(time, delta, this.progression.survivalTime);

        // Ally Manager?
        this.allyManager.update(time, delta, this.enemyGroup);
        // this.allyManager.checkCollisions(...); // OOP Collision Disabled

        this.runCombatLogic(delta);
        this.extractionManager.update(time, delta);
        this.waypointManager.update();
        this.handleExtraction();

        if (this.lootService && this.lootService.group && myUnit) {
            this.physics.overlap(myUnit, this.lootService.group, (p, l) => this.handleLootPickup(l));
        }

        if (time % 10 < 1) this.emitStatsUpdate();
    }
}
