import React from 'react';
import { CharacterSelector } from './CharacterSelector';
import { EventBus } from '../../services/EventBus';
import { sessionService } from '../../services/SessionService';
import { metaGame } from '../../services/MetaGameService';
import { languageService } from '../../services/LanguageService';

export const BlueprintOverlay: React.FC = () => {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-24 pointer-events-none">
            <div className="w-full max-w-sm pointer-events-auto animate-in slide-in-from-bottom duration-500">
                <div className="bg-black/80 border-t-4 border-[#00FFFF] p-6 backdrop-blur-md">
                    <h3 className="text-[#00FFFF] font-bold text-center mb-4 text-xl" style={{ fontFamily: 'Microsoft JhengHei' }}>
                        {languageService.t('WB_CLASS_SELECT')}
                    </h3>

                    <CharacterSelector
                        onSelect={(classId) => metaGame.selectHero(classId)}
                        initialClass={sessionService.getState().metaState.selectedHeroId}
                    />

                    <button
                        onClick={() => EventBus.emit('WORKBENCH_ACTION', 'BACK')}
                        className="w-full py-3 mt-2 bg-white/10 hover:bg-white/20 text-white font-mono text-sm border border-white/20"
                    >
                        [ {languageService.t('BTN_BACK')} ]
                    </button>
                </div>
            </div>
        </div>
    );
};
