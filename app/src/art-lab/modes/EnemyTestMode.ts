import Phaser from 'phaser';
import { ArtLabState } from '../ArtLabConfig';

interface TestEnemy {
    sprite: Phaser.GameObjects.Sprite;
    health: number;
    maxHealth: number;
    healthBar: Phaser.GameObjects.Graphics;
    damageText: Phaser.GameObjects.Text | null;
}

export class EnemyTestMode {
    private scene: Phaser.Scene;
    private enemies: TestEnemy[] = [];
    private config: ArtLabState | null = null;
    private playerRef: { x: number; y: number } | null = null;
    private hitboxGraphics: Phaser.GameObjects.Graphics | null = null;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    public bindToPlayer(player: { x: number; y: number }) {
        this.playerRef = player;
    }

    public create() {
        console.log('[EnemyTestMode] create() called');

        // Generate enemy texture if not exists
        if (!this.scene.textures.exists('tex_enemy')) {
            const g = this.scene.make.graphics({ x: 0, y: 0 });
            g.fillStyle(0xFF6666); // Red
            g.fillCircle(16, 16, 14);
            g.lineStyle(2, 0xFF0000);
            g.strokeCircle(16, 16, 14);
            g.generateTexture('tex_enemy', 32, 32);
            g.destroy();
            console.log('[EnemyTestMode] Generated tex_enemy texture');
        }

        // Also generate tex_orb as fallback
        if (!this.scene.textures.exists('tex_orb')) {
            const g = this.scene.make.graphics({ x: 0, y: 0 });
            g.fillStyle(0xFFFFFF);
            g.fillCircle(10, 10, 8);
            g.generateTexture('tex_orb', 20, 20);
            g.destroy();
            console.log('[EnemyTestMode] Generated tex_orb texture');
        }

        // Create hitbox visualization graphics
        this.hitboxGraphics = this.scene.add.graphics();
        this.hitboxGraphics.setDepth(5);
    }

    public updateConfig(config: ArtLabState) {
        this.config = config;

        if (!config.enableEnemyTest) {
            this.clearEnemies();
            return;
        }

        // Adjust enemy count
        const currentCount = this.enemies.length;
        const targetCount = config.enemyCount;

        if (currentCount < targetCount) {
            // Spawn more enemies
            for (let i = currentCount; i < targetCount; i++) {
                this.spawnEnemy();
            }
        } else if (currentCount > targetCount) {
            // Remove excess enemies
            for (let i = currentCount - 1; i >= targetCount; i--) {
                this.removeEnemy(i);
            }
        }
    }

    private spawnEnemy() {
        // Use player position or fallback to center (0,0)
        const playerX = this.playerRef?.x ?? 0;
        const playerY = this.playerRef?.y ?? 0;

        // Random position around player (150-300px away)
        const angle = Math.random() * Math.PI * 2;
        const distance = 150 + Math.random() * 150;
        const x = playerX + Math.cos(angle) * distance;
        const y = playerY + Math.sin(angle) * distance;

        console.log(`[EnemyTestMode] Spawning enemy at (${x.toFixed(0)}, ${y.toFixed(0)}), player at (${playerX}, ${playerY})`);

        // Create enemy sprite using dedicated enemy texture
        const sprite = this.scene.add.sprite(x, y, 'tex_enemy');
        sprite.setDepth(8);
        sprite.setScale(1.0);

        // Create health bar
        const healthBar = this.scene.add.graphics();
        healthBar.setDepth(9);

        const maxHealth = this.config?.enemyHealth ?? 100;

        this.enemies.push({
            sprite,
            health: maxHealth,
            maxHealth,
            healthBar,
            damageText: null
        });

        console.log(`[EnemyTestMode] Total enemies: ${this.enemies.length}`);
    }

    private removeEnemy(index: number) {
        const enemy = this.enemies[index];
        if (enemy) {
            enemy.sprite.destroy();
            enemy.healthBar.destroy();
            if (enemy.damageText) enemy.damageText.destroy();
            this.enemies.splice(index, 1);
        }
    }

    private clearEnemies() {
        for (const enemy of this.enemies) {
            enemy.sprite.destroy();
            enemy.healthBar.destroy();
            if (enemy.damageText) enemy.damageText.destroy();
        }
        this.enemies = [];
    }

    public update(time: number, delta: number) {
        if (!this.config?.enableEnemyTest) return;

        const dt = delta / 1000;
        const playerX = this.playerRef?.x ?? 0;
        const playerY = this.playerRef?.y ?? 0;

        // Update each enemy
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];

            // Move towards player
            const dx = playerX - enemy.sprite.x;
            const dy = playerY - enemy.sprite.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 30) { // Stop at 30px from player
                const speed = 50 * this.config.enemySpeed; // pixels per second
                enemy.sprite.x += (dx / dist) * speed * dt;
                enemy.sprite.y += (dy / dist) * speed * dt;
            }

            // Update health bar
            this.updateHealthBar(enemy);

            // Check if dead
            if (enemy.health <= 0) {
                this.onEnemyDeath(enemy, i);
            }

            // Update damage text
            // [REMOVED] Handle by Tween in damageEnemy()
            // if (enemy.damageText) { ... }
        }

        // Draw hitboxes if enabled
        if (this.config.showHitboxes && this.hitboxGraphics) {
            this.hitboxGraphics.clear();
            this.hitboxGraphics.lineStyle(2, 0x00FF00, 0.5);

            for (const enemy of this.enemies) {
                this.hitboxGraphics.strokeCircle(enemy.sprite.x, enemy.sprite.y, 16);
            }
        } else if (this.hitboxGraphics) {
            this.hitboxGraphics.clear();
        }
    }

    private updateHealthBar(enemy: TestEnemy) {
        const g = enemy.healthBar;
        g.clear();

        const barWidth = 40;
        const barHeight = 6; // Slightly thicker
        const x = enemy.sprite.x - barWidth / 2;
        const y = enemy.sprite.y - 32;

        // V2 Style: Wasteland (No borders, High contrast)

        // 1. Background (Void / Abyss)
        g.fillStyle(0x1a1a1a, 0.8);
        g.fillRect(x, y, barWidth, barHeight);

        // 2. Health Fill (Oxide Red)
        // No green/yellow/red logic. Just Oxide.
        // Unless critical (<20%), then maybe Toxic Green or just dark red?
        // Let's stick to Oxide (#CD5C5C) as primary, maybe lighter if full?
        // Guideline: "Solid colors".

        const healthPercent = enemy.health / enemy.maxHealth;
        if (healthPercent > 0) {
            // Oxide Red (#CD5C5C)
            g.fillStyle(0xCD5C5C);
            g.fillRect(x, y, barWidth * healthPercent, barHeight);
        }
    }

    private onEnemyDeath(enemy: TestEnemy, index: number) {
        // Death animation (simple fade)
        this.scene.tweens.add({
            targets: enemy.sprite,
            alpha: 0,
            scale: 0,
            duration: 200,
            onComplete: () => {
                this.removeEnemy(index);

                // Respawn if continuous mode
                if (this.config?.enemySpawnMode === 'CONTINUOUS') {
                    this.spawnEnemy();
                }
            }
        });
    }

    public damageEnemy(enemyIndex: number, damage: number) {
        if (enemyIndex < 0 || enemyIndex >= this.enemies.length) return;

        const enemy = this.enemies[enemyIndex];
        enemy.health -= damage;

        // Flash effect (Bone White #E3DAC9)
        enemy.sprite.setTint(0xE3DAC9);
        this.scene.time.delayedCall(80, () => {
            if (enemy.sprite && enemy.sprite.active) {
                enemy.sprite.clearTint();
            }
        });

        // Damage number
        if (enemy.damageText) enemy.damageText.destroy();

        // Random slight offset for "Jitter" feel
        const jitterX = (Math.random() - 0.5) * 10;

        // Color: Bone (#E3DAC9) for normal, Toxic (#39FF14) for high dmg
        const isCrit = damage > 20;
        const color = isCrit ? '#39FF14' : '#E3DAC9';
        const fontSize = isCrit ? '20px' : '16px';
        const fontStyle = 'bold'; // Monospace ideally, but bold works for now

        enemy.damageText = this.scene.add.text(
            enemy.sprite.x + jitterX,
            enemy.sprite.y - 25,
            `${Math.floor(damage)}`,
            {
                fontSize,
                color,
                fontStyle,
                stroke: '#000000',
                strokeThickness: 3
            }
        );
        enemy.damageText.setOrigin(0.5);
        enemy.damageText.setDepth(20);

        // Retro "Glitch" motion: Pop up, then hold, then disappear
        // Instead of smooth float
        this.scene.tweens.add({
            targets: enemy.damageText,
            y: enemy.damageText.y - 30,
            duration: 150,
            ease: 'Stepped', // Jerky motion
            onComplete: () => {
                this.scene.tweens.add({
                    targets: enemy.damageText,
                    alpha: 0,
                    duration: 100,
                    delay: 200, // Hold for a bit
                    onComplete: () => {
                        if (enemy.damageText && enemy.damageText.active) {
                            enemy.damageText.destroy();
                            enemy.damageText = null;
                        }
                    }
                });
            }
        });
    }

    public getEnemies(): { x: number; y: number; index: number }[] {
        return this.enemies.map((e, i) => ({
            x: e.sprite.x,
            y: e.sprite.y,
            index: i
        }));
    }

    public destroy() {
        this.clearEnemies();
        if (this.hitboxGraphics) {
            this.hitboxGraphics.destroy();
        }
    }
}
