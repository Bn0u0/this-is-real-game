import { defineQuery, defineSystem, enterQuery, exitQuery } from 'bitecs';
import { Transform, EnemyTag, Health, WeaponTag, OrbitConfig, AttackState, WeaponStats, VisualEffect } from '../components';
import { MainScene } from '../../scenes/MainScene';

/**
 * WeaponCollisionSystem (ECS)
 * 
 * Brotato-Style: Detects collisions between attacking weapons and enemies.
 * This replaces the old "Pulse AOE" model with per-frame hitbox detection.
 * 
 * The system queries for:
 * 1. Weapons with [WeaponTag, AttackState.isActive === 1]
 * 2. Enemies with [EnemyTag, Transform, Health]
 * 
 * For each attacking weapon, it checks overlap with each enemy.
 * 
 * NOTE: For V4.0, we use a simplified approach:
 * - Get attacking weapons from WeaponOrbitManager (OOP bridge)
 * - Iterate enemies via ECS query
 * - Damage on overlap
 */

// ECS Queries
const enemyQuery = defineQuery([EnemyTag, Transform, Health]);

// Track hit enemies this frame (prevent multi-hit per attack)
const hitThisFrame: Set<number> = new Set();

export const createWeaponCollisionSystem = (scene: MainScene) => {
    return defineSystem((world) => {
        // Clear hit tracking each frame
        hitThisFrame.clear();

        // 1. Get attacking weapons from OOP manager
        const player = (scene as any).playerManager?.myUnit;
        if (!player || !player.weaponOrbitManager) return world;

        const attackingWeapons = player.weaponOrbitManager.getAttackingWeapons();
        if (attackingWeapons.length === 0) return world;

        // 2. Get all enemies
        const enemies = enemyQuery(world);

        // 3. For each attacking weapon, check collision with each enemy
        for (const weapon of attackingWeapons) {
            // Weapon hitbox (circle approximation)
            const wX = weapon.x;
            const wY = weapon.y;

            // Use attackConfig or fallback to baseStats
            const hitboxWidth = weapon.def.attackConfig?.hitboxWidth ??
                (weapon.def.baseStats?.range ? weapon.def.baseStats.range * 0.5 : 40);
            const hitboxRadius = hitboxWidth / 2;

            // Calculate damage
            const baseDamage = weapon.def.baseStats?.damage ?? 10;
            // Attack progress affects damage (optional: wind-up mechanic)
            // const damageMultiplier = Math.sin(weapon.progress * Math.PI); // Peak at 50%
            const damageMultiplier = 1.0; // Fixed damage for now
            const finalDamage = baseDamage * damageMultiplier;

            for (let i = 0; i < enemies.length; i++) {
                const eid = enemies[i];

                // Skip if already hit this frame
                if (hitThisFrame.has(eid)) continue;

                const eX = Transform.x[eid];
                const eY = Transform.y[eid];

                // Simple circle collision (enemy assumed 16px radius)
                const enemyRadius = 16;
                const dx = eX - wX;
                const dy = eY - wY;
                const distSq = dx * dx + dy * dy;
                const combinedRadius = hitboxRadius + enemyRadius;

                if (distSq < combinedRadius * combinedRadius) {
                    // HIT!
                    Health.current[eid] -= finalDamage;
                    hitThisFrame.add(eid);

                    // Visual feedback: Flash white
                    if (VisualEffect) {
                        VisualEffect.tintFlash[eid] = 0xFFFFFF;
                        VisualEffect.flashTimer[eid] = 100; // 100ms flash
                    }

                    // Knockback (optional)
                    // const angle = Math.atan2(dy, dx);
                    // Impact.forceX[eid] = Math.cos(angle) * 5;
                    // Impact.forceY[eid] = Math.sin(angle) * 5;

                    // Debug log
                    // console.log(`[WeaponCollisionSystem] Hit! Weapon ${weapon.id} -> Enemy ${eid} for ${finalDamage} damage`);
                }
            }
        }

        return world;
    });
};
