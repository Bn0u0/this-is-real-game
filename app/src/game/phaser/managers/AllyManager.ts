import Phaser from 'phaser';
import { MainScene } from '../scenes/MainScene';
import { SentryTurret } from '../entities/SentryTurret';
import { EventBus } from '../../services/EventBus';

export class AllyManager {
    private scene: MainScene;
    public allyGroup: Phaser.GameObjects.Group;

    constructor(scene: MainScene) {
        this.scene = scene;
        this.allyGroup = scene.add.group();

        // Listeners
        EventBus.on('SPAWN_ALLY', this.handleSpawnAlly, this);
    }

    private handleSpawnAlly(data: any) {
        console.log(`[AllyManager] Spawning: ${data.type}`);

        if (data.type === 'SENTRY_TURRET') {
            const turret = new SentryTurret(this.scene, data.x, data.y, this.scene.weaponSystem);
            this.allyGroup.add(turret);
        }
    }

    public update(time: number, delta: number) {
        // [SIMPLIFIED] No enemyGroup parameter - allies don't interact with ECS enemies yet
        this.allyGroup.getChildren().forEach((child: any) => {
            if (child.active && child.update) {
                child.update(time, delta);
            }
        });
    }

    // [DISABLED] checkCollisions cannot work with ECS enemies
    // TODO: Migrate to ECS collision system if allies are needed

    public clear() {
        this.allyGroup.clear(true, true);
    }

    public destroy() {
        EventBus.off('SPAWN_ALLY', this.handleSpawnAlly, this);
        this.clear();
    }
}
