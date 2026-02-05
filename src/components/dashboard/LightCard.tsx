import React from 'react';
import { DashboardCard } from './DashboardCard';
import { LightBulbIcon } from '@heroicons/react/24/solid';
import { LightBulbIcon as LightBulbOutline } from '@heroicons/react/24/outline';

interface LightCardProps {
    id: string;
    name: string;
    isOn: boolean;
    brightness?: number;
}

export function LightCard({ id, name, isOn, brightness }: LightCardProps) {
    return (
        <DashboardCard title={name} className={isOn ? 'bg-amber-900/10 border-amber-500/50' : 'opacity-75'}>
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <span className={`text-sm ${isOn ? 'text-amber-500 font-semibold' : 'text-gray-400'}`}>
                        {isOn ? 'On' : 'Off'}
                    </span>
                    {isOn && brightness && (
                        <span className="text-xs text-gray-400 mt-1">Brightness: {Math.round((brightness / 255) * 100)}%</span>
                    )}
                </div>
                <div className={`p-3 rounded-full ${isOn ? 'bg-amber-500/20 text-amber-400 shadow-lg shadow-amber-500/10' : 'bg-gray-700/50 text-gray-500'}`}>
                    {isOn ? <LightBulbIcon className="w-8 h-8" /> : <LightBulbOutline className="w-8 h-8" />}
                </div>
            </div>
        </DashboardCard>
    );
}
