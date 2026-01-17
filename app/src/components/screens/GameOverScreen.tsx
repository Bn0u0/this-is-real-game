import React, { useState, useEffect } from 'react';
import { metaGame } from '../../services/MetaGameService';
import { sessionService } from '../../services/SessionService';

export const GameOverScreen: React.FC = () => {
    const [result, setResult] = useState(sessionService.getState().lastMissionResult);

    useEffect(() => {
        const unsub = sessionService.subscribe(s => setResult(s.lastMissionResult));
        return unsub;
    }, []);

    const isSuccess = result?.success || false;
    const earn = result?.earn || 0;

    return (
        <div className="absolute inset-0 flex items-center justify-center p-6 bg-black/90 pointer-events-auto z-[100]">
            {/* Baba-style Box */}
            <div className={`baba-box p-8 w-full max-w-sm text-center shadow-xl ${isSuccess ? 'border-rust' : 'border-blood'}`}>

                {/* Title */}
                <h1 className={`text-4xl uppercase mb-4 tracking-widest ${isSuccess ? 'text-rust' : 'text-blood'}`}>
                    {isSuccess ? '// 任務完成' : '// 訊號丟失'}
                </h1>

                {/* Status */}
                <div className="text-xl text-ash mb-6 uppercase">
                    {isSuccess ? '[ 成功撤離 ]' : '[ 任務失敗 ]'}
                </div>

                {/* Results Box */}
                <div className="border-2 border-dashed border-ash p-4 mb-6 text-left space-y-2 bg-void/50">
                    <div className="flex justify-between text-lg">
                        <span className="text-ash">狀態:</span>
                        <span className={isSuccess ? 'text-rad uppercase' : 'text-blood uppercase'}>
                            {isSuccess ? 'SUCCESS' : 'KIA'}
                        </span>
                    </div>
                    <div className="flex justify-between text-lg">
                        <span className="text-ash">收益:</span>
                        <span className="text-acid">+{earn} G</span>
                    </div>
                    {!isSuccess && (
                        <div className="text-sm text-blood mt-2 italic">
                            &gt; 裝備已遺失
                        </div>
                    )}
                </div>

                {/* Action Button */}
                <button
                    onClick={() => {
                        metaGame.navigateTo('HIDEOUT');
                        sessionService.enterHideout();
                    }}
                    className={`baba-btn w-full py-4 text-xl ${isSuccess ? '' : 'bg-blood border-blood text-bone'}`}
                >
                    {isSuccess ? '>> 返回基地' : '>> 重新初始化'}
                </button>
            </div>
        </div>
    );
};
