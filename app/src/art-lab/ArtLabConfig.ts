
export interface ArtLabState {
    activeMode: 'CHARACTER' | 'WEAPON' | 'ENVIRONMENT' | 'UI';
    // Resolution Control
    pixelation: number; // 1 = Native, 4 = Low Res (e.g. 480p equivalent)
    // Baba Params (Global Shader or Logic)
    wobbleSpeed: number;
    wobbleAmp: number;
    // Character Params
    charScaleX: number;
    charScaleY: number;
}

export const DEFAULT_LAB_CONFIG: ArtLabState = {
    activeMode: 'CHARACTER',
    pixelation: 4, // Intentionally chunky
    wobbleSpeed: 1.0,
    wobbleAmp: 1.0,
    charScaleX: 1.0,
    charScaleY: 1.0
};
