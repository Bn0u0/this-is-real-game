import { ItemModifier } from '../../../../types';

export const SUFFIXES: ItemModifier[] = [
    // --- 元素與特效 ---
    { id: 'fire', name: '之 燃燒', type: 'SUFFIX', tier: 1, stats: {}, visuals: { effectTag: 'BURN', textColor: '#FF8800' } },
    { id: 'static', name: '之 靜電', type: 'SUFFIX', tier: 1, stats: {}, visuals: { effectTag: 'SHOCK', textColor: '#FFFF00' } },
    { id: 'leech', name: '之 吸血', type: 'SUFFIX', tier: 2, stats: {}, visuals: { effectTag: 'LEECH', textColor: '#FF00FF' } },
    { id: 'glitch', name: '之 故障', type: 'SUFFIX', tier: 3, stats: { damageMult: 1.5 }, visuals: { effectTag: 'GLITCH', textColor: '#00FF00', glowColor: 0x00FF00 } }
];
