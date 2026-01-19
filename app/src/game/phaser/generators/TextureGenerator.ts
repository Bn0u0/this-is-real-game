import Phaser from 'phaser';

/**
 * Procedurally generates textures for the Character V2 Rig.
 * This runs once on game boot to populate the Texture Manager.
 */
export const generateCharacterTextures = (scene: Phaser.Scene) => {
    // Palette V3 (Pure Baba)
    const C_BONE = 0xE3DAC9; // Old Paper
    // const C_OXIDE = 0xCD5C5C; // [REMOVED] No Rust on spawn
    // const C_LEATHER = 0x5D4037; // [REMOVED] No Backpack on spawn
    const C_OUTLINE_WIDTH = 0; // No Outlines

    // 1. Leg (Trotters)
    const leg = scene.make.graphics({ x: 0, y: 0 });
    leg.lineStyle(C_OUTLINE_WIDTH, 0x000000);
    leg.fillStyle(C_BONE); // Pure Baba: Legs match body
    // leg.fillStyle(0x222222); // [REMOVED] Dark Boots
    leg.fillEllipse(6, 8, 10, 14);
    leg.generateTexture('tex_char_leg', 14, 18);

    // 2. Body (Potato)
    const body = scene.make.graphics({ x: 0, y: 0 });
    body.lineStyle(C_OUTLINE_WIDTH, 0x000000);
    body.fillStyle(C_BONE);

    // Draw slightly imperfect circle (Wobbly feel)
    body.fillEllipse(13, 11, 22, 18);   // Fill
    // [REMOVED] Rust Patch
    body.generateTexture('tex_char_body', 28, 26);

    // 3. Head (Potato Head)
    const head = scene.make.graphics({ x: 0, y: 0 });
    head.lineStyle(C_OUTLINE_WIDTH, 0x000000);
    head.fillStyle(C_BONE);

    head.fillEllipse(11, 10, 18, 16);
    // [REMOVED] Headband
    head.generateTexture('tex_char_head', 24, 22);

    // 4. Face (Deadpan)
    const face = scene.make.graphics({ x: 0, y: 0 });
    face.fillStyle(0x000000); // Black Eyes
    face.fillCircle(4, 4, 3);  // Left Eye (Big dot)
    face.fillCircle(14, 4, 3); // Right Eye
    face.generateTexture('tex_char_face_neutral', 18, 8);

    // 5. Hand (Floating Blob)
    const hand = scene.make.graphics({ x: 0, y: 0 });
    hand.lineStyle(C_OUTLINE_WIDTH, 0x000000);
    hand.fillStyle(C_BONE);
    hand.fillCircle(8, 8, 6);
    hand.generateTexture('tex_char_hand', 18, 18);

    // 6. Shadow (Blob)
    const shadow = scene.make.graphics({ x: 0, y: 0 });
    shadow.fillStyle(0x000000, 0.4);
    shadow.fillEllipse(15, 6, 30, 12);
    shadow.generateTexture('tex_char_shadow', 32, 14);

    console.log('[TextureGenerator] Character V3 Textures Generated (Pure Baba Style).');
};
