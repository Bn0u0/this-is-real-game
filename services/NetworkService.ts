import { NetworkPacket } from '../types';
import { EventBus } from './EventBus';

// Interface definition for future swap-back
export interface INetworkProvider {
  myId: string;
  isHost: boolean;
  initialize(requestedId?: string): Promise<string>;
  connectToHost(hostId: string): void;
  broadcast(packet: NetworkPacket): void;
}

class MockNetworkService implements INetworkProvider {
  public myId: string = 'COMMANDER';
  public isHost: boolean = true; // Always Host in simulation
  public isMock: boolean = true; // Flag for game logic

  async initialize(requestedId?: string): Promise<string> {
    console.log('[Network] Initializing Neural Simulation Mode...');
    this.myId = requestedId || 'COMMANDER';
    this.isHost = true;
    
    // Simulate initialization delay
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('[Network] Simulation Environment Ready.');
            resolve(this.myId);
        }, 500);
    });
  }

  connectToHost(hostId: string) {
    console.warn('[Network] External connections disabled in Simulation Mode.');
  }

  broadcast(packet: NetworkPacket) {
    // In simulation, we don't need to send packets anywhere.
    // The MainScene handles everything locally.
    // If we wanted to simulate lag, we could loopback here with setTimeout.
  }
}

export const network = new MockNetworkService();