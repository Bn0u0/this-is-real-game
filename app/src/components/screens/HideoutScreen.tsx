import React, { useState, useEffect } from 'react';
import { inventoryService } from '../../services/InventoryService';
import { HideoutActions } from './HideoutActions';

export const HideoutScreen: React.FC = () => {
    const [profile, setProfile] = useState(inventoryService.getState());

    useEffect(() => {
        return inventoryService.subscribe(setProfile);
    }, []);

    return (
        /* [LAYOUT] Baba-style dark terminal UI */
        <div className="absolute inset-0 flex flex-col p-4 pointer-events-auto bg-transparent">

            {/* === TOP: Mission Terminal Header === */}
            <div className="baba-box p-4 mb-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl text-rust uppercase tracking-widest">
                        // 任務 終端機
                    </h1>
                    <div className="text-ash text-sm">
                        ID#8842
                    </div>
                </div>
            </div>

            {/* === PROFILE SECTION === */}
            <div className="baba-box-rust p-4 mb-4">
                <div className="flex gap-4">
                    {/* Avatar Block */}
                    <div className="w-20 h-20 border-2 border-bone flex items-center justify-center bg-void">
                        <span className="text-4xl">🥔</span>
                    </div>

                    {/* Stats */}
                    <div className="flex-1 flex flex-col justify-center gap-1">
                        <div className="text-xl text-acid uppercase">
                            LV.{profile.toolkitLevel || 1} 拾荒者
                        </div>
                        <div className="text-ash">
                            金幣: <span className="text-bone">{profile.wallet?.gold || 0}</span>
                        </div>
                        <div className="text-ash">
                            寶石: <span className="text-bone">{profile.wallet?.gems || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* === MIDDLE: Preview Area (Flexible) === */}
            <div className="flex-1 border-2 border-dashed border-ash flex items-center justify-center mb-4 opacity-50">
                <span className="text-ash text-xl uppercase">[ 角色預覽區 ]</span>
            </div>

            {/* === BOTTOM: Action Buttons (Independent Component) === */}
            <HideoutActions />
        </div>
    );
};
