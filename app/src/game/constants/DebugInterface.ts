export interface DebugGameInterface {
  game: Phaser.Game;
  eventBus: any; // Using any to avoid complex type dependencies in test scope
  world: any;    // bitecs world
}

declare global {
  interface Window {
    __GAME__?: DebugGameInterface;
  }
}
