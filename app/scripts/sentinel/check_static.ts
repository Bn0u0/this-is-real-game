import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

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

function error(msg: string) {
    console.error(`${colors.red}❌ [FAIL] ${msg}${colors.reset}`);
    process.exit(1);
}

function success(msg: string) {
    console.log(`${colors.green}✅ [PASS] ${msg}${colors.reset}`);
}

async function main() {
    log("🛡️ Starting Static Defense...", colors.blue);

    // Script is in app/scripts/sentinel/
    // We run from app root via npm scripts
    const projectRoot = process.cwd();

    // 1. Config Check
    const requiredFiles = ['package.json', 'vite.config.ts', 'tsconfig.json'];
    for (const file of requiredFiles) {
        if (!fs.existsSync(path.join(projectRoot, file))) {
            error(`Missing critical config: ${file}`);
        }
    }
    success("Config files presence verified.");

    // 2. Critical Bug Regression Check
    const joystickPath = path.join(projectRoot, 'src/components/combat/UnifiedJoystick.tsx');
    if (fs.existsSync(joystickPath)) {
        const content = fs.readFileSync(joystickPath, 'utf-8');
        if (!content.includes('pointer-events-auto')) {
            error("UnifiedJoystick.tsx is missing 'pointer-events-auto'. The UI bug has regressed!");
        }
        success("UnifiedJoystick regression check passed.");
    } else {
        log("⚠️ UnifiedJoystick.tsx not found, skipping check.", colors.yellow);
    }

    // 3. Build Check
    log("🔨 Running 'npm run build'...", colors.blue);
    try {
        execSync('npm run build', { stdio: 'inherit', cwd: projectRoot });
        success("Build completed successfully.");
    } catch (e) {
        error("Build failed. Fix typescript/syntax errors first.");
    }

    log("🎉 Static Defense Complete. No low-level issues found.", colors.green);
}

main().catch(err => error(err.message));
