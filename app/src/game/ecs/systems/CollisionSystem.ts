import { defineSystem, defineQuery, removeEntity, enterQuery, exitQuery } from 'bitecs';
import { Transform, EnemyTag, ProjectileTag, Health, Damage, SpriteConfig, Velocity, VisualEffect } from '../components';

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

                    // 2. 擊退邏輯 (NEW)
                    // 使用子彈速度方向作為擊退方向
                    const vx = Velocity.x[pid];
                    const vy = Velocity.y[pid];
                    const speed = Math.sqrt(vx * vx + vy * vy) || 1;
                    const knockbackForce = 120; // 基礎擊退力

                    Velocity.x[eid] += (vx / speed) * knockbackForce;
                    Velocity.y[eid] += (vy / speed) * knockbackForce;

                    // 3. 視覺反饋 (NEW)
                    VisualEffect.tintFlash[eid] = 0xFFFFFF; // 閃白
                    VisualEffect.flashTimer[eid] = 100;     // 100ms

                    // 4. 銷毀子彈
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
