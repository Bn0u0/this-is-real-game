import React from 'react';
import { EventBus } from '../../services/EventBus';
import { inventoryService } from '../../services/InventoryService';
import { languageService } from '../../services/LanguageService';

export const BlueprintOverlay: React.FC = () => {
    const blueprints = inventoryService.getState().blueprints || [];

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-blue-950/40 backdrop-blur-md z-50">
            <div className="w-full max-w-sm bg-black border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] rounded-lg flex flex-col animate-in slide-in-from-bottom duration-300">
                {/* Header */}
                <div className="bg-blue-600 p-4 flex justify-between items-center">
                    <h3 className="text-white font-black tracking-tighter uppercase text-lg">
                        {languageService.t('BP_COLLECTION')}
                    </h3>
                </div>

                {/* Archive List */}
                <div className="p-4 max-h-[300px] overflow-y-auto space-y-2">
                    {blueprints.length > 0 ? (
                        blueprints.map((bp) => (
                            <div key={bp} className="bg-blue-900/20 border border-blue-500/30 p-3 flex items-center justify-between group hover:bg-blue-500/10 transition-colors">
                                <div className="flex flex-col">
                                    <span className="text-blue-400 font-mono text-[10px]">{bp.toUpperCase()}</span>
                                    <span className="text-white font-bold text-sm tracking-widest">
                                        {bp.includes('scavenger') ? '拾荒者核心' : bp.includes('skirmisher') ? '游擊者核心' : '織命者核心'}
                                    </span>
                                </div>
                                <div className="text-blue-500 text-xs font-black">ARCHIVED</div>
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-500 text-center py-10 font-mono text-xs">
                            - NO ARCHIVED DATA DETECTED -
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="p-4 bg-blue-900/10 border-t border-blue-500/20">
                    <p className="text-[9px] text-blue-400/60 font-mono mb-4 leading-tight">
                        SYSTEM://DATABASE_QUERY_SUCCESS<br />
                        RECOVERED_FRAGMENTS: {blueprints.length}<br />
                        ENCRYPTION_LAYER: 0
                    </p>

                    <button
                        onClick={() => EventBus.emit('WORKBENCH_ACTION', 'BACK')}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold transition-transform active:scale-95"
                    >
                        [{languageService.t('BTN_CLOSE')}]
                    </button>
                </div>
            </div>
        </div>
    );
};
