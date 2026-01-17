import React from 'react';
import { sessionService } from '../../services/SessionService';
import { inventoryService } from '../../services/InventoryService';

export const BlueprintOverlay: React.FC = () => {
    const blueprints = inventoryService.getState().blueprints || [];

    const getBlueprintName = (bp: string) => {
        if (bp.includes('scavenger')) return '拾荒者核心';
        if (bp.includes('skirmisher')) return '游擊者核心';
        return '織命者核心';
    };

    return (
        <div className="absolute inset-0 flex items-center justify-center p-4 z-50 pointer-events-auto">
            <div className="baba-box p-6 w-full max-w-sm">

                {/* Header */}
                <div className="flex items-center justify-between mb-6 border-b-2 border-rust pb-3">
                    <h2 className="text-2xl text-rust uppercase tracking-widest">
                        // 藍圖收藏
                    </h2>
                </div>

                {/* Blueprint List */}
                <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto">
                    {blueprints.length > 0 ? (
                        blueprints.map((bp) => (
                            <div
                                key={bp}
                                className="baba-slot p-3 flex items-center justify-between"
                            >
                                <div className="flex flex-col">
                                    <span className="text-ash text-xs uppercase">{bp}</span>
                                    <span className="text-bone text-lg">{getBlueprintName(bp)}</span>
                                </div>
                                <div className="text-acid text-xs uppercase">
                                    [收錄]
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-ash">
                            // 尚未發現任何藍圖
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="border-t-2 border-dashed border-ash pt-4 mb-4">
                    <p className="text-ash text-sm">
                        已收錄: {blueprints.length} 張
                    </p>
                </div>

                {/* Close Button */}
                <button
                    onClick={() => sessionService.openWorkbench('NONE')}
                    className="baba-btn-ghost w-full py-3"
                >
                    [ 關閉 ]
                </button>
            </div>
        </div>
    );
};
