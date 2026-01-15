export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

class LoggerService {
    private isDev = import.meta.env.DEV;
    private prefix = '🎮';

    /**
     * Debug logs: Only visible in Development mode.
     * Use for verbose tracking, state changes, and loop diagnostics.
     */
    debug(tag: string, message: string, ...args: any[]) {
        if (this.isDev) {
            console.log(`%c${this.prefix} [${tag}] ${message}`, 'color: #9CA3AF', ...args);
        }
    }

    /**
     * Info logs: Visible in all modes (can be filtered in prod if needed).
     * Use for major lifecycle events (Boot, Login, Scene Switch).
     */
    info(tag: string, message: string, ...args: any[]) {
        console.log(`%c${this.prefix} [${tag}] ${message}`, 'color: #3B82F6; font-weight: bold', ...args);
    }

    /**
     * Warnings: Something is wrong but app can continue.
     */
    warn(tag: string, message: string, ...args: any[]) {
        console.warn(`⚠️ [${tag}] ${message}`, ...args);
    }

    /**
     * Errors: Critical failures that likely broke functionality.
     */
    error(tag: string, message: string, ...args: any[]) {
        console.error(`❌ [${tag}] ${message}`, ...args);
    }

    /**
     * Grouping for complex objects (Dev only)
     */
    group(tag: string, label: string) {
        if (this.isDev) console.group(`${this.prefix} [${tag}] ${label}`);
    }

    groupEnd() {
        if (this.isDev) console.groupEnd();
    }
}

export const logger = new LoggerService();
