import puppeteer from 'puppeteer';
import { spawn } from 'child_process';

const colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m"
};

function log(msg: string, color: string = colors.reset) {
    console.log(`${color}${msg}${colors.reset}`);
}

async function main() {
    log("🛡️  Starting Gameplay Sentinel...", colors.blue);

    // Start Dev Server (Needed for import.meta.env.DEV hooks)
    log("🔌 Starting 'npm run dev'...", colors.blue);
    const server = spawn('npm', ['run', 'dev', '--', '--port', '5173'], {
        cwd: process.cwd(),
        shell: true,
        stdio: 'ignore'
    });

    try {
        // Wait for server to boot
        await new Promise(r => setTimeout(r, 5000));

        const browser = await puppeteer.launch({
            headless: true, // Set to false to see it in action
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        // Capture Logs
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('[Sentinel]') || text.includes('[Player]')) {
                log(`[BROWSER] ${text}`, colors.yellow);
            } else if (msg.type() === 'error' && !text.includes('favicon')) {
                log(`[ERROR] ${text}`, colors.red);
            }
        });

        log("🌍 Navigating to game...", colors.blue);
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

        // 1. Hook Verification
        log("🔍 Verifying Global Hook...", colors.blue);
        const hookExists = await page.evaluate(() => {
            return (window as any).__GAME__ !== undefined;
        });

        if (!hookExists) {
            throw new Error("❌ window.__GAME__ is NOT defined. Is 'DebugInterface.ts' working?");
        }
        log("✅ Hook Verified.", colors.green);

        // 1.5. Trigger Scene Switch (Workbench -> MainScene)
        // The game boots into WorkbenchScene. We need to tell it to start the match.
        log("⏳ Waiting for WorkbenchScene to be ready...", colors.blue);
        await page.waitForFunction(() => {
            const g = (window as any).__GAME__;
            if (!g || !g.game) return false;
            const scene = g.game.scene.getScene('WorkbenchScene');
            return scene && scene.scene.isActive();
        }, { timeout: 10000 });

        log("🚀 Triggering 'SCENE_SWITCH' event...", colors.blue);
        await page.evaluate(() => {
            (window as any).__GAME__.eventBus.emit('SCENE_SWITCH', 'MainScene');
        });

        // 2. Scene Ready Check
        log("⏳ Waiting for MainScene...", colors.blue);
        await page.waitForFunction(() => {
            const g = (window as any).__GAME__;
            if (!g || !g.game) return false;
            const scene = g.game.scene.getScene('MainScene');
            return scene && scene.scene.isActive();
        }, { timeout: 10000 });
        log("✅ MainScene Active.", colors.green);

        log("🚀 Triggering 'START_MATCH'...", colors.blue);
        await page.evaluate(() => {
            (window as any).__GAME__.eventBus.emit('START_MATCH', { hero: 'SCAVENGER' });
        });

        // 3. Mechanic: Movement
        log("🏃 Testing Movement...", colors.blue);

        // Wait for player spawn
        await page.waitForFunction(() => {
            const g = (window as any).__GAME__;
            const scene = g.game.scene.getScene('MainScene') as any;
            return scene && scene.playerManager && scene.playerManager.myUnit;
        });

        const initialY = await page.evaluate(() => {
            const game = (window as any).__GAME__.game;
            const scene = game.scene.getScene('MainScene') as any;
            return scene.playerManager.myUnit.y;
        });

        // Press Virtual Joystick UP
        await page.evaluate(() => {
            (window as any).__GAME__.eventBus.emit('JOYSTICK_MOVE', { x: 0, y: -1 });
        });

        await new Promise(r => setTimeout(r, 500)); // Walk for 500ms

        // Release Joystick
        await page.evaluate(() => {
            (window as any).__GAME__.eventBus.emit('JOYSTICK_MOVE', { x: 0, y: 0 });
        });

        const newY = await page.evaluate(() => {
            const game = (window as any).__GAME__.game;
            const scene = game.scene.getScene('MainScene') as any;
            return scene.playerManager.myUnit.y;
        });

        if (newY >= initialY) {
            throw new Error(`❌ Movement Failed: Player did not move UP (Y: ${initialY} -> ${newY})`);
        }
        log(`✅ Movement Verified (Delta: ${initialY - newY})`, colors.green);

        // 4. Mechanic: Combat (Auto-Fire)
        log("⚔️ Testing Combat...", colors.blue);

        // Get Player Pos
        const playerPos = await page.evaluate(() => {
            const g = (window as any).__GAME__;
            const scene = g.game.scene.getScene('MainScene') as any;
            return { x: scene.playerManager.myUnit.x, y: scene.playerManager.myUnit.y };
        });

        // Spawn Enemy near player (Within Range 200)
        // Player is at playerPos.x, playerPos.y. 
        // Default Weapon Range is ~300.
        // Spawn at Y - 150 (Above player)
        log(`👾 Spawning Enemy at (${playerPos.x}, ${playerPos.y - 150})...`, colors.blue);

        await page.evaluate((ex, ey) => {
            (window as any).__GAME__.eventBus.emit('DEBUG_SPAWN_ENEMY', { x: ex, y: ey });
        }, playerPos.x, playerPos.y - 150);

        // Wait for Enemy Spawn (Relaxed check)
        // We assume spawn works if no error, and wait for the result (Kill)
        log("⏳ Waiting for Enemy interaction...", colors.blue);
        await new Promise(r => setTimeout(r, 1000)); // Allow spawn to settle

        // Wait for Kill (Auto-fire should happen)
        log("🔫 Waiting for Auto-Fire & Kill...", colors.blue);

        // Listen for ENEMY_KILLED_AT (ECS) or ENEMY_KILLED (Legacy)
        // We inject a listener that sets a flag
        await page.evaluate(() => {
            (window as any).__SENTINEL_KILL_CONFIRMED__ = false;
            const bus = (window as any).__GAME__.eventBus;

            bus.once('ENEMY_KILLED_AT', () => {
                console.log("[Sentinel] Trapped ENEMY_KILLED_AT");
                (window as any).__SENTINEL_KILL_CONFIRMED__ = true;
            });

            // Backup Legacy
            bus.once('ENEMY_KILLED', () => {
                console.log("[Sentinel] Trapped ENEMY_KILLED");
                (window as any).__SENTINEL_KILL_CONFIRMED__ = true;
            });
        });

        // Wait for flag
        try {
            await page.waitForFunction(() => {
                return (window as any).__SENTINEL_KILL_CONFIRMED__ === true;
            }, { timeout: 10000 }); // 10s to kill
            log("✅ Enemy Killed! Combat Verified.", colors.green);
        } catch (e) {
            throw new Error("❌ Combat Failed: Enemy was not killed within 10s.");
        }

        // 4. Success
        log("🎉 All Sentinel Checks Passed.", colors.green);
        await browser.close();
        process.exit(0);

    } catch (e: any) {
        log(`❌ Sentinel Check Failed: ${e.message}`, colors.red);
        process.exit(1);
    } finally {
        server.kill();
        if (process.platform === 'win32') {
            spawn('taskkill', ['/pid', server.pid?.toString() || '', '/f', '/t']);
        }
    }
}

main();
