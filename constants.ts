// Amber-Glitch Palette (Strategic Partner: Neon-Candy)
export const COLORS = {
  bg: 0x1b191f,          // Dark Warm Grey (Not pure black)
  shadow: 0x2d1b2e,      // Deep Purple Shadow (Eastward)
  ambient: 0x555060,     // Warm Grey Ambient (Eastward)

  primary: 0x54fcfc,     // Drifter Cyan (Hero) - Kept for contrast
  secondary: 0xff0055,   // Magenta (Enemy)
  accent: 0xffe736,      // Gold/Electric

  // Glitch Layer (Atomicrops)
  glitchA: 0x00ff00,     // Neon Green
  glitchB: 0xff00ff,     // Neon Pink

  // Environment (Warm/Cozy)
  floor: 0x231e26,       // Warm Dark Floor
  wallTop: 0x3e3542,     // Lighter Warm Grey
  wallSide: 0x16101a,    // Deepest Warm Shadow

  // UI
  health: 0xff0055,      // Magenta
  shield: 0x54fcfc,      // Cyan
  xp: 0xffe736,          // Gold
  text: '#eddbda',       // Dust White

  // Legacy mapping
  white: 0xFFFFFF,
  grid: 0x3e3542
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