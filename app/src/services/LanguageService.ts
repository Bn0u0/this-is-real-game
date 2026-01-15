import { EventBus } from './EventBus';

export type Language = 'EN' | 'ZH';

const DICTIONARY = {
    EN: {
        // Layout
        PROJECT_TITLE: 'PROJECT_PRISM // V.0.4',
        CREDITS: 'CREDITS',
        SHARDS: 'SHARDS',

        HIDEOUT_HEADER: 'HIDEOUT',
        DEPLOY_BUTTON: 'DEPLOY LINK',
        HOME_BTN_ARSENAL: 'ARSENAL',
        HOME_BTN_BLUEPRINTS: 'BLUEPRINTS',
        HOME_BTN_WORKBENCH: 'WORKBENCH',
        ARSENAL_STORAGE: 'ARSENAL STORAGE',
        BTN_SELL_MODE: 'SELL ITEMS',
        BTN_SELL_ACTIVE: 'SELL MODE ACTIVE',
        BTN_CLOSE: 'CLOSE',
        BTN_BACK_MENU: 'RETURN TO MENU',
        WB_GO: 'GO',
        WB_GEAR: 'GEAR',
        WB_HERO: 'HERO',
        WB_CLASS_SELECT: 'CLASS SELECT',
        HERO_STATS_HEADER: 'AGENT PROFILE',
        UNLOCK_TECH_HEADER: 'TECH RESEARCH',
        BP_COLLECTION: 'BLUEPRINT ARCHIVE',

        // Main Menu
        MM_TITLE_1: 'THIS IS CALLED',
        MM_TITLE_2: 'GRASS CUTTING',
        MM_SUBTITLE: 'JUST 3 MINUTES. DONT BE GREEDY. EXTRACT FAST.',
        MM_BTN_START: 'DEPLOY NOW! 🚀',
        MM_BTN_HIDEOUT: 'HIDEOUT (WAREHOUSE) 📦',
        MM_BTN_ARSENAL: 'ARSENAL / ARMORY',
        MM_BTN_BACKUP: 'DIGITAL ASSET / BACKUP',
        MM_PROTOCOL: 'PROTOCOL: ZERO-BACKEND ENABLED',
        MM_VERSION: 'VER: 0.12.0 // MOUSE_SUPPORTED',
        MM_FOOTER: 'VER 3.0.0 // NEON_POP_PLATINUM',

        // Hideout
        ROOT_ACCESS: '// ROOT_ACCESS',
        NEURO_LINK_STATUS: 'NEURO-LINK STATUS: STABLE',
        ONLINE: 'ONLINE',
        CMD_DEPLOY: 'INITIALIZE_DEPLOY',
        SUB_DEPLOY: 'START NEW OPERATION',
        CMD_ARSENAL: 'ACCESS_ARSENAL',
        CMD_BLACK_MARKET: 'BLACK_MARKET',
        LOCKED: '[LOCKED]',
        CONFIRM_LINK: 'CONFIRM NEURO-LINK?',
        INSURANCE: 'BUY INSURANCE (-500C)',
        EXECUTE: 'EXECUTE',
        CANCEL: '[ CANCEL ]',

        // Arsenal
        STASH_HEADER: 'STASH',
        NO_ITEMS: 'NO ITEMS IN STASH',
        LOADOUT_HEADER: 'AGENT LOADOUT',
        NO_WEAPON: 'NO WEAPON',
        EMERGENCY_PROTOCOL: 'EMERGENCY PROTOCOL ACTIVE',
        UNEQUIP: '[ UNEQUIP ]',
        INSPECTOR_HEADER: 'INSPECTOR',
        SELECT_ITEM: 'SELECT ITEM TO INSPECT',
        BTN_EQUIP: 'EQUIP',
        BTN_SELL: 'SELL',
        BTN_BACK: '[ ESC ] BACK',

        // Stats
        STAT_DAMAGE: 'DAMAGE',
        STAT_FIRE_RATE: 'FIRE RATE',
        STAT_RANGE: 'RANGE',
        STAT_SPEED: 'SPEED',
        STAT_DEFENSE: 'DEFENSE',
        STAT_HP_MAX: 'HP MAX',
        STAT_CRIT: 'CRIT %',

        // Slots
        SLOT_HEAD: 'HEAD',
        SLOT_BODY: 'BODY',
        SLOT_LEGS: 'LEGS',
        SLOT_FEET: 'FEET',
        SLOT_MAIN_WEAPON: 'MAIN WEAPON',

        // Misc
        FOR: 'FOR',
        TO: 'TO',
        FILTER_LOCKED: 'FILTER LOCKED_TO'
    },
    ZH: {
        // Layout
        PROJECT_TITLE: '稜鏡計畫 // V.0.4',
        CREDITS: '信用點',
        SHARDS: '碎片',

        HIDEOUT_HEADER: '藏身處',
        DEPLOY_BUTTON: '啟動連結',
        HOME_BTN_ARSENAL: '軍械庫',
        HOME_BTN_BLUEPRINTS: '藍圖總管',
        HOME_BTN_WORKBENCH: '工作桌',
        ARSENAL_STORAGE: '軍械庫存',
        BTN_SELL_MODE: '販售模式',
        BTN_SELL_ACTIVE: '販售中',
        BTN_CLOSE: '關閉',
        BTN_BACK_MENU: '返回主選單',
        WB_GO: '出擊',
        WB_GEAR: '裝備',
        WB_HERO: '特工',
        WB_CLASS_SELECT: '職業選擇',
        HERO_STATS_HEADER: '特工檔案',
        UNLOCK_TECH_HEADER: '核心科技研發',
        BP_COLLECTION: '藍圖資料庫',

        // Hideout
        ROOT_ACCESS: '// 根目錄權限',
        NEURO_LINK_STATUS: '神經連結狀態: 穩定',
        ONLINE: '連線中',
        CMD_DEPLOY: '初始化_出擊',
        SUB_DEPLOY: '開始新行動',
        CMD_ARSENAL: '進入_軍械庫',
        CMD_BLACK_MARKET: '黑市_交易',
        LOCKED: '[未解鎖]',
        CONFIRM_LINK: '確認神經連結?',
        INSURANCE: '購買保險 (-500C)',
        EXECUTE: '執行',
        CANCEL: '[ 取消 ]',

        // Main Menu
        MM_TITLE_1: '這才叫',
        MM_TITLE_2: '割草',
        MM_SUBTITLE: '就3分鐘 別貪!快撤',
        MM_BTN_START: '立即出擊! 🚀',
        MM_BTN_HIDEOUT: 'HIDEOUT (倉庫) 📦',
        MM_BTN_ARSENAL: '武器庫 / HIDEOUT',
        MM_BTN_BACKUP: '數位資產 / BACKUP',
        MM_PROTOCOL: 'PROTOCOL: ZERO-BACKEND ENABLED',
        MM_VERSION: 'VER: 0.12.0 // MOUSE_SUPPORTED',
        MM_FOOTER: 'VER 3.0.0 // NEON_POP_PLATINUM',

        // Arsenal
        STASH_HEADER: '倉庫',
        NO_ITEMS: '倉庫空無一物',
        LOADOUT_HEADER: '特工裝備',
        SLOT_MAIN_WEAPON: '主武器',
        NO_WEAPON: '無武器',
        EMERGENCY_PROTOCOL: '緊急協定已啟動',
        UNEQUIP: '[ 卸除 ]',
        INSPECTOR_HEADER: '詳細資訊',
        SELECT_ITEM: '選擇物品以檢視',
        BTN_EQUIP: '裝備',
        BTN_SELL: '販賣',
        BTN_BACK: '[ ESC ] 返回',

        // Stats
        STAT_DAMAGE: '傷害',
        STAT_FIRE_RATE: '射速',
        STAT_RANGE: '射程',
        STAT_SPEED: '彈速',
        STAT_DEFENSE: '防禦',
        STAT_HP_MAX: '最大生命',
        STAT_CRIT: '暴擊率',

        // Slots
        SLOT_HEAD: '頭部',
        SLOT_BODY: '身體',
        SLOT_LEGS: '腿部',
        SLOT_FEET: '腳部',
        // SLOT_MAIN_WEAPON defined above

        // Boot
        BOOT_INIT: '系統初始化中...',
        BOOT_SYSTEM: '神經網絡連接中',

        // Misc
        FOR: '用於',
        TO: '至',
        FILTER_LOCKED: '篩選鎖定:'
    }
};

class LanguageServiceImpl {
    private currentLang: Language = 'ZH'; // Default to Chinese
    private listeners: ((lang: Language) => void)[] = [];

    public get current() {
        return this.currentLang;
    }

    public setLang(lang: Language) {
        this.currentLang = lang;
        this.emitChange();
    }

    public toggle() {
        this.currentLang = this.currentLang === 'EN' ? 'ZH' : 'EN';
        this.emitChange();
    }

    public t(key: keyof typeof DICTIONARY['EN']): string {
        return DICTIONARY[this.currentLang][key] || key;
    }

    public subscribe(callback: (lang: Language) => void) {
        this.listeners.push(callback);
        // callbacks should likely handle state sync, but standard pattern is just notify on change
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    private emitChange() {
        this.listeners.forEach(l => l(this.currentLang));
    }
}

export const languageService = new LanguageServiceImpl();
