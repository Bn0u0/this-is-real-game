import { defineSystem, defineQuery, addEntity, addComponent } from 'bitecs';
import { Transform, Velocity, EnemyTag, Stats, CombatState, ProjectileTag, Damage, Lifetime, SpriteConfig } from '../components';

export const createChaseSystem = (world: any) => {
    // 查詢所有「是敵人」且「有位置、有速度」的實體
    const enemyQuery = defineQuery([Transform, Velocity, EnemyTag]);

    return defineSystem((world: any) => {
        // 從 world context 獲取玩家位置 (需要在 MainScene 更新時注入)
        const playerX = world.playerX || 0;
        const playerY = world.playerY || 0;

        const entities = enemyQuery(world);
        const speed = 50; // 暫時寫死，之後可以從 Component 讀取 (例如 Stats.speed)

        for (let i = 0; i < entities.length; ++i) {
            const id = entities[i];

            // 簡單的追蹤邏輯：計算指向玩家的角度
            const dx = playerX - Transform.x[id];
            const dy = playerY - Transform.y[id];
            const distSq = dx * dx + dy * dy;
            const angle = Math.atan2(dy, dx);

            // [AI 1.1] 簡單射程檢查 (Kiting)
            // 如果有定義攻擊距離，且距離小於攻擊距離，則停止移動 (Velocity = 0)

            // [AI 1.1] 簡單射程檢查 (Kiting)
            const range = Stats.attackRange[id] || 0;
            if (range > 0 && distSq < range * range) {
                // 停止移動
                Velocity.x[id] = 0;
                Velocity.y[id] = 0;

                // [AI 2.0] 攻擊邏輯 (Shooter)
                // 檢查是否可以攻擊
                const time = world.time || 0; // 需要在 MainScene update 注入 world.time
                const lastAttack = CombatState.lastAttackTime[id];
                const cooldown = CombatState.cooldown[id];

                if (time > lastAttack + cooldown) {
                    // 發射子彈!
                    const pid = addEntity(world);

                    addComponent(world, Transform, pid);
                    addComponent(world, Velocity, pid);
                    addComponent(world, SpriteConfig, pid);
                    addComponent(world, ProjectileTag, pid);
                    addComponent(world, Damage, pid);
                    addComponent(world, Lifetime, pid);

                    // Init Projectile
                    Transform.x[pid] = Transform.x[id];
                    Transform.y[pid] = Transform.y[id];
                    Transform.rotation[pid] = angle;

                    const pSpeed = 400; // Enemy Projectile Speed
                    Velocity.x[pid] = Math.cos(angle) * pSpeed;
                    Velocity.y[pid] = Math.sin(angle) * pSpeed;

                    SpriteConfig.textureId[pid] = 1; // 'tex_orb' (Reusing orb for now)
                    SpriteConfig.scale[pid] = 0.5;
                    SpriteConfig.tint[pid] = 0x00FF00; // Green Enemy Bullet

                    Damage.value[pid] = Stats.damage[id] || 10;
                    Damage.ownerId[pid] = 0; // 0 = Enemy (Friendly Fire? No, PlayerCollision checks Logic)
                    // Wait, CollisionSystem checks Projectile vs Enemy.
                    // We need PlayerCollision to check Projectile vs Player?
                    // Currently CollisionSystem is Projectile(Any) vs Enemy.
                    // If we spawn Enemy Bullet, CollisionSystem might hurt Enemy?
                    // We need to fix CollisionSystem owner check.

                    Lifetime.remaining[pid] = 2000;
                    Lifetime.total[pid] = 2000;

                    // Update Cooldown
                    CombatState.lastAttackTime[id] = time;
                }

            } else {
                // 追擊
                const speed = Stats.speed[id] || 50;
                Velocity.x[id] = Math.cos(angle) * speed;
                Velocity.y[id] = Math.sin(angle) * speed;
            }

            // 可選：更新旋轉角度讓圖片面向玩家
            Transform.rotation[id] = angle;
        }

        return world;
    });
};
