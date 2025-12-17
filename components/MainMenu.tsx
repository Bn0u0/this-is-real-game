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
                    <h1 className="text-4xl md:text-6xl font-black italic text-[#00FFFF] tracking-tighter drop-shadow-[0_0_15px_rgba(0,255,255,0.5)]">
                        SYNAPSE
                    </h1>
                    <h2 className="text-xl md:text-2xl text-[#FF0055] tracking-[0.5em] font-light">
                        PROJECT BALLISTIC
                    </h2>
                </div>

                {/* Hero Button - Force Vanguard */}
                <button
                    className="hero-button"
                    onClick={() => onStartGame('Vanguard')}
                >
                    立即出擊
                </button>

                {/* Multiplayer / Squad Link */}
                <div className="sub-link" onClick={() => alert("SQUAD LINK [OFFLINE]\nSERVER MAINTENANCE")}>
                    SQUAD LINK (BETA)
                </div>
            </div>

            {/* Version Info */}
            <div className="absolute bottom-4 text-[10px] text-gray-600 tracking-widest">
                VER 0.8.2 // PROTOTYPE
            </div>
        </div>
    );
};
