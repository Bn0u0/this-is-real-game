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
            {/* Paper Card */}
            <div className="wobbly-box p-8 w-full max-w-sm text-center shadow-xl">

                {/* Title Stamp */}
                <h1
                    className={`text-4xl font-black mb-4 ${isSuccess ? 'text-amber-600' : 'text-red-600'}`}
                    style={{ fontFamily: 'var(--font-marker)' }}
                >
                    {isSuccess ? '成功撤離' : '任務失敗'}
                </h1>

                {/* Status */}
                <div className={`text-lg font-hand mb-6 ${isSuccess ? 'text-amber-500' : 'text-red-500'}`}>
                    {isSuccess ? '[ 訊號穩定 ]' : '[ 訊號丟失 ]'}
                </div>

                {/* Results Box */}
                <div className="bg-white/50 border-2 border-dashed border-gray-400 p-4 mb-6 text-left space-y-2">
                    <div className="flex justify-between font-hand text-lg">
                        <span>任務狀態:</span>
                        <span className={isSuccess ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                            {isSuccess ? '成功' : '失敗'}
                        </span>
                    </div>
                    <div className="flex justify-between font-hand text-lg">
                        <span>獲得金幣:</span>
                        <span className="text-amber-600 font-bold">+{earn}</span>
                    </div>
                    {!isSuccess && (
                        <div className="text-sm text-red-500 mt-2 font-hand italic">
                            裝備已永久損失...
                        </div>
                    )}
                </div>

                {/* Action Button */}
                <button
                    onClick={() => {
                        metaGame.navigateTo('HIDEOUT');
                        sessionService.enterHideout();
                    }}
                    className={`sketch-btn w-full py-4 text-xl ${isSuccess ? 'bg-amber-500 text-white' : 'bg-red-600 text-white'}`}
                >
                    {isSuccess ? '返回基地' : '重新開始'}
                </button>
            </div>
        </div>
    );
};
