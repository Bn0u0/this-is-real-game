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
    log("✈️  Starting Smoke Sentinel...", colors.blue);

    // Script in app/scripts/sentinel
    // Run npm from app root (../../)
    const projectRoot = '../../';

    log("🔌 Starting 'npm run preview'...", colors.blue);
    const server = spawn('npm', ['run', 'preview', '--', '--port', '4173'], {
        cwd: process.cwd(),
        // Wait, npx tsx executes from cwd (app).
        // So cwd for spawn should be '.' or just inherit?
        // If we run `npm run check:boot` from `app`, cwd is `app`.
        // But the script file is in `scripts/sentinel`.
        // spawn 'cwd' relies on process.cwd() usually unless specified.
        // Let's use absolute path to be safe, or just '.' since we run from app.
        shell: true,
        stdio: 'ignore'
    });

    try {
        await new Promise(r => setTimeout(r, 5000));

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        let errorCount = 0;
        page.on('console', msg => {
            const type = msg.type();
            const text = msg.text();

            if (type === 'error') {
                const location = msg.location();
                // Ignore favicon 404s which appear as console errors
                if (text.includes('favicon.ico') || (location.url && location.url.includes('favicon.ico'))) {
                    return;
                }
                // Ignore Appwrite offline-mode errors
                if (text.includes('ERR_CONNECTION_REFUSED') || text.includes('/v1/') || text.includes('Appwrite')) {
                    return;
                }
                log(`[BROWSER ERROR] ${text} @ ${location.url || 'unknown'}`, colors.red);
                errorCount++;
            }
        });

        page.on('requestfailed', request => {
            const url = request.url();
            const failure = request.failure();
            const errorText = failure ? failure.errorText : 'Unknown';
            // Ignore expected offline-mode failures
            if (url.includes('favicon.ico')) return;
            if (url.includes('/v1/account') || url.includes('/v1/')) {
                log(`[NETWORK WARN] Appwrite offline: ${url}`, colors.yellow);
                return; // Don't count Appwrite failures as errors
            }
            log(`[NETWORK FAIL] ${url} : ${errorText}`, colors.red);
            errorCount++;
        });

        page.on('response', response => {
            if (response.status() >= 400) {
                const url = response.url();
                if (url.includes('favicon.ico')) return;
                log(`[HTTP ERROR] ${response.status()} ${url}`, colors.red);
            }
        });

        page.on('pageerror', (err: any) => {
            log(`[PAGE EXCEPTION] ${err.message || err}`, colors.red);
            errorCount++;
        });

        log("🌍 Navigating to http://localhost:4173...", colors.blue);
        await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });

        try {
            await page.waitForSelector('canvas', { timeout: 5000 });
            log("✅ Canvas detected.", colors.green);
        } catch (e) {
            log("❌ Canvas NOT detected within 5s.", colors.red);
            errorCount++;
        }

        if (errorCount === 0) {
            log("🎉 Smoke Test Passed. The game boots and renders.", colors.green);
        } else {
            log(`❌ Smoke Test Failed with ${errorCount} errors.`, colors.red);
            process.exit(1);
        }

        await browser.close();

    } catch (e: any) {
        log(`❌ Smoke Test Exception: ${e.message || e}`, colors.red);
        process.exit(1);
    } finally {
        server.kill();
        if (process.platform === 'win32') {
            spawn('taskkill', ['/pid', server.pid?.toString() || '', '/f', '/t']);
        }
    }
}

main();
