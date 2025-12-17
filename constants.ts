// Hyper Light Drifter Inspired Palette (Code-Only Construction)
export const COLORS = {
  bg: 0x0e0d16,          // Void Dark
  primary: 0x54fcfc,     // Drifter Cyan (Hero)
  secondary: 0xff0055,   // Enemy Magenta
  accent: 0xffe736,      // Gold/Electric

  // Environment
  floor: 0x1a1c24,       // Dark Slate
  wallTop: 0x272933,     // Lighter Grey
  wallSide: 0x050508,    // Deep Shadow

  // UI
  health: 0xff0055,      // Magenta
  shield: 0x54fcfc,      // Cyan
  xp: 0xffe736,          // Gold
  text: '#eddbda',       // Dust White

  // Legacy mapping for compatibility
  white: 0xFFFFFF,
  grid: 0x272933
};

export const PHYSICS = {
  drag: 1200, // High drag for precise stopping
  acceleration: 2200, // High acceleration for snappy response
  maxVelocity: 550,
  tetherDistance: 300,
  rotationLerp: 0.15, // Smooth turning speed
};

export const FX = {
  bloom: {
    intensity: 1.5,
    strength: 1.2,
    blur: 0.8,
  },
  particles: {
    lifespan: 500,
    interval: 30,
  }
};

export const GAME_CONFIG = {
  width: window.innerWidth,
  height: window.innerHeight,
};