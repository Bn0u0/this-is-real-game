import { ItemModifier } from '../../../../types';

export const PREFIXES: ItemModifier[] = [
    // --- TIER 0 (負面/破爛) ---
    { id: 'rusty', name: '生鏽的', type: 'PREFIX', tier: 0, stats: { damageMult: 0.8 }, visuals: { textColor: '#888888' } },
    { id: 'jammed', name: '卡彈的', type: 'PREFIX', tier: 0, stats: { fireRateMult: 0.8 }, visuals: { textColor: '#886600' } },
    { id: 'heavy_t0', name: '笨重的', type: 'PREFIX', tier: 0, stats: { speedMult: 0.8 }, visuals: { textColor: '#555555' } },

    // --- TIER 1+ (通用增強) ---
    { id: 'sharp', name: '鋒利的', type: 'PREFIX', tier: 1, stats: { damageMult: 1.1 }, visuals: { textColor: '#FFFFFF' } },
    { id: 'light', name: '輕量的', type: 'PREFIX', tier: 1, stats: { fireRateMult: 1.15 }, visuals: { textColor: '#CCFFCC' } },
    { id: 'violent', name: '暴力的', type: 'PREFIX', tier: 2, stats: { damageMult: 1.25, critAdd: 0.05 }, visuals: { textColor: '#FF4444' } },
    { id: 'precision', name: '精密的', type: 'PREFIX', tier: 2, stats: { critAdd: 0.15 }, visuals: { textColor: '#44FFFF' } }
];
