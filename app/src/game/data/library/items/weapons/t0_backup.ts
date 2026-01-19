import { ItemDef } from '../../../../../types';

export const T0_WEAPONS: ItemDef[] = [
    {
        id: 'w_fist_t0',
        name: '拳頭',
        type: 'WEAPON',
        slot: 'mainWeapon',
        tier: 0,
        rarity: 'COMMON',
        baseStats: { damage: 10, range: 40, fireRate: 400, speed: 1.0, critChance: 0.1, defense: 0, hpMax: 0 },
        description: '你的雙手。雖然原始但可靠。',
        icon: 'weapon_fist',
        behavior: 'MELEE_THRUST',
        visualCategory: 'BLUNT',
        controlType: 'MANUAL',
        siegeBehavior: 'NONE'
    },
    {
        id: 'weapon_crowbar_t0',
        name: '幸運撬棍',
        type: 'WEAPON',
        slot: 'mainWeapon',
        tier: 0,
        rarity: 'COMMON',
        baseStats: { damage: 25, range: 60, fireRate: 800, speed: 1.0, critChance: 0.05, defense: 0, hpMax: 0 },
        description: '一把普通的撬棍',
        icon: 'weapon_crowbar',
        hitbox: {
            shape: 'CIRCLE',
            offset: 40,
            width: 60,
            duration: 150
        },
        behavior: 'MELEE_SWEEP',
        visualCategory: 'BLUNT', // [V2] Data-driven weapon visual
        controlType: 'HYBRID', // Exceptions handling: Melee Hybrid = Slow Forward
        siegeBehavior: 'SLOW_CHARGE'
    },
    {
        id: 'weapon_pistol_t0',
        name: '老夥計',
        type: 'WEAPON',
        slot: 'mainWeapon',
        tier: 0,
        rarity: 'COMMON',
        baseStats: { damage: 12, range: 400, fireRate: 600, speed: 1.0, critChance: 0.05, defense: 0, hpMax: 0 },
        description: '生鏽的手槍',
        icon: 'weapon_pistol',
        behavior: 'PISTOL_SHOT',
        visualCategory: 'PISTOL', // [V2] Data-driven weapon visual
        controlType: 'HYBRID',
        siegeBehavior: 'MOONWALK_LASER'
    },
    {
        id: 'weapon_drone_t0',
        name: '浮游單元 Beta',
        type: 'WEAPON',
        slot: 'mainWeapon',
        tier: 0,
        rarity: 'COMMON',
        baseStats: { damage: 5, range: 300, fireRate: 200, speed: 1.0, critChance: 0.05, defense: 0, hpMax: 0 }, // 滋滋滋
        description: '老舊的無人機',
        icon: 'weapon_drone',
        behavior: 'DRONE_BEAM',
        visualCategory: 'DRONE', // [V2] Data-driven weapon visual
        controlType: 'AUTO',
        siegeBehavior: 'FOCUS_FIRE'
    }
];
