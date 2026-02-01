import { ZOMBIE_WALKER } from './zombies/BasicZombie';
import { ZOMBIE_SPRINTER } from './zombies/FastZombie';
import { ZOMBIE_TANK } from './zombies/TankZombie';
import { EnemyDef } from '../../../../types';

// Map of all enemies by ID
export const EnemyLibrary = new Map<string, EnemyDef>();

const enemies = [
    ZOMBIE_WALKER,
    ZOMBIE_SPRINTER,
    ZOMBIE_TANK
];

enemies.forEach(enemy => {
    EnemyLibrary.set(enemy.id, enemy);
});

export const getAllEnemies = () => Array.from(EnemyLibrary.values());
export const getEnemy = (id: string) => EnemyLibrary.get(id);

// Compatibility with old spawner logic temporarily
export const ENEMY_LIBRARY = {
    getAll: getAllEnemies,
    getByFaction: (faction: string) => getAllEnemies(), // Placeholder
    getRandom: () => {
        const all = getAllEnemies();
        return all[Math.floor(Math.random() * all.length)];
    }
};
