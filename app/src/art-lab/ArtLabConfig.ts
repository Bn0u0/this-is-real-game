
export interface ArtLabState {
    activeMode: 'CHARACTER' | 'WEAPON' | 'ENVIRONMENT' | 'UI';
    // Baba Params (Global Shader or Logic)
    wobbleSpeed: number;
    // Character Params
    charScaleX: number;
    charScaleY: number;
    // Global View
    cameraZoom: number;
    // Simulation
    simulatingMove: boolean;
    // Weapon Params
    selectedWeaponId: string;
    weaponScale: number;
    weaponRotation: number;
    simulatingAttack: boolean;
}

export const DEFAULT_LAB_CONFIG: ArtLabState = {
    activeMode: 'CHARACTER',
    wobbleSpeed: 1.0,
    charScaleX: 1.0,
    charScaleY: 1.0,
    cameraZoom: 1.0,
    simulatingMove: false,
    selectedWeaponId: 'w_nailgun_t1',
    weaponScale: 1.0,
    weaponRotation: 0,
    simulatingAttack: false
};
