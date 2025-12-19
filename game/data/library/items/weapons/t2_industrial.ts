import { ItemDef } from '../../../../../types';

export const T2_WEAPONS: ItemDef[] = [
    {
        id: 'w_assault_rifle_t2',
        name: '制式步槍 (Assault Rifle)',
        type: 'WEAPON',
        tier: 2,
        rarity: 'RARE',
        behavior: 'PISTOL_SHOT',
        baseStats: { damage: 18, range: 500, fireRate: 150, speed: 1200, knockback: 30 },
        description: '舊時代的可靠夥伴。平衡性極佳。',
        icon: 'weapon_ar'
    },
    {
        id: 'w_sledgehammer_t2',
        name: '動力大錘 (Power Hammer)',
        type: 'WEAPON',
        tier: 2,
        rarity: 'RARE',
        behavior: 'SHOCKWAVE', // 震波攻擊
        baseStats: { damage: 80, range: 150, fireRate: 1500, knockback: 500 },
        description: '裝有液壓推進裝置的大錘。能引發地面震波。',
        icon: 'weapon_hammer'
    },
    {
        id: 'w_sawblade_t2',
        name: '圓鋸發射器 (Ripper)',
        type: 'WEAPON',
        tier: 2,
        rarity: 'RARE',
        behavior: 'BOOMERANG', // 迴旋鏢邏輯
        baseStats: { damage: 40, range: 400, fireRate: 800, speed: 500, knockback: 100 },
        description: '發射高速旋轉的圓鋸，會飛回使用者手中。',
        icon: 'weapon_sawblade'
    }
];
