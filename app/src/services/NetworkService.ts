import Peer, { DataConnection } from 'peerjs';
import { EventBus } from './EventBus';
import { NetworkPacket } from '../types';

export interface INetworkProvider {
  myId: string;
  isHost: boolean;
  initialize(requestedId?: string): Promise<string>;
  connectToHost(hostId: string): void;
  broadcast(packet: NetworkPacket): void;
}

class PeerNetworkService implements INetworkProvider {
  private peer: Peer | null = null;
  public conn: DataConnection | null = null;
  public myId: string = '';
  public isHost: boolean = false;

  async initialize(requestedId?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Create Peer instance. 
      // Note: In production, you might want to use your own PeerServer.
      // For MVP Vercel deployment, the default public PeerServer is fine,
      // but sometimes unstable. 
      this.peer = new Peer(requestedId || '', {
        debug: 2
      });

      this.peer.on('open', (id) => {
        console.log('[Network] Peer Open. ID:', id);
        this.myId = id;
        this.isHost = true; // Default assumption until we connect to someone else
        resolve(id);
      });

      this.peer.on('connection', (connection) => {
        console.log('[Network] Incoming connection from:', connection.peer);
        this.handleConnection(connection);
      });

      this.peer.on('error', (err) => {
        console.error('[Network] Peer Error:', err);
        // If ID is taken, we might want to reject or retry
        if (err.type === 'unavailable-id') {
          reject('ID_TAKEN');
        }
      });
    });
  }

  connectToHost(hostId: string) {
    if (!this.peer) return;
    console.log('[Network] Connecting to host:', hostId);
    this.isHost = false; // We are joining, so we are not host
    const conn = this.peer.connect(hostId);
    this.handleConnection(conn);
  }

  private handleConnection(connection: DataConnection) {
    this.conn = connection;

    this.conn.on('open', () => {
      console.log('[Network] Connection Established!');
      EventBus.emit('NETWORK_CONNECTED', this.conn?.peer);
    });

    this.conn.on('data', (data) => {
      // Dispatch packet to EventBus so MainScene can pick it up
      EventBus.emit('NETWORK_PACKET', data);
    });

    this.conn.on('close', () => {
      console.log('[Network] Connection Closed.');
      EventBus.emit('NETWORK_DISCONNECTED');
      this.conn = null;
    });

    this.conn.on('error', (err) => {
      console.error('[Network] Connection Error:', err);
      EventBus.emit('NETWORK_DISCONNECTED');
    });
  }

  broadcast(packet: NetworkPacket) {
    if (this.conn && this.conn.open) {
      this.conn.send(packet);
    }
  }
}

export const network = new PeerNetworkService();