import React from 'react';
import { metaGame } from '../../services/MetaGameService';
import { sessionService } from '../../services/SessionService';
import { MenuButton } from '../ui/MenuButton';

/**
 * Main menu action buttons container
 * Contains: 裝備, 武器庫, 出擊
 */
export const HideoutActions: React.FC = () => {
    const handleEquip = () => {
        sessionService.openWorkbench('HERO');
    };

    const handleArsenal = () => {
        sessionService.openWorkbench('CRATE');
    };

    const handleDeploy = () => {
        metaGame.startMatch();
    };

    return (
        <div className="flex flex-col gap-3">
            {/* Top row: 裝備 + 武器庫 */}
            <div className="flex gap-3">
                <MenuButton
                    label="裝備"
                    onClick={handleEquip}
                    variant="ghost"
                />
                <MenuButton
                    label="武器庫"
                    onClick={handleArsenal}
                    variant="ghost"
                />
            </div>

            {/* Bottom row: 出擊 (primary action) */}
            <MenuButton
                label="出擊 >>"
                onClick={handleDeploy}
                variant="primary"
                className="text-xl"
            />
        </div>
    );
};
