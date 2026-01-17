import Phaser from 'phaser';
import { MainScene } from '../../scenes/MainScene';
import { COLORS } from '../../../constants';
import { MapGenerator, TILE_FLOOR, TILE_WALL, TILE_VOID } from '../../generators/MapGenerator';
import { GAME_LAYER } from '../../constants/Depth';

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

        const seed = Date.now().toString();
        const generator = new MapGenerator(cols, rows, seed);
        const grid = generator.generate();

        // 1. Draw Base Ground (The Canvas)
        const bgGraphics = this.scene.add.graphics();
        bgGraphics.fillStyle(0xD5B59F, 1); // Dusty Sand
        bgGraphics.fillRect(0, 0, this.worldWidth, this.worldHeight);
        bgGraphics.setDepth(GAME_LAYER.GROUND - 1);

        // 2. Process Grid
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const val = grid[y][x];
                let type = TileType.VOID;

                if (val === TILE_FLOOR) type = TileType.GROUND;

                if (type === TileType.GROUND) {
                    this.createTile(x, y, type, 0);
                } else {
                    // Implicit Wall/Void handled by absence of ground tile logic or separate wall generation
                    // For now, we only draw walls explicitly if needed, or leave as void.
                    // Actually, let's treat non-ground as "MUD WALL"
                    this.createWall(x, y);
                }
            }
        }

        // 3. Narrative Scatter (The Decor)
        this.scatterNarrativeDecor(cols, rows);
    }

    createTile(gridX: number, gridY: number, type: TileType, height: number) {
        const key = `${gridX},${gridY}`;
        const worldX = gridX * this.tileSize;
        const worldY = gridY * this.tileSize;

        const tile: TileData = { x: gridX, y: gridY, type, height };

        // No explicit tile graphic needed for ground (handled by bg), 
        // just logic or faint grid if needed.
        // Let's add faint grid for positioning context
        const g = this.scene.add.graphics();
        g.lineStyle(1, 0xBCAAA4, 0.3); // Faint Dust Grid
        g.strokeRect(worldX, worldY, this.tileSize, this.tileSize);
        g.setDepth(GAME_LAYER.GROUND);

        tile.instance = g;
        this.tiles.set(key, tile);
    }

    createWall(gridX: number, gridY: number) {
        // "MUD WALL" - Deep Mud Color
        const worldX = gridX * this.tileSize;
        const worldY = gridY * this.tileSize;

        const g = this.scene.add.graphics();
        g.fillStyle(0x453B2E, 1); // Deep Mud
        g.fillRect(worldX, worldY, this.tileSize, this.tileSize);

        // Wall Physics
        const zone = this.scene.add.zone(worldX + 32, worldY + 32, this.tileSize, this.tileSize);
        this.scene.physics.add.existing(zone, true);
        this.wallGroup.add(zone);

        g.setDepth(GAME_LAYER.GROUND); // Walls same level as ground visually in top-down
    }

    private scatterNarrativeDecor(cols: number, rows: number) {
        const decorG = this.scene.add.graphics();
        decorG.setDepth(GAME_LAYER.GROUND + 1); // Above ground, below player

        for (let i = 0; i < (cols * rows) * 0.15; i++) { // 15% density
            const x = Math.random() * this.worldWidth;
            const y = Math.random() * this.worldHeight;

            const roll = Math.random();
            if (roll < 0.6) {
                // Pebble (Dark Grey)
                decorG.fillStyle(0x6D6D6D, 0.8);
                decorG.fillCircle(x, y, 2 + Math.random() * 3);
            } else if (roll < 0.8) {
                // Crack (Line)
                decorG.lineStyle(2, 0x4E342E, 0.6);
                decorG.beginPath();
                decorG.moveTo(x, y);
                decorG.lineTo(x + (Math.random() - 0.5) * 20, y + (Math.random() - 0.5) * 20);
                decorG.strokePath();
            } else if (roll < 0.9) {
                // Scrap (White/Blue)
                decorG.fillStyle(0xEEEEEE, 0.7);
                decorG.fillRect(x, y, 6, 4);
            } else {
                // [NEW] Narrative Element: Buried Sign / Crater
                // Crater
                decorG.fillStyle(0x2D241E, 0.5); // Shadowy
                decorG.fillCircle(x, y, 10 + Math.random() * 10);
            }
        }

        this.clutterGroup.add(decorG);

        // [VISUAL] Object-Based Wobble Removed per user request
        // Static background fits better with the "Paper" aesthetic and prevents dizziness/distraction.
    }
    /**
     * Checks if the world coordinate is valid walkable ground.
     */
    public isGround(worldX: number, worldY: number): boolean {
        const gridX = Math.floor(worldX / this.tileSize);
        const gridY = Math.floor(worldY / this.tileSize);
        const key = `${gridX},${gridY}`;

        const tile = this.tiles.get(key);
        return tile !== undefined && tile.type === TileType.GROUND;
    }
}
