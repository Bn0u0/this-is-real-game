import Phaser from 'phaser';
import { defineSystem, defineQuery, enterQuery, exitQuery } from 'bitecs';
import { Transform, SpriteConfig } from '../Components';

// 簡單的 Texture 映射表 (暫時寫死，之後可移至 Config)
const TEXTURE_MAP: Record<number, string> = {
    1: 'circle',       // Boss / Projectile
    2: 'square',       // Elite / Wall
    3: 'triangle',     // Basic Enemy
    4: 'tex_orb'       // Legacy
};

export const createRenderSystem = (scene: Phaser.Scene, world: any) => {
    // 查詢所有需要渲染的實體
    const renderableQuery = defineQuery([Transform, SpriteConfig]);
    const enterRender = enterQuery(renderableQuery);
    const exitRender = exitQuery(renderableQuery);

    // 實體 ID -> Phaser Sprite 的映射緩存
    const spriteMap = new Map<number, Phaser.GameObjects.Sprite>();

    return defineSystem((world: any) => {
        // 1. 處理新生成的實體 (Create)
        const newEntities = enterRender(world);
        for (let i = 0; i < newEntities.length; ++i) {
            const id = newEntities[i];
            const texId = SpriteConfig.textureId[id];
            const textureKey = TEXTURE_MAP[texId] || 'tex_orb'; // 預設圖

            // 創建 Phaser Sprite
            const sprite = scene.add.sprite(Transform.x[id], Transform.y[id], textureKey);

            // 應用初始設定
            sprite.setScale(SpriteConfig.scale[id] || 1);
            if (SpriteConfig.tint[id] !== 0) {
                sprite.setTint(SpriteConfig.tint[id]);
            }

            spriteMap.set(id, sprite);
        }

        // 2. 處理被移除的實體 (Destroy)
        const deadEntities = exitRender(world);
        for (let i = 0; i < deadEntities.length; ++i) {
            const id = deadEntities[i];
            const sprite = spriteMap.get(id);
            if (sprite) {
                sprite.destroy();
                spriteMap.delete(id);
            }
        }

        // 3. 同步位置與旋轉 (Update)
        const entities = renderableQuery(world);
        for (let i = 0; i < entities.length; ++i) {
            const id = entities[i];
            const sprite = spriteMap.get(id);
            if (sprite) {
                sprite.setPosition(Transform.x[id], Transform.y[id]);
                sprite.setRotation(Transform.rotation[id]);
            }
        }

        return world;
    });
};
