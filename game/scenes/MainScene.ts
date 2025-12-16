
import Phaser from 'phaser';
import { Player } from '../classes/Player';
import { Enemy } from '../classes/Enemy';
import { COLORS, PHYSICS, FX } from '../../constants';
import { EventBus } from '../../services/EventBus';
import { UpgradeType } from '../../types';
import { network } from '../../services/NetworkService';

type WaveState = 'PREPARING' | 'SPAWNING' | 'COMBAT' | 'COMPLETE';

export class MainScene extends Phaser.Scene {
    declare public game: Phaser.Game;
    declare public cameras: Phaser.Cameras.Scene2D.CameraManager;
    declare public add: Phaser.GameObjects.GameObjectFactory;
    declare public time: Phaser.Time.Clock;
    declare public events: Phaser.Events.EventEmitter;
    declare public physics: Phaser.Physics.Arcade.ArcadePhysics;
    declare public input: Phaser.Input.InputPlugin;
    declare public scene: Phaser.Scenes.ScenePlugin;
    declare public tweens: Phaser.Tweens.TweenManager;

    private localPlayer: Player | null = null;
    private drone: Player | null = null;

    private players: Player[] = [];
    private enemyGroup: Phaser.GameObjects.Group | null = null;
    private graphics: Phaser.GameObjects.Graphics | null = null;
    private bgGrid: Phaser.GameObjects.Grid | null = null;

    // Game Stats
    private isPaused: boolean = false;
    private level: number = 1;
    private xp: number = 0;
    private xpToNextLevel: number = 10;
    private score: number = 0;
    private hp: number = 100;
    private maxHp: number = 100;

    // Wave Manager
    private wave: number = 1;
    private waveState: WaveState = 'PREPARING';
    private enemiesToSpawn: number = 0;
    private spawnTimer: Phaser.Time.TimerEvent | null = null;
    private nextWaveTimer: Phaser.Time.TimerEvent | null = null;

    // Modifiers (Skills)
    private statsModifiers = {
        tetherLength: 1.0,
        droneSpeed: 1.0,
        playerSpeed: 1.0
    };

    constructor() {
        super('MainScene');
    }

    async create() {
        // 0. Initialize Network (Get ID) - Idempotent in mock
        await network.initialize('COMMANDER');

        // 1. Reset Stats on Restart
        this.resetGame();

        // 2. Setup World
        this.cameras.main.setBackgroundColor(COLORS.bg);
        // Add a subtle vignette effect using a gradient texture if we had one, or a big circle overlay

        this.bgGrid = this.add.grid(0, 0, 4000, 4000, 100, 100, COLORS.bg, 0, COLORS.grid, 0.2);
        this.bgGrid.setDepth(-10);

        // 3. Graphics
        this.graphics = this.add.graphics();
        this.graphics.setDepth(50);

        // 4. Enemy Group
        this.enemyGroup = this.add.group({ classType: Enemy, runChildUpdate: true });

        // 5. Create Player
        this.localPlayer = new Player(this, 0, 0, network.myId, true);
        this.localPlayer.setDepth(100);
        this.players.push(this.localPlayer);

        // 6. Create Drone
        this.spawnDrone(200, 0);

        // 7. Camera
        this.cameras.main.startFollow(this.localPlayer, true, 0.08, 0.08);
        this.cameras.main.setZoom(0.85);

        // 8. Event Listeners
        // Important: Clean up old listeners before adding new ones to avoid duplicates if scene wasn't fully shutdown
        EventBus.off('APPLY_UPGRADE', this.applyUpgrade, this);
        EventBus.off('RESUME_GAME', this.resumeGame, this);
        EventBus.off('START_GAME', this.startGame, this);

        EventBus.on('APPLY_UPGRADE', this.applyUpgrade, this);
        EventBus.on('RESUME_GAME', this.resumeGame, this);
        EventBus.on('START_GAME', this.startGame, this);

        // Enable multi-touch pointers (though we mainly use one)
        this.input.addPointer(1);

        this.events.on('shutdown', () => {
            this.cleanup();
        });

        // Initial HUD update
        this.emitStatsUpdate();

        // Start First Wave
        this.startWave(1);
    }

    cleanup() {
        EventBus.off('APPLY_UPGRADE', this.applyUpgrade, this);
        EventBus.off('RESUME_GAME', this.resumeGame, this);
        EventBus.off('START_GAME', this.startGame, this);

        this.players = [];
        if (this.enemyGroup) this.enemyGroup.clear(true, true);
        if (this.spawnTimer) this.spawnTimer.remove(false);
        if (this.nextWaveTimer) this.nextWaveTimer.remove(false);
    }

    resetGame() {
        this.level = 1;
        this.xp = 0;
        this.xpToNextLevel = 10;
        this.score = 0;
        this.hp = 100;
        this.wave = 1;
        this.isPaused = false;
        this.players = [];
        this.statsModifiers = { tetherLength: 1.0, droneSpeed: 1.0, playerSpeed: 1.0 };
        this.physics.resume();
    }

    startGame() {
        // Called by App.tsx when hitting "Retry" or "Start"
        this.scene.restart();
    }

    spawnDrone(x: number, y: number) {
        this.drone = new Player(this, x, y, 'DRONE', false);
        this.drone.setDepth(100);
        this.players.push(this.drone);

        const label = this.add.text(0, -35, 'UNIT-α', {
            fontFamily: 'monospace', fontSize: '10px', color: '#FF0055', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.drone.add(label);
    }

    // --- WAVE LOGIC ---

    startWave(waveNumber: number) {
        this.wave = waveNumber;
        this.waveState = 'SPAWNING';

        const isEliteWave = this.wave % 5 === 0;
        const baseCount = 8 + (this.wave * 2);
        this.enemiesToSpawn = isEliteWave ? baseCount * 1.5 : baseCount;
        const spawnRate = isEliteWave ? 400 : 800;

        EventBus.emit('WAVE_START', { wave: this.wave, isElite: isEliteWave });
        this.emitStatsUpdate();

        if (this.spawnTimer) this.spawnTimer.remove(false);
        this.spawnTimer = this.time.addEvent({
            delay: spawnRate,
            callback: () => this.spawnEnemyStep(isEliteWave),
            callbackScope: this,
            loop: true
        });
    }

    spawnEnemyStep(isElite: boolean) {
        if (this.enemiesToSpawn <= 0) {
            if (this.spawnTimer) this.spawnTimer.remove(false);
            this.waveState = 'COMBAT';
            return;
        }
        this.spawnOneEnemy(isElite);
        this.enemiesToSpawn--;
    }

    spawnOneEnemy(isEliteWave: boolean) {
        if (!this.localPlayer) return;

        const minRadius = 800;
        const maxRadius = 1200;
        const radius = minRadius + Math.random() * (maxRadius - minRadius);
        const angle = Math.random() * Math.PI * 2;

        const spawnX = this.localPlayer.x + Math.cos(angle) * radius;
        const spawnY = this.localPlayer.y + Math.sin(angle) * radius;

        const enemy = new Enemy(this, spawnX, spawnY);

        const speedScale = 1 + (this.wave * 0.05);
        const hpScale = 1 + (this.wave * 0.1);
        enemy.setDifficulty(speedScale, hpScale, isEliteWave);

        this.enemyGroup?.add(enemy);
        this.emitStatsUpdate();
    }

    checkWaveStatus() {
        if (this.waveState === 'COMBAT') {
            if (this.enemyGroup?.countActive() === 0) {
                this.completeWave();
            }
        }
    }

    completeWave() {
        this.waveState = 'COMPLETE';
        EventBus.emit('WAVE_COMPLETE', this.wave);
        this.hp = Math.min(this.hp + 5, this.maxHp);
        this.emitStatsUpdate();

        if (this.nextWaveTimer) this.nextWaveTimer.remove(false);
        this.nextWaveTimer = this.time.delayedCall(4000, () => {
            this.startWave(this.wave + 1);
        });
    }

    // --- GAME LOOP ---

    update(time: number, delta: number) {
        this.updateBackground(time);

        if (this.isPaused) return;

        this.processPlayerMovement();
        this.updateDroneAI();

        // Enemy Logic
        this.enemyGroup?.getChildren().forEach((child) => {
            const enemy = child as Enemy;
            enemy.seekPlayer(this.players, 100);
        });

        this.renderTethers(time);
        this.checkCollisions();
        this.checkWaveStatus();
    }

    processPlayerMovement() {
        if (!this.localPlayer) return;
        const body = this.localPlayer.body as Phaser.Physics.Arcade.Body;
        const pointer = this.input.activePointer;

        // New Input Logic: Move towards pointer if held down
        if (pointer.isDown) {
            // Calculate world position of pointer
            const worldPoint = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;

            const dx = worldPoint.x - this.localPlayer.x;
            const dy = worldPoint.y - this.localPlayer.y;
            const angle = Math.atan2(dy, dx);

            body.setDrag(PHYSICS.drag);

            const accel = PHYSICS.acceleration * this.statsModifiers.playerSpeed;

            body.setAcceleration(
                Math.cos(angle) * accel,
                Math.sin(angle) * accel
            );

            // Smooth Rotate to move direction
            const targetRotation = angle + Math.PI / 2;
            let nextRotation = Phaser.Math.Angle.RotateTo(this.localPlayer.rotation, targetRotation, PHYSICS.rotationLerp);
            this.localPlayer.setRotation(nextRotation);

        } else {
            // No input: Cut engines, drag takes over
            body.setAcceleration(0, 0);
            body.setDrag(PHYSICS.drag);
        }

        this.localPlayer.update();
    }

    updateBackground(time: number) {
        if (this.bgGrid) {
            this.bgGrid.setAlpha(0.15 + Math.sin(time / 3000) * 0.05);
            const cam = this.cameras.main;
            (this.bgGrid as any).tilePositionX = cam.scrollX * 0.5;
            (this.bgGrid as any).tilePositionY = cam.scrollY * 0.5;
        }
    }

    updateDroneAI() {
        if (!this.drone || !this.localPlayer) return;
        const p = this.localPlayer;
        const d = this.drone;

        const orbitSpeedBase = 0.03;
        const orbitSpeed = orbitSpeedBase * this.statsModifiers.droneSpeed;

        const desiredDist = 220;
        const currentAngle = Phaser.Math.Angle.Between(p.x, p.y, d.x, d.y);
        const targetAngle = currentAngle + orbitSpeed;

        const targetX = p.x + Math.cos(targetAngle) * desiredDist;
        const targetY = p.y + Math.sin(targetAngle) * desiredDist;

        const dx = targetX - d.x;
        const dy = targetY - d.y;

        const body = d.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(dx * 8, dy * 8);

        if (body.velocity.length() > 20) {
            const moveAngle = Math.atan2(body.velocity.y, body.velocity.x);
            d.setRotation(moveAngle + Math.PI / 2);
        }
        d.update();
    }

    checkCollisions() {
        if (!this.localPlayer || !this.drone) return;

        // A. Tether vs Enemies
        const p1 = this.localPlayer;
        const p2 = this.drone;
        const dist = Phaser.Math.Distance.Between(p1.x, p1.y, p2.x, p2.y);
        const maxTetherLen = PHYSICS.tetherDistance * 2.2 * this.statsModifiers.tetherLength;

        if (dist < maxTetherLen) {
            const tetherLine = new Phaser.Geom.Line(p1.x, p1.y, p2.x, p2.y);
            const enemies = this.enemyGroup?.getChildren() as Enemy[];
            const enemyCircle = new Phaser.Geom.Circle(0, 0, 15);

            for (const enemy of enemies) {
                if (enemy.isDead) continue;
                if (Phaser.Math.Distance.Between(enemy.x, enemy.y, p1.x, p1.y) > dist + 100) continue;

                enemyCircle.setPosition(enemy.x, enemy.y);
                if (Phaser.Geom.Intersects.LineToCircle(tetherLine, enemyCircle)) {
                    this.handleEnemyKill(enemy);
                }
            }
        }

        // B. Enemies vs Player
        const enemies = this.enemyGroup?.getChildren() as Enemy[];
        const playerRadius = 20;
        for (const enemy of enemies) {
            if (enemy.isDead) continue;
            const distToPlayer = Phaser.Math.Distance.Between(enemy.x, enemy.y, p1.x, p1.y);
            if (distToPlayer < playerRadius + 18) {
                this.takeDamage(15);
                enemy.kill();
                this.cameras.main.shake(100, 0.015);
            }
        }
    }

    handleEnemyKill(enemy: Enemy) {
        if (enemy.isDead) return;
        enemy.kill();
        this.cameras.main.shake(40, 0.003);
        this.score += 10;
        this.xp += 1;

        if (this.xp >= this.xpToNextLevel) {
            this.levelUp();
        }
        this.emitStatsUpdate();
    }

    takeDamage(amount: number) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.hp = 0;
            this.gameOver();
        }
        this.emitStatsUpdate();
    }

    gameOver() {
        this.isPaused = true;
        this.physics.pause();
        if (this.spawnTimer) this.spawnTimer.remove(false);
        this.cameras.main.zoomTo(1.2, 2000, 'Power2');
        EventBus.emit('GAME_OVER', { score: this.score, level: this.level, wave: this.wave });
    }

    levelUp() {
        this.level++;
        this.xp = 0;
        this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5);
        this.isPaused = true;
        this.physics.pause();
        EventBus.emit('LEVEL_UP', this.level);
    }

    resumeGame() {
        this.isPaused = false;
        this.physics.resume();
    }

    applyUpgrade(type: UpgradeType) {
        switch (type) {
            case UpgradeType.TETHER_LENGTH:
                this.statsModifiers.tetherLength += 0.3;
                break;
            case UpgradeType.DRONE_SPEED:
                this.statsModifiers.droneSpeed += 0.3;
                break;
            case UpgradeType.PLAYER_SPEED:
                this.statsModifiers.playerSpeed += 0.25;
                break;
            case UpgradeType.REPAIR:
                this.hp = Math.min(this.hp + 40, this.maxHp);
                this.emitStatsUpdate();
                break;
        }
        this.resumeGame();
    }

    emitStatsUpdate() {
        EventBus.emit('STATS_UPDATE', {
            hp: this.hp,
            maxHp: this.maxHp,
            level: this.level,
            xp: this.xp,
            xpToNextLevel: this.xpToNextLevel,
            score: this.score,
            wave: this.wave,
            enemiesAlive: this.enemyGroup?.countActive() || 0
        });
    }

    renderTethers(time: number) {
        if (!this.graphics || !this.localPlayer || !this.drone) return;
        this.graphics.clear();

        const p1 = this.localPlayer;
        const p2 = this.drone;
        const dist = Phaser.Math.Distance.Between(p1.x, p1.y, p2.x, p2.y);
        const maxLen = PHYSICS.tetherDistance * 2.2 * this.statsModifiers.tetherLength;

        if (dist < maxLen) {
            this.drawTether(p1, p2, dist, time, maxLen);
        }
    }

    drawTether(p1: Player, p2: Player, dist: number, time: number, maxDist: number) {
        if (!this.graphics) return;

        const t = Math.min(1, dist / (maxDist * 0.9));

        const colorObj = Phaser.Display.Color.Interpolate.ColorWithColor(
            Phaser.Display.Color.ValueToColor(COLORS.primary),
            Phaser.Display.Color.ValueToColor(COLORS.secondary),
            100, t * 100
        );
        const color = Phaser.Display.Color.GetColor(colorObj.r, colorObj.g, colorObj.b);
        const baseAlpha = Phaser.Math.Linear(0.9, 0.4, t);

        this.graphics.lineStyle(6, color, baseAlpha * 0.5);
        this.graphics.beginPath();
        this.graphics.moveTo(p1.x, p1.y);
        this.graphics.lineTo(p2.x, p2.y);
        this.graphics.strokePath();

        this.graphics.lineStyle(2, 0xffffff, 1);
        this.graphics.beginPath();
        this.graphics.moveTo(p1.x, p1.y);

        const segments = Math.floor(dist / 15);
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const perpX = -dy / dist;
        const perpY = dx / dist;

        for (let k = 1; k < segments; k++) {
            const ratio = k / segments;
            const tx = p1.x + dx * ratio;
            const ty = p1.y + dy * ratio;
            const jitterAmount = (Math.sin(time * 0.05 + k) * 3 + (Math.random() - 0.5) * 6) * (1 - t * 0.5);
            this.graphics.lineTo(tx + perpX * jitterAmount, ty + perpY * jitterAmount);
        }
        this.graphics.lineTo(p2.x, p2.y);
        this.graphics.strokePath();
    }
}
