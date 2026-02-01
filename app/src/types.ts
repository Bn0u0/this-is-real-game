// [REFACTORED] Tier 1 & Tier 2 Class Structure
export type PlayerClassID = 'SCAVENGER' | 'SKIRMISHER' | 'WEAVER' | 'RANGER' | 'GUNNER' | 'RONIN' | 'SPECTRE' | 'RAIDER' | 'MEDIC' | 'ARCHITECT';

// ----------------------
// 1. 詞條系統 (Affix System)
// ----------------------
export type ModifierType = 'PREFIX' | 'SUFFIX';

export interface ItemModifier {
  id: string;
  name: string;      // 顯示名稱 (e.g. "生鏽的")
  type: ModifierType;
  tier: number;      // 詞條等級 (T0 詞條只會出現在 T0 武器上)

  // 數值修正
  stats: {
    damageMult?: number;   // 1.1 = +10%
    speedMult?: number;
    fireRateMult?: number; // 0.8 = +20% faster (delay * 0.8)
    critAdd?: number;      // 0.05 = +5%
    rangeAdd?: number;
  };

  // 視覺修正 (Amber-Glitch Style)
  visuals?: {
    textColor?: string;    // 詞條名稱顏色
    glowColor?: number;    // 武器發光色
    effectTag?: string;    // 特效標籤 (e.g. "BURN", "GLITCH")
  };
}

// ----------------------
// 2. 物品定義 (Static Definition)
// ----------------------
export type EquipmentSlot = 'mainWeapon' | 'head' | 'body' | 'legs' | 'feet';
export type ItemType = 'WEAPON' | 'ARMOR' | 'MATERIAL' | 'ARTIFACT';

export interface ItemAffinity {
  classes: PlayerClassID[];        // 適用職業列表
  bonusStats?: Partial<ItemStats>; // 相性加成 (綠字屬性)
  exclusive?: boolean;             // T5 專屬鎖 (若為 true，非名單職業不可裝備)
}

export interface ItemDef {
  id: string;
  name: string;
  tier: 0 | 1 | 2 | 3 | 4 | 5;
  type: ItemType;
  slot: EquipmentSlot;      // 明確指定槽位

  // [NEW] Behavior for WeaponSystem
  behavior?: 'MELEE_SWEEP' | 'MELEE_THRUST' | 'PISTOL_SHOT' | 'RIFLE_BURST' | 'BOW_SHOT' | 'GRENADE_THROW' | 'DRONE_BEAM' | 'HOMING_ORB' | 'SHOCKWAVE' | 'LASER' | 'BOOMERANG';

  // [NEW V2] Animation type (priority over behavior derivation)
  animationType?: 'SWING' | 'THRUST' | 'SHOOT' | 'THROW' | 'DRAWBOW' | 'NONE';

  // [NEW V2] Visual category for weapon rendering
  visualCategory?: 'BLUNT' | 'BLADE' | 'PISTOL' | 'RIFLE' | 'BOW' | 'GRENADE' | 'DRONE' | 'OTHER';

  // [NEW V3] Hitbox Configuration (Data-Driven)
  hitbox?: {
    shape: 'CIRCLE' | 'RECTANGLE' | 'SECTOR';
    offset: number;     // Distance from player center
    width: number;      // Radius for Circle/Sector, Width for Rect
    height?: number;    // Length for Rect
    angle?: number;     // Arc angle for Sector
    duration?: number;  // How long the hitbox persists
  };

  // [NEW] Siege Mode
  controlType?: 'AUTO' | 'HYBRID' | 'MANUAL';
  siegeBehavior?: string; // Optional description of siege effect

  // [NEW V4] Brotato-Style Orbit Configuration
  orbitConfig?: {
    radius: number;     // Orbit radius in pixels (default: 60)
    speed: number;      // Rotation speed in rad/s (default: 3.0)
  };

  // [NEW V4] Attack Configuration for Attached Hitbox
  attackConfig?: {
    duration: number;       // Attack animation duration in ms
    hitboxWidth: number;    // Collision width
    hitboxHeight: number;   // Collision height
    hitboxOffset: { x: number; y: number }; // Offset from weapon center
  };

  // [NEW V4] Projectile Configuration (for ranged weapons)
  projectileConfig?: {
    speed: number;
    lifetime: number;
    textureId: number;
    count?: number;       // Multi-shot
    spread?: number;      // Spread angle in radians
  };

  projectileId?: string;

  // 基礎數值
  baseStats: ItemStats;     // 白字屬性

  // [NEW] 共生相性 (Symbiosis)
  affinity?: ItemAffinity;

  // [NEW] 裝備需求
  requirements?: {
    minLevel?: number;
    minLicense?: LicenseRank; // [NEW] License Restriction
  };

  icon?: string;
  description?: string; // Added description for UI
  rarity: string;
  color?: string; // Compat
}

// ----------------------
// 3. 物品實體 (Dynamic Instance)
// ----------------------
export type LicenseRank = 'D' | 'C' | 'B' | 'A' | 'S'; // [NEW]

export interface ItemInstance {
  uid: string;       // 唯一識別碼 (UUID)
  defId: string;     // 原始定義 ID
  def: ItemDef;      // [NEW] Direct reference for easier calculations

  // 隨機骰出的詞條
  prefix?: ItemModifier;
  suffix?: ItemModifier;

  // 最終計算數值 (Base * Modifiers)
  computedStats: ItemStats;

  displayName: string; // "生鏽的 鐵管步槍 之 故障"
  name: string; // "鐵管步槍" (Original Name)
  rarity: ItemRarity;
}

export type NetworkPacket =
  | { type: 'START_MATCH', payload: { mode: string; hero: string } }
  | { type: 'INPUT', payload: JoystickData }
  | { type: 'STATE', payload: any } // [FIX] Keep flexible for legacy sync format
  | { type: 'GAME_OVER', payload: { success: boolean; score: number } };

export interface JoystickData {
  x: number;
  y: number;
  angle: number;
  force: number;
}

export interface GameStats {
  hp: number;
  maxHp: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  score: number;
  wave: number;     // Current Wave number
  enemiesAlive: number; // For clearing condition
  survivalTime?: number; // Total seconds survived
}

// ----------------------
// 4. Enums & Helpers
// ----------------------
export enum ItemRarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
  GLITCH = 'GLITCH',
  MYTHIC = 'MYTHIC' // Compat
}

export interface ItemStats {
  // 攻擊系
  damage: number;
  range: number;
  fireRate: number; // ms delay
  critChance: number; // 0.0 ~ 1.0
  // 防禦系
  defense: number; // 減傷值
  hpMax: number;   // 血量上限加成
  // 機動系
  speed: number;   // 移動速度修正 (e.g., 1.1 = +10%)

  // Legacy / Generic compat
  knockback?: number;
}

// [OPERATION TITAN ARMORY] 5-Slot Loadout
export interface Loadout {
  mainWeapon: ItemInstance | null;
  head: ItemInstance | null;
  body: ItemInstance | null;
  legs: ItemInstance | null;
  feet: ItemInstance | null;
}

export interface Backpack {
  slots: (ItemInstance | null)[]; // Fixed size array (e.g. 6)
  capacity: number;
}

export type TutorialStep = 'VOID' | 'TRIAL' | 'COMPLETE';

export interface PlayerProfile {
  id: string;
  username: string; // [NEW] Cloud Profile Name
  credits: number; // [SSOT] Primary Currency
  wallet: {
    gold: number; // Aliased to credits for UI compat
    gems: number;
  };
  /** @deprecated use toolkitLevel instead */
  level: number; // [LEGACY]
  toolkitLevel: number; // [NEW] Backend Level
  xp: number;
  /** @deprecated use stash instead */
  inventory: string[]; // [LEGACY]
  stash: ItemInstance[]; // Persistent Item Storage
  loadout: Loadout;
  backpack: Backpack;
  tutorialStep: TutorialStep;
  trialClassId: string | null;
  unlockedClasses: string[];

  // [NEW] Persistence Fields
  hasPlayedOnce: boolean;
  stats: {
    totalKills: number;
    runsCompleted: number;
  };
  licenses: Record<string, LicenseRank>;
  blueprints: string[];
}

// ----------------------
// 5. Enemy System
// ----------------------
export type EnemyBehaviorType = 'CHASE' | 'RANGED' | 'CHARGE' | 'SWARM';

export interface EnemyDef {
  id: string;
  name: string;

  // 1. Base Stats
  stats: {
    hp: number;
    speed: number;      // pixels per second
    damage: number;     // collision damage
    mass: number;       // resistance to knockback (default: 1.0)
    exp: number;        // experience dropped
    attackRange?: number;
  };

  // 2. Visuals
  visuals: {
    texture: string;    // e.g. 'tex_enemy_basic'
    color: number;      // e.g. 0xFF0000
    scale: number;
    opacity?: number;
  };

  // 3. AI / Behavior
  ai: {
    type: EnemyBehaviorType;
    // Optional params specific to behavior
    range?: number;        // for RANGED
    cooldown?: number;     // attack interval
    chargeSpeed?: number;  // for CHARGE
  };

  // 4. Spawning Rules
  spawnRules: {
    minWave: number;    // First wave this enemy can appear
    cost: number;       // Spawn budget cost (e.g. 1 for Walker, 5 for Tank)
    weight: number;     // Spawn probability weight
  };

  // Metadata
  tier: 1 | 2 | 3;      // 1=Common, 2=Elite, 3=Boss
  tags?: string[];      // e.g. ['BIOLOGICAL', 'MECHANICAL']
}