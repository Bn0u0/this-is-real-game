import { ItemDef } from '../../../../../types';

/**
 * T5: 新手級原始武器 (最弱)
 * 概念: 完全未加工的天然物品，撿起來就能當武器
 */
export const T5_WEAPONS: ItemDef[] = [
    // 1. 拳頭 (必備 - 最後手段)
    {
        id: 'w_fist_t5',
        name: '拳頭',
        type: 'WEAPON',
        slot: 'mainWeapon',
        tier: 5,
        rarity: 'COMMON',
        baseStats: { damage: 8, range: 35, fireRate: 350, speed: 1.0, critChance: 0.05, defense: 0, hpMax: 0 },
        description: '你的雙手。雖然原始但可靠。近距離肉搏的最後手段。',
        icon: 'weapon_fist',
        behavior: 'MELEE_THRUST',
        visualCategory: 'BLUNT',
        controlType: 'MANUAL',
        siegeBehavior: 'NONE',
        orbitConfig: { radius: 25, speed: 0 },
        attackConfig: { duration: 120, hitboxWidth: 35, hitboxHeight: 35, hitboxOffset: { x: 15, y: 0 } }
    },

    // 2. 破瓶子 (近戰)
    {
        id: 'w_broken_bottle_t5',
        name: '破瓶子',
        type: 'WEAPON',
        slot: 'mainWeapon',
        tier: 5,
        rarity: 'COMMON',
        baseStats: { damage: 10, range: 35, fireRate: 350, speed: 1.0, critChance: 0.12, defense: 0, hpMax: 0 },
        description: '打碎的玻璃瓶。鋒利的邊緣能造成割傷。',
        icon: 'weapon_bottle',
        behavior: 'MELEE_THRUST',
        visualCategory: 'BLADE',
        controlType: 'MANUAL',
        siegeBehavior: 'NONE',
        orbitConfig: { radius: 35, speed: 3.0 },
        attackConfig: { duration: 100, hitboxWidth: 30, hitboxHeight: 30, hitboxOffset: { x: 10, y: 0 } }
    },

    // 3. 石頭 (投擲)
    {
        id: 'w_rock_t5',
        name: '石頭',
        type: 'WEAPON',
        slot: 'mainWeapon',
        tier: 5,
        rarity: 'COMMON',
        baseStats: { damage: 8, range: 180, fireRate: 800, speed: 350, critChance: 0.05, defense: 0, hpMax: 0 },
        description: '地上撿的石頭。人類最原始的遠程武器。',
        icon: 'weapon_rock',
        behavior: 'PISTOL_SHOT',
        visualCategory: 'OTHER',
        controlType: 'MANUAL',
        siegeBehavior: 'NONE',
        orbitConfig: { radius: 35, speed: 2.0 }
    }
];
