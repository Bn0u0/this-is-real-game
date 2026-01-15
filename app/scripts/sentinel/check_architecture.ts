import * as fs from 'fs';
import * as path from 'path';

/**
 * Architecture Compliance Checker
 * Ensures that files are only placed in valid SSOT directories.
 */

const BASE_DIR = 'src/game';
const FORBIDDEN_ROOT_FILES = ['Player.ts', 'WaveManager.ts', 'WeaponSystem.ts', 'ItemLibrary.ts']; // Legacy names
const ALLOWED_ROOT_FILES = ['PhaserGame.tsx'];
const ALLOWED_SUBDIRS = ['phaser', 'ecs', 'data', 'scenes', 'constants', 'generators'];

function checkArchitecture() {
    console.log("🛡️ Starting Architecture Compliance Check...");
    let errors = 0;

    // 1. Check Root Directory
    const rootPath = path.resolve(BASE_DIR);
    if (!fs.existsSync(rootPath)) {
        console.error(`❌ Root directory ${BASE_DIR} not found!`);
        process.exit(1);
    }

    const items: string[] = fs.readdirSync(rootPath);

    items.forEach((item: string) => {
        const fullPath: string = path.join(rootPath, item);
        const stat: fs.Stats = fs.statSync(fullPath);

        if (stat.isFile()) {
            if (!ALLOWED_ROOT_FILES.includes(item)) {
                console.error(`❌ Found unauthorized file at root: ${BASE_DIR}/${item}`);
                errors++;
            }
        } else if (stat.isDirectory()) {
            if (!ALLOWED_SUBDIRS.includes(item)) {
                console.error(`❌ Found unauthorized directory: ${BASE_DIR}/${item}`);
                errors++;
            }
        }
    });

    // 2. Check Empty Folders (SSOT Drift)
    const legacyDirs: string[] = ['classes', 'entities', 'managers', 'pipelines', 'systems', 'factories', 'utils'];
    legacyDirs.forEach((dir: string) => {
        const legacyPath: string = path.join(rootPath, dir);
        if (fs.existsSync(legacyPath)) {
            console.error(`❌ Found legacy directory: ${BASE_DIR}/${dir}. Please move contents to phaser/${dir}.`);
            errors++;
        }
    });

    if (errors > 0) {
        console.error(`\n🚨 Architecture Check Failed with ${errors} error(s).`);
        process.exit(1);
    } else {
        console.log("✅ [PASS] Architecture is clean and SSOT compliant.");
    }
}

checkArchitecture();
