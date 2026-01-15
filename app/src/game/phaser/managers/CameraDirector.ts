import Phaser from 'phaser';

export class CameraDirector {
    private scene: Phaser.Scene;
    private camera: Phaser.Cameras.Scene2D.Camera;
    private worldWidth: number;
    private worldHeight: number;
    private defaultZoom: number = 1.0;

    constructor(scene: Phaser.Scene, width: number, height: number) {
        this.scene = scene;
        this.camera = scene.cameras.main;
        this.worldWidth = width;
        this.worldHeight = height;

        // Auto-Zoom based on screen size
        const { width: screenWidth } = scene.scale;
        this.defaultZoom = screenWidth < 600 ? 0.8 : 1.0;
        this.camera.setZoom(this.defaultZoom);
    }

    public follow(target: Phaser.GameObjects.GameObject | { x: number, y: number }) {
        this.camera.startFollow(target, true, 0.1, 0.1);
        // Set lerp to 0.1 for smooth panning
    }

    public updateLookahead(vx: number, vy: number) {
        // Simple lookahead based on velocity
        const magnitude = 100;
        const targetX = vx * magnitude;
        const targetY = vy * magnitude;

        this.camera.followOffset.x = Phaser.Math.Linear(this.camera.followOffset.x, -targetX, 0.05);
        this.camera.followOffset.y = Phaser.Math.Linear(this.camera.followOffset.y, -targetY, 0.05);
    }

    public reset(angle: number = 0) {
        this.camera.stopFollow();
        this.camera.setScroll(this.worldWidth / 2 - this.camera.width / 2, this.worldHeight / 2 - this.camera.height / 2);
        this.camera.followOffset.set(0, 0);
        this.camera.setRotation(angle);
    }

    public shake(intensity: number = 0.01, duration: number = 200) {
        this.camera.shake(duration, intensity);
    }

    public flash(duration: number = 50, r: number = 255, g: number = 255, b: number = 255) {
        this.camera.flash(duration, r, g, b);
    }

    public resize(width: number, height: number) {
        this.camera.setViewport(0, 0, width, height);
        this.defaultZoom = width < 600 ? 0.8 : 1.0;
        this.camera.setZoom(this.defaultZoom);
    }
}
