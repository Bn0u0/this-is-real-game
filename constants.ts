export const COLORS = {
  bg: 0x050508, // Darker deep space
  grid: 0x1a1a40,
  primary: 0x00F0FF, // Cyan
  secondary: 0xFF0055, // Magenta
  accent: 0xFFD700, // Gold
  tether: 0xFFFFFF, 
  danger: 0xFF0000, // Red for weak link
  ui_overlay: 'rgba(0, 240, 255, 0.05)',
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