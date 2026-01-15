import Phaser from 'phaser';

export class TextureManager {
    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    public generateAll() {
        this.createFlare();
        this.createParticle();
        this.createCircle();
        this.createIconPlaceholders();
        this.createClutter();
        console.log("?Ž¨ [TextureManager] Procedural Textures Generated.");
    }

    private createFlare() {
        if (this.scene.textures.exists('flare')) return;
        const canvas = this.scene.textures.createCanvas('flare', 32, 32);
        if (!canvas) return;

        const ctx = canvas.getContext();
        const grd = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        grd.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grd.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
        grd.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 32, 32);
        canvas.refresh();
    }

    private createParticle() {
        if (this.scene.textures.exists('particle')) return;
        const graphics = this.scene.make.graphics({ x: 0, y: 0 });
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(4, 4, 4);
        graphics.generateTexture('particle', 8, 8);
    }

    private createCircle() {
        if (this.scene.textures.exists('circle')) return;
        const graphics = this.scene.make.graphics({ x: 0, y: 0 });
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(16, 16, 16);
        graphics.generateTexture('circle', 32, 32);
    }

    private createIconPlaceholders() {
        const types = ['icon_weapon_crate', 'icon_scrap_metal'];
        types.forEach(type => {
            if (this.scene.textures.exists(type)) return;
            const size = 64;
            const graphics = this.scene.make.graphics({ x: 0, y: 0 });

            // Frame
            graphics.lineStyle(2, 0xffffff, 1);
            graphics.strokeRect(0, 0, size, size);

            // Content
            graphics.fillStyle(type.includes('weapon') ? 0xff0000 : 0xaaaaaa, 0.5);
            graphics.fillRect(4, 4, size - 8, size - 8);

            graphics.generateTexture(type, size, size);
        });
    }

    public createClutter() {
        // 1. Can (Eastward: Crushed Soda Can)
        if (!this.scene.textures.exists('clutter_can')) {
            const g = this.scene.make.graphics({ x: 0, y: 0 });
            g.fillStyle(0xff3333, 1);
            g.fillRect(2, 4, 8, 12); // Red Body
            g.fillStyle(0xcccccc, 1);
            g.fillRect(2, 2, 8, 2); // Silver Top
            g.fillStyle(0x992222, 1); // Dent
            g.fillTriangle(4, 8, 8, 8, 6, 12);
            g.generateTexture('clutter_can', 12, 18);
        }

        // 2. Wire (Eastward: Loose Cable)
        if (!this.scene.textures.exists('clutter_wire')) {
            const g = this.scene.make.graphics({ x: 0, y: 0 });
            g.lineStyle(2, 0x333333, 1);
            g.beginPath();
            g.moveTo(0, 0);
            g.lineTo(10, 10);
            g.lineTo(20, 5);
            g.lineTo(32, 32); // Jagged Wire
            g.strokePath();
            g.generateTexture('clutter_wire', 32, 32);
        }

        // 3. Tire (Eastward: Old Rubber)
        if (!this.scene.textures.exists('clutter_tire')) {
            const g = this.scene.make.graphics({ x: 0, y: 0 });
            g.fillStyle(0x111111, 1);
            g.fillCircle(12, 12, 12); // Outer
            g.fillStyle(0x333333, 1); // Detail
            g.fillCircle(12, 12, 4); // Inner Hub
            g.generateTexture('clutter_tire', 24, 24);
        }
    }
}
