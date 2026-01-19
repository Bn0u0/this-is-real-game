
// [NEW] Sprite Sheet Generator (Pure Baba Frame-by-Frame)
export const generateSpriteSheet = (scene: Phaser.Scene) => {
    // Palette
    const C_BONE = 0xE3DAC9; // Old Paper

    // We generate 3 frames: Normal, Squashed, Stretched
    // Each frame is a "Complete Potato" (Body + Legs merged)
    // 32x32 per frame approx

    const frames = [
        { name: 'tex_char_frame_0', scaleX: 1.0, scaleY: 1.0, legH: 14 },
        { name: 'tex_char_frame_1', scaleX: 1.1, scaleY: 0.9, legH: 12 }, // Fat & Short
        { name: 'tex_char_frame_2', scaleX: 0.9, scaleY: 1.1, legH: 16 }, // Tall & Thin
    ];

    frames.forEach((f, index) => {
        const size = 64; // Canvas size
        const g = scene.make.graphics({ x: 0, y: 0 });

        const centerX = size / 2;
        const centerY = size / 2;

        g.fillStyle(C_BONE);

        // 1. Legs (Merged)
        // Draw slightly offset legs based on frame index to simulate "shuffling"
        const tick = index * 2;
        g.fillEllipse(centerX - 6, centerY + 10, 10, f.legH); // Left
        g.fillEllipse(centerX + 6, centerY + 10, 10, f.legH); // Right

        // 2. Body (Potato)
        // Vary the radius slightly with noise
        const w = 22 * f.scaleX;
        const h = 18 * f.scaleY;
        g.fillEllipse(centerX, centerY, w, h);

        // 3. Face (Eyes)
        g.fillStyle(0x000000);
        // Eyes move slightly too
        const eyeY = centerY - 4 * f.scaleY;
        g.fillCircle(centerX - 5 * f.scaleX, eyeY, 3);
        g.fillCircle(centerX + 5 * f.scaleX, eyeY, 3);

        g.generateTexture(f.name, size, size);
    });

    console.log('[TextureGenerator] Sprite Sheet Generated (3 Frames).');
};
