import { EventEmitter } from 'eventemitter3';

// Global Event Bus to decouple NetworkService from Game Scenes
// Using pure EventEmitter3 to avoid Phaser dependency in service layer
export const EventBus = new EventEmitter();