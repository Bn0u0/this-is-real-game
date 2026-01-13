import { defineComponent, Types } from 'bitecs';

// 基礎向量結構
export const Vector2 = { x: Types.f32, y: Types.f32 };

// --- Data Components (純數據) ---
export const Transform = defineComponent({
    ...Vector2,
    rotation: Types.f32
});

export const Velocity = defineComponent(Vector2);

export const Health = defineComponent({
    current: Types.f32,
    max: Types.f32
});

// --- Tags (標籤，無數據) ---
export const PlayerTag = defineComponent();
export const EnemyTag = defineComponent();
export const ProjectileTag = defineComponent();

// --- View Components (渲染設定) ---
// 注意：我們用 textureId (整數) 來映射實際的字串 key，以保持陣列純淨
export const SpriteConfig = defineComponent({
    textureId: Types.ui8, // 0: None, 1: 'tex_enemy_01', etc.
    tint: Types.ui32,
    scale: Types.f32
});
