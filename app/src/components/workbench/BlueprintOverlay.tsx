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
                <div className="bg-black border-t-4 border-amber-500 p-6">
                    <h3 className="text-amber-500 font-bold text-center mb-4 text-xl tracking-widest uppercase">
                        {languageService.t('WB_CLASS_SELECT')}
                    </h3>

                    <CharacterSelector
                        onSelect={(classId) => metaGame.selectHero(classId)}
                        initialClass={sessionService.getState().metaState.selectedHeroId}
                    />

                    <button
                        onClick={() => EventBus.emit('WORKBENCH_ACTION', 'BACK')}
                        className="w-full py-3 mt-2 bg-white text-black font-black hover:bg-amber-400 transition-colors"
                    >
                        [{languageService.t('BTN_BACK')}]
                    </button>
                </div>
            </div>
        </div>
    );
};
