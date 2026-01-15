import Phaser from 'phaser';
import { MainScene } from '../scenes/MainScene';
import { COLORS } from '../../constants';
import { MapGenerator, TILE_FLOOR, TILE_WALL, TILE_VOID } from '../generators/MapGenerator';
import { GAME_LAYER } from '../constants/Depth';

// 2.5D Tiling System
export enum TileType {
    VOID = 0,   // Pit (Fall and die)
    GROUND = 1, // Walkable
    WALL = 2,   // Blocker
    BRIDGE = 3  // Hard Light Bridge
}

export interface TileData {
    x: number; // Grid X
    y: number; // Grid Y
    type: TileType;
    height: number; // Visual height for 2.5D
    instance?: Phaser.GameObjects.Graphics;
    body?: Phaser.Physics.Arcade.Body;
}

export class TerrainManager {
    private scene: MainScene;
    private tileSize: number = 64;
    private worldWidth: number = 0;
    private worldHeight: number = 0;
    private tiles: Map<string, TileData> = new Map();
    public wallGroup: Phaser.GameObjects.Group;
    public voidGroup: Phaser.GameObjects.Group; // For falling logic
    public clutterGroup: Phaser.GameObjects.Group;

    constructor(scene: MainScene) {
        this.scene = scene;
        this.wallGroup = scene.add.group();
        this.voidGroup = scene.add.group();
        this.clutterGroup = scene.add.group();
    }

    /**
     * Generates a "Pandora" map using WFC-lite.
     */
    generateWorld(cols: number = 50, rows: number = 50) {
        this.worldWidth = cols * this.tileSize;
        this.worldHeight = rows * this.tileSize;

        const seed = Date.now().toString(); // Or "Fort Knox" constant seed
        const generator = new MapGenerator(cols, rows, seed);
        const grid = generator.generate();

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const val = grid[y][x];
                let type = TileType.VOID;

                if (val === TILE_FLOOR) type = TileType.GROUND;
                // else if (val === TILE_WALL) type = TileType.WALL; // REMOVED

                if (type === TileType.GROUND) {
                    this.createTile(x, y, type, 0);
                }
            }
        }

        this.scatterClutter();

        // Physics
        this.scene.time.delayedCall(100, () => {
            // Walls removed per user request
        });
    }

    createTile(gridX: number, gridY: number, type: TileType, height: number) {
        const key = `${gridX},${gridY}`;
        const worldX = gridX * this.tileSize;
        const worldY = gridY * this.tileSize;

        const tile: TileData = { x: gridX, y: gridY, type, height };
        const g = this.scene.add.graphics();
        this.scene.add.existing(g);

        // -- PROTO-MINIMALIST PALETTE --
        const COL_FLOOR = 0xFFFFFF; // Pure White
        const COL_WALL = 0x000000;  // Pure Black
        const COL_GRID = 0xEEEEEE;  // Faint Grey Grid

        if (type === TileType.GROUND) {
            // 1. Base Ground (White)
            g.fillStyle(COL_FLOOR, 1);
            g.fillRect(worldX, worldY, this.tileSize, this.tileSize);

            // 2. Grid (Faint)
            g.lineStyle(1, COL_GRID, 1);
            g.strokeRect(worldX, worldY, this.tileSize, this.tileSize);

            g.setDepth(GAME_LAYER.GROUND);
        } else if (type === TileType.WALL) {
            // 1. Wall (Solid Black Block)
            g.fillStyle(COL_WALL, 1);
            g.fillRect(worldX, worldY - height, this.tileSize, this.tileSize + height);

            // Physics Body
            const zone = this.scene.add.zone(worldX + 32, worldY + 32, this.tileSize, this.tileSize);
            this.scene.physics.add.existing(zone, true);
            this.wallGroup.add(zone);
            tile.body = zone.body as Phaser.Physics.Arcade.Body;

            g.setDepth(worldY + this.tileSize); // Y-Sort
        }

        tile.instance = g;
        this.tiles.set(key, tile);
    }

    private drawHex(g: Phaser.GameObjects.Graphics, x: number, y: number, r: number) {
        // [DEPRECATED] Hex grid removed for square grid readability
    }

    getRandomGroundTile(): { x: number, y: number } | null {
        const candidates: { x: number, y: number }[] = [];
        this.tiles.forEach(t => {
            if (t.type === TileType.GROUND) candidates.push({ x: t.x * this.tileSize + 32, y: t.y * this.tileSize + 32 });
        });
        if (candidates.length === 0) return null;
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    private scatterClutter() {
        // [REMOVED] No clutter in minimalist mode
    }
}
