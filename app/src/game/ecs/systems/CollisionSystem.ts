import { defineSystem, defineQuery, removeEntity, enterQuery, exitQuery } from 'bitecs';
import { Transform, EnemyTag, ProjectileTag, Health, Damage, SpriteConfig, Velocity } from '../Components';

export const createCollisionSystem = (scene: Phaser.Scene, world: any) => {
    // 查詢所有敵人
    const enemyQuery = defineQuery([Transform, EnemyTag, Health]);

    // 查詢所有子彈
    const projectileQuery = defineQuery([Transform, ProjectileTag, Damage]);

    // 用於漂浮文字的 EventBus (假設 MainScene 有全域 EventBus 或者從 scene 取得)
    const eventBus = (scene as any).events; // Phaser Scene Events as bus for now, or use global EventBus

    return defineSystem((world: any) => {
        const enemies = enemyQuery(world);
        const projectiles = projectileQuery(world);

        // O(N*M) 簡單碰撞檢測
        // 在 1000 實體下可能需要 Spatial Partitioning (Grid/Quadtree)，但 Phase 1 先暴力解
        for (let pIdx = 0; pIdx < projectiles.length; ++pIdx) {
            const pid = projectiles[pIdx];

            // [FIX] Friendly Fire Check
            // Owner 0 = Enemy, 1 = Player
            // If projectile is from Enemy (0), simple CollisionSystem (PvE) should ignore it.
            // We need a separate System for Enemy Projectile vs Player? 
            // Or just check here? 
            // Current System is: Projectile vs EnemyQuery.
            // So if Owner is Enemy, SKIP.
            if (Damage.ownerId[pid] === 0) continue;

            // 子彈位置
            const px = Transform.x[pid];
            const py = Transform.y[pid];
            const pRadius = 10; // 假設子彈半徑

            for (let eIdx = 0; eIdx < enemies.length; ++eIdx) {
                const eid = enemies[eIdx];

                // 敵人位置
                const ex = Transform.x[eid];
                const ey = Transform.y[eid];
                const eRadius = 20; // 假設敵人半徑

                // 距離判定 (Squared distance for perf)
                const dx = px - ex;
                const dy = py - ey;
                const distSq = dx * dx + dy * dy;
                const radiusSum = pRadius + eRadius;

                if (distSq < radiusSum * radiusSum) {
                    // HIT!

                    // 1. 扣血
                    const dmg = Damage.value[pid] || 10;
                    Health.current[eid] -= dmg;

                    // 2. 顯示漂浮文字 (透過 EventBus)
                    // console.log(`[Collision] Projectile ${pid} hit Enemy ${eid} for ${dmg} dmg`);
                    // 注意：這裡假設全域 EventBus 可用，或者我們觸發 Scene 事件
                    // scene.events.emit('SHOW_FLOATING_TEXT', ...); 
                    // 暫時用 console log 驗證

                    // 3. 銷毀子彈
                    removeEntity(world, pid);

                    // 4. 不在這裡處理死亡
                    // 讓 DeathSystem 統一處理 (檢測 HP <= 0 並觸發掉寶事件)

                    // 子彈已銷毀，跳出內層迴圈 (不能再撞其他敵人，除非是穿透彈)
                    break;
                }
            }
        }

        return world;
    });
};
