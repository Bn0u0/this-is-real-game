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

// [NEW] Sprite Sheet Generator (High-Res Doodle / Baba Style)
export const generateSpriteSheet = (scene: Phaser.Scene) => {
    // Palette: Bone (#E3DAC9) per project guidelines
    const C_BONE = 0xE3DAC9;

    // We generate 3 frames: Normal, Squashed, Stretched
    const frames = [
        { name: 'tex_char_frame_0', scaleX: 1.0, scaleY: 1.0 },
        { name: 'tex_char_frame_1', scaleX: 1.05, scaleY: 0.95 }, // Fat (Subtle)
        { name: 'tex_char_frame_2', scaleX: 0.95, scaleY: 1.05 }, // Tall (Subtle)
    ];

    // Helper: Draw a "Lumpy" Blob using multiple overlapping circles
    const drawLumpyBlob = (g: Phaser.GameObjects.Graphics, cx: number, cy: number, w: number, h: number, color: number, seed: number) => {
        g.fillStyle(color);

        // Use a simple pseudo-random based on seed to keep frames stable but unique
        const count = 10; // More circles for more "lumpy" texture
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            // Introduce intentional irregularity
            const jitter = (Math.sin(seed + i * 1.5) * 0.4 + 0.6); // 0.2 to 1.0 jitter
            const dist = (w * 0.15) * jitter;
            const ox = Math.cos(angle) * dist;
            const oy = Math.sin(angle) * dist;

            // Draw slightly varied circles to form a lumpy mass
            g.fillEllipse(cx + ox, cy + oy, w * 0.8, h * 0.8);
        }
    };

    frames.forEach((f, index) => {
        // High Res Canvas (128x128)
        const size = 128;
        const g = scene.make.graphics({ x: 0, y: 0 });

        const cx = size / 2;
        const cy = size / 2;

        // 1. Legs (Merged blobs)
        const legW = 32;
        const legH = 45 * f.scaleY;

        // Left Leg
        drawLumpyBlob(g, cx - 18 * f.scaleX, cy + 30, legW, legH, C_BONE, index * 7);
        // Right Leg
        drawLumpyBlob(g, cx + 18 * f.scaleX, cy + 30, legW, legH, C_BONE, index * 13);

        // 2. Main Body (The Potato)
        const bodyW = 95 * f.scaleX;
        const bodyH = 85 * f.scaleY;
        drawLumpyBlob(g, cx, cy, bodyW, bodyH, C_BONE, index * 23);

        // 3. Wonky Eyes (Imperfect and slightly mismatched)
        g.fillStyle(0x000000);

        // Jitter eyes slightly per frame
        const eyeBaseY = cy - 8 * f.scaleY;
        const eyeBaseX = 26 * f.scaleX;

        const L_EYE_X = cx - eyeBaseX + (Math.sin(index * 4) * 1.5);
        const L_EYE_Y = eyeBaseY + (Math.cos(index * 7) * 1.5);
        const R_EYE_X = cx + eyeBaseX + (Math.cos(index * 3) * 1.5);
        const R_EYE_Y = eyeBaseY + (Math.sin(index * 5) * 1.5);

        const L_SIZE = 11 + (Math.sin(index * 9) * 2);
        const R_SIZE = 11 + (Math.cos(index * 11) * 2);

        // Left Eye
        g.fillEllipse(L_EYE_X, L_EYE_Y, L_SIZE, L_SIZE * 0.95);
        // Right Eye
        g.fillEllipse(R_EYE_X, R_EYE_Y, R_SIZE * 1.05, R_SIZE);

        g.generateTexture(f.name, size, size);
    });

    console.log('[TextureGenerator] Sprite Sheet Generated (Wonky Bone Doodle).');
};

/**
 * [NEW] Weapon Icon Generator
 * Creates doodle-style icons for items in the library.
 */
export const generateWeaponIcons = (scene: Phaser.Scene) => {
    const C_IRON = 0x708090; // Scrap Grey
    const C_RUST = 0xCD5C5C; // Oxide Red
    const C_BONE = 0xE3DAC9; // Handle color

    const drawDoodleRect = (g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, color: number) => {
        g.fillStyle(color);
        // Draw using overlapping jittered ellipses to break straight lines
        const segments = Math.max(2, Math.floor(w / 10));
        for (let i = 0; i <= segments; i++) {
            const px = x + (w / segments) * i;
            const jitter = Math.random() * 2 - 1;
            g.fillEllipse(px, y + h / 2 + jitter, (w / segments) * 1.5, h * 1.1);
        }
    };

    // 1. Nailgun (w_nailgun_t1)
    {
        const g = scene.make.graphics({ x: 0, y: 0 });
        // Body
        drawDoodleRect(g, 10, 20, 40, 20, C_IRON);
        // Handle
        drawDoodleRect(g, 15, 35, 12, 20, C_BONE);
        // Barrel
        drawDoodleRect(g, 45, 23, 15, 8, C_IRON);
        g.generateTexture('weapon_nailgun', 64, 64);
    }

    // 2. Pipe Wrench (w_pipe_wrench_t1)
    {
        const g = scene.make.graphics({ x: 0, y: 0 });
        // Handle
        drawDoodleRect(g, 10, 40, 45, 10, C_RUST);
        // Head
        drawDoodleRect(g, 40, 25, 18, 20, C_IRON);
        g.generateTexture('weapon_wrench', 64, 64);
    }

    // 3. Crowbar (weapon_crowbar_t0)
    {
        const g = scene.make.graphics({ x: 0, y: 0 });
        g.fillStyle(C_IRON);
        // Main bar with jitter
        for (let i = 0; i < 12; i++) {
            const x = 10 + i * 3.5;
            const y = 48 - (Math.sin(i * 0.3) * 5) - i * 1.5;
            const jitter = Math.random() * 2;
            g.fillCircle(x + jitter, y + jitter, 4.5);
        }
        // Rusty Tip
        g.fillStyle(C_RUST);
        g.fillCircle(48, 28, 7);
        g.fillStyle(C_IRON);
        g.fillCircle(48, 28, 4); // Hollow hook look
        g.generateTexture('weapon_crowbar', 64, 64);
    }

    // 4. Fist (w_fist_t0)
    {
        const g = scene.make.graphics({ x: 0, y: 0 });
        const cx = 32, cy = 32;
        // Lumpy Bready Fist
        g.fillStyle(C_BONE);
        for (let i = 0; i < 6; i++) {
            const ang = (i / 6) * Math.PI * 2;
            const ox = Math.cos(ang) * 10;
            const oy = Math.sin(ang) * 10;
            g.fillEllipse(cx + ox, cy + oy, 14, 12);
        }
        g.fillCircle(cx, cy, 12);
        g.generateTexture('weapon_fist', 64, 64);
    }

    // 5. Scrap Shotgun (w_scrap_shotgun_t1)
    {
        const g = scene.make.graphics({ x: 0, y: 0 });
        drawDoodleRect(g, 5, 25, 20, 15, C_BONE);
        drawDoodleRect(g, 20, 25, 40, 12, C_IRON);
        g.generateTexture('weapon_scrap_shotgun', 64, 64);
    }

    // 6. Assault Rifle (w_assault_rifle_t2)
    {
        const g = scene.make.graphics({ x: 0, y: 0 });
        drawDoodleRect(g, 10, 28, 45, 12, C_IRON); // Body
        drawDoodleRect(g, 12, 40, 8, 15, C_BONE);  // Grip
        drawDoodleRect(g, 35, 38, 10, 12, C_IRON); // Mag
        g.generateTexture('weapon_ar', 64, 64);
    }

    // 7. Sledgehammer (w_sledgehammer_t2)
    {
        const g = scene.make.graphics({ x: 0, y: 0 });
        drawDoodleRect(g, 28, 15, 8, 40, C_BONE);  // Shaft
        drawDoodleRect(g, 15, 10, 34, 15, C_IRON); // Head
        g.generateTexture('weapon_hammer', 64, 64);
    }

    // 8. Katana (w_katana_t3)
    {
        const g = scene.make.graphics({ x: 0, y: 0 });
        drawDoodleRect(g, 10, 45, 15, 6, C_BONE);  // Hilt
        drawDoodleRect(g, 25, 15, 4, 35, C_IRON);  // Blade
        g.generateTexture('weapon_katana', 64, 64);
    }

    // 9. Sniper (w_sniper_t3)
    {
        const g = scene.make.graphics({ x: 0, y: 0 });
        drawDoodleRect(g, 5, 30, 55, 10, C_IRON);  // Long barrel
        drawDoodleRect(g, 15, 22, 12, 10, C_IRON); // Scope
        drawDoodleRect(g, 8, 40, 10, 15, C_BONE);  // Grip
        g.generateTexture('weapon_sniper', 64, 64);
    }

    // 10. Sawblade (w_sawblade_t2)
    {
        const g = scene.make.graphics({ x: 0, y: 0 });
        g.fillStyle(C_IRON);
        g.fillCircle(32, 32, 20); // Base
        // Teeth
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            g.fillTriangle(
                32 + Math.cos(angle) * 18, 32 + Math.sin(angle) * 18,
                32 + Math.cos(angle + 0.3) * 25, 32 + Math.sin(angle + 0.3) * 25,
                32 + Math.cos(angle + 0.6) * 18, 32 + Math.sin(angle + 0.6) * 18
            );
        }
        g.generateTexture('weapon_sawblade', 64, 64);
    }

    // 11. SMG (w_vector_t3)
    {
        const g = scene.make.graphics({ x: 0, y: 0 });
        drawDoodleRect(g, 15, 25, 30, 18, C_IRON); // Main
        drawDoodleRect(g, 20, 40, 6, 12, C_IRON);  // Mag
        drawDoodleRect(g, 16, 40, 8, 10, C_BONE);  // Grip
        g.generateTexture('weapon_smg', 64, 64);
    }

    // 12. Railgun (w_railgun_t4)
    {
        const g = scene.make.graphics({ x: 0, y: 0 });
        drawDoodleRect(g, 10, 25, 45, 10, C_IRON); // Top rail
        drawDoodleRect(g, 10, 38, 45, 10, C_IRON); // Bottom rail
        g.fillStyle(0x39FF14); // Glow
        g.fillEllipse(32, 36, 30, 4);
        g.generateTexture('weapon_railgun', 64, 64);
    }

    // 13. Funnels (w_funnels_t4)
    {
        const g = scene.make.graphics({ x: 0, y: 0 });
        g.fillStyle(C_IRON);
        g.fillTriangle(32, 10, 15, 50, 49, 50); // Pyramid funnel
        g.fillStyle(0x39FF14);
        g.fillCircle(32, 35, 6);
        g.generateTexture('weapon_funnels', 64, 64);
    }

    // 14. Glitch Sword (w_reality_slicer_t5)
    {
        const g = scene.make.graphics({ x: 0, y: 0 });
        g.fillStyle(0xFF00FF); // Glitch Pink
        drawDoodleRect(g, 30, 10, 4, 45, 0xFF00FF);
        g.fillStyle(0x00FFFF); // Glitch Cyan
        g.fillRect(25, 20, 15, 5);
        g.generateTexture('weapon_glitch_sword', 64, 64);
    }

    // 15. Glitch Orb (w_glitch_storm_t5)
    {
        const g = scene.make.graphics({ x: 0, y: 0 });
        g.fillStyle(0x000000);
        g.fillCircle(32, 32, 20);
        // Noise dots
        for (let i = 0; i < 10; i++) {
            g.fillStyle(Math.random() > 0.5 ? 0xFF00FF : 0x00FFFF);
            g.fillRect(32 + Math.random() * 20 - 10, 32 + Math.random() * 20 - 10, 4, 4);
        }
        g.generateTexture('weapon_glitch_orb', 64, 64);
    }

    // 16. Pistol (weapon_pistol_t0)
    {
        const g = scene.make.graphics({ x: 0, y: 0 });
        // Wonky Slide
        drawDoodleRect(g, 15, 22, 32, 14, C_IRON);
        // Barrel tip
        drawDoodleRect(g, 45, 24, 8, 8, C_IRON);
        // Grip (Bone)
        drawDoodleRect(g, 18, 32, 10, 18, C_BONE);
        g.generateTexture('weapon_pistol', 64, 64);
    }

    // 17. Drone (weapon_drone_t0)
    {
        const g = scene.make.graphics({ x: 0, y: 0 });
        // Scrappy Body
        g.fillStyle(C_IRON);
        for (let i = 0; i < 4; i++) {
            g.fillEllipse(32 + Math.random() * 4 - 2, 28 + Math.random() * 4 - 2, 15, 12);
        }
        g.fillStyle(C_RUST); // Scratched "Eye"
        g.fillCircle(32, 28, 6);
        g.fillStyle(0x000000);
        g.fillCircle(32, 28, 3);

        // Antenna/Wires
        g.lineStyle(2, C_IRON);
        g.beginPath();
        g.moveTo(32, 15); g.lineTo(32, 5); // Main antenna
        g.moveTo(22, 40); g.lineTo(15, 52); // Sparking wire
        g.moveTo(42, 40); g.lineTo(49, 52);
        g.strokePath();

        g.fillStyle(0x39FF14); // Spark
        g.fillCircle(15, 52, 3);

        g.generateTexture('weapon_drone', 64, 64);
    }

    console.log('[TextureGenerator] Weapon Icons Generated (Full Completeness).');
};
