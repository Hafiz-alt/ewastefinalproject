import React, { useState, useEffect } from 'react';
import { Heart, Zap, Trophy, Share2 } from 'lucide-react';

export default function ImpactPet({ points = 0, wasteRecycled = 0 }) {
    const [level, setLevel] = useState(1);
    const [mood, setMood] = useState('happy');

    // Calculate level based on points (e.g., every 100 points is a level)
    useEffect(() => {
        const newLevel = Math.max(1, Math.floor(points / 100) + 1);
        setLevel(newLevel);
    }, [points]);

    const getPetEmoji = () => {
        if (level < 3) return '🌱'; // Seedling
        if (level < 5) return '🌿'; // Herb
        if (level < 10) return '🌳'; // Tree
        if (level < 20) return '🦖'; // Dino (why not?)
        return '🐲'; // Dragon
    };

    const getPetName = () => {
        if (level < 3) return 'Sprout';
        if (level < 5) return 'Leafy';
        if (level < 10) return 'Groot';
        if (level < 20) return 'Rex';
        return 'Smaug';
    };

    return (
        <div className="bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-3xl p-6 relative overflow-hidden shadow-sm border border-emerald-200 dark:border-emerald-800">
            <div className="absolute top-0 right-0 p-4">
                <div className="bg-white/50 dark:bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-emerald-800 dark:text-emerald-200">
                    Lvl {level}
                </div>
            </div>

            <div className="flex flex-col items-center justify-center py-4">
                <div className="relative">
                    <div className="text-8xl animate-bounce-slow filter drop-shadow-xl transition-all duration-500 transform hover:scale-110 cursor-pointer"
                        onClick={() => setMood(mood === 'happy' ? 'excited' : 'happy')}>
                        {getPetEmoji()}
                    </div>

                    {/* Status Indicators */}
                    <div className="absolute -right-4 top-0 flex flex-col gap-2">
                        <div className="bg-white p-1.5 rounded-full shadow-sm animate-pulse">
                            <Heart className="h-4 w-4 text-red-500 fill-current" />
                        </div>
                        <div className="bg-white p-1.5 rounded-full shadow-sm">
                            <Zap className="h-4 w-4 text-yellow-500 fill-current" />
                        </div>
                    </div>
                </div>

                <h3 className="mt-4 text-xl font-bold text-emerald-900 dark:text-emerald-100">{getPetName()}</h3>
                <p className="text-sm text-emerald-700 dark:text-emerald-300 text-center max-w-[200px]">
                    {mood === 'happy' ? "I'm growing thanks to your recycling!" : "Wow! So much e-waste saved!"}
                </p>

                {/* Progress Bar */}
                <div className="w-full mt-6 bg-white/50 dark:bg-black/20 rounded-full h-3 overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${(points % 100)}%` }}
                    ></div>
                </div>
                <div className="flex justify-between w-full mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <span>{points % 100} / 100 XP</span>
                    <span>Next Level</span>
                </div>

                <button className="mt-6 flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl text-sm font-medium text-emerald-700 dark:text-emerald-300 shadow-sm hover:shadow-md transition-all">
                    <Share2 className="h-4 w-4" />
                    Share Progress
                </button>
            </div>
        </div>
    );
}
