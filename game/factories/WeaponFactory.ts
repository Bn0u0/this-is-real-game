import Phaser from 'phaser';

export type WeaponType = 'MELEE_SWEEP' | 'HOMING_ORB' | 'SHOCKWAVE' | 'LASER' | 'BOOMERANG';

export interface WeaponStats {
    type: WeaponType;
    damage: number;
    fireRate: number; // ms delay
    projectileCount: number;
    speed: number;
    range: number;
    sizeMod: number; // 0.5 to 2.0
    color: number;
    name: string;
}

export class WeaponFactory {
    static generate(seed: string, level: number): WeaponStats {
        const rng = new Phaser.Math.RandomDataGenerator([seed]);

        // 1. Pick Type
        const types: WeaponType[] = ['MELEE_SWEEP', 'HOMING_ORB', 'SHOCKWAVE', 'LASER', 'BOOMERANG'];
        const type = rng.pick(types);

        // 2. Base Stats scaled by Level
        const baseDmg = 10 + (level * 2);
        const damage = Math.floor(baseDmg * rng.realInRange(0.8, 1.2));

        const baseRate = 500 - (level * 10);
        const fireRate = Math.max(100, Math.floor(baseRate * rng.realInRange(0.9, 1.1)));

        // 3. Modifiers (Rarity)
        const rarity = rng.weightedPick([1, 1, 1, 0.5, 0.1]); // Common to Legendary
        const projCount = 1 + (rarity > 0.5 ? rng.integerInRange(1, 4) : 0);
        const sizeMod = rng.realInRange(0.8, 1.5);

        // 4. Name Gen
        const prefixes = ['Rusty', 'Neo', 'Cyber', 'Void', 'Hyper', 'Omega'];
        const suffixes = ['Blaster', 'Slicer', 'Orb', 'Cannon', 'Edge', 'Destructor'];
        const name = `${rng.pick(prefixes)} ${rng.pick(suffixes)} MK-${level}`;

        return {
            type,
            damage,
            fireRate,
            projectileCount: projCount,
            speed: 400,
            range: 300,
            sizeMod,
            color: 0xFFFFFF,
            name
        };
    }
}
