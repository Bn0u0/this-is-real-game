import Phaser from 'phaser';

export const TILE_VOID = 0;
export const TILE_FLOOR = 1;
export const TILE_WALL = 2;
export const TILE_DOOR = 3;

export class MapGenerator {
    private width: number;
    private height: number;
    private grid: number[][];
    private rng: Phaser.Math.RandomDataGenerator;

    constructor(width: number, height: number, seed: string) {
        this.width = width;
        this.height = height;
        this.rng = new Phaser.Math.RandomDataGenerator([seed]);
        this.grid = [];
    }

    public generate(): number[][] {
        // Initialize Void
        for (let y = 0; y < this.height; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.grid[y][x] = TILE_VOID;
            }
        }

        // Core Room (Start)
        const cx = Math.floor(this.width / 2);
        const cy = Math.floor(this.height / 2);
        this.carveRoom(cx, cy, 10, 10);

        // Branch out (WFC-lite: Expansion)
        const rooms = 15;
        for (let i = 0; i < rooms; i++) {
            this.expand();
        }

        // Post-process: Walls
        this.generateWalls();

        return this.grid;
    }

    private expand() {
        // Find a random floor tile
        let candidates: { x: number, y: number }[] = [];
        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                if (this.grid[y][x] === TILE_FLOOR) {
                    // Check if edge
                    if (this.countNeighbors(x, y, TILE_VOID) > 0) {
                        candidates.push({ x, y });
                    }
                }
            }
        }

        if (candidates.length === 0) return;

        const start = this.rng.pick(candidates);
        const dir = this.rng.pick([{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }]);

        // Try to carve corridor + room
        // Corridor length
        const len = this.rng.integerInRange(3, 8);
        let tx = start.x;
        let ty = start.y;

        // Carve Corridor
        for (let k = 0; k < len; k++) {
            tx += dir.x;
            ty += dir.y;
            if (!this.inBounds(tx, ty)) return;
            this.grid[ty][tx] = TILE_FLOOR;
        }

        // Carve Room at end
        const rw = this.rng.integerInRange(5, 12);
        const rh = this.rng.integerInRange(5, 12);
        this.carveRoom(tx, ty, rw, rh);
    }

    private carveRoom(cx: number, cy: number, w: number, h: number) {
        const x1 = Math.floor(cx - w / 2);
        const y1 = Math.floor(cy - h / 2);
        const x2 = x1 + w;
        const y2 = y1 + h;

        for (let y = y1; y < y2; y++) {
            for (let x = x1; x < x2; x++) {
                if (this.inBounds(x, y)) {
                    this.grid[y][x] = TILE_FLOOR;
                }
            }
        }
    }

    private generateWalls() {
        // Convert Void neighbors of Floor to Wall
        const newGrid = JSON.parse(JSON.stringify(this.grid));

        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                if (this.grid[y][x] === TILE_VOID) {
                    if (this.countNeighbors(x, y, TILE_FLOOR) > 0) {
                        newGrid[y][x] = TILE_WALL;
                    }
                }
            }
        }
        this.grid = newGrid;
    }

    private countNeighbors(x: number, y: number, type: number): number {
        let count = 0;
        const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        for (let d of dirs) {
            const nx = x + d[0];
            const ny = y + d[1];
            if (this.inBounds(nx, ny) && this.grid[ny][nx] === type) {
                count++;
            }
        }
        return count;
    }

    private inBounds(x: number, y: number): boolean {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
}
