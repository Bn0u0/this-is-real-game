import React from 'react';

interface MainMenuProps {
    onStartGame: (role: string) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame }) => {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-500">
            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('/assets/hex-bg.png')] bg-cover" />

            <div className="relative z-10 flex flex-col items-center">
                {/* Title / Logo Placeholder */}
                <div className="mb-12 text-center">
                    <h1 className="text-6xl md:text-8xl font-black italic text-[#00FFFF] tracking-tighter drop-shadow-[0_0_15px_rgba(0,255,255,0.8)] glitch-text" data-text="這才叫割草">
                        這才叫割草
                    </h1>
                    <h2 className="text-2xl md:text-3xl text-[#FF0055] tracking-[0.2em] font-bold mt-2">
                        別貪！快撤
                    </h2>
                </div>

                {/* Hero Button - Force Vanguard */}
                <button
                    className="hero-button mb-6"
                    onClick={() => onStartGame('Vanguard')}
                >
                    立即出擊
                </button>

                {/* Secondary Links */}
                <div className="flex flex-col gap-3 w-full max-w-xs">
                    <button
                        className="sub-link w-full text-center py-3 border border-[#00FFFF]/30 hover:bg-[#00FFFF]/10 hover:border-[#00FFFF] transition-all text-[#00FFFF] tracking-widest text-sm font-bold uppercase"
                        onClick={() => alert("SQUAD LINK [OFFLINE]\nSERVER MAINTENANCE")}
                    >
                        SQUAD LINK (BETA)
                    </button>

                    <button
                        className="sub-link w-full text-center py-3 border border-[#FFD700]/30 hover:bg-[#FFD700]/10 hover:border-[#FFD700] transition-all text-[#FFD700] tracking-widest text-sm font-bold uppercase relative overflow-hidden group"
                        onClick={() => alert("創始股東名單 (Founding Shareholders):\n\n1. You\n2. Me\n3. Everybody")}
                    >
                        <span className="relative z-10">★ 創始股東 ★</span>
                        <div className="absolute inset-0 bg-[#FFD700]/5 -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-in-out"></div>
                    </button>
                </div>
            </div>

            {/* Version Info */}
            <div className="absolute bottom-4 text-[10px] text-gray-600 tracking-widest">
                VER 0.8.2 // PROTOTYPE
            </div>
        </div>
    );
};
