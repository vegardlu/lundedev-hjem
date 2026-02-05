"use client";

import React, { useState } from 'react';
import { DashboardCard } from './DashboardCard';
import { LightBulbIcon } from '@heroicons/react/24/solid';
import { LightBulbIcon as LightBulbOutline } from '@heroicons/react/24/outline';
import { LightControlModal } from './LightControlModal';

interface LightCardProps {
    id: string;
    name: string;
    isOn: boolean;
    brightness?: number;
    token: string;
}

export function LightCard({ id, name, isOn: initialIsOn, brightness: initialBrightness, token }: LightCardProps) {
    const [isOn, setIsOn] = useState(initialIsOn);
    const [brightness, setBrightness] = useState(initialBrightness);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

    const handleToggle = async (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setIsLoading(true);
        // Optimistic update
        const newState = !isOn;
        setIsOn(newState);

        try {
            await fetch(`${apiUrl}/api/dashboard/lights/${id}/toggle`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error("Failed to toggle light", error);
            setIsOn(!newState); // Revert
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async (id: string, newBrightness: number, newColor: { r: number, g: number, b: number } | null) => {
        setBrightness(newBrightness);
        try {
            const body: any = { brightness: newBrightness, isOn: true };
            if (newColor) {
                body.color = [newColor.r, newColor.g, newColor.b];
            }

            await fetch(`${apiUrl}/api/dashboard/lights/${id}/state`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            if (!isOn) setIsOn(true);
        } catch (error) {
            console.error("Failed to update light", error);
        }
    };

    return (
        <>
            <div onClick={() => setIsModalOpen(true)} className="cursor-pointer">
                <DashboardCard title={name} className={`${isOn ? 'bg-amber-900/10 border-amber-500/50' : 'opacity-75'} transition-all duration-200 active:scale-95`}>
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className={`text-sm ${isOn ? 'text-amber-500 font-semibold' : 'text-gray-400'}`}>
                                {isOn ? 'On' : 'Off'}
                            </span>
                            {isOn && brightness && (
                                <span className="text-xs text-gray-400 mt-1">Brightness: {Math.round((brightness / 255) * 100)}%</span>
                            )}
                        </div>
                        <button
                            onClick={handleToggle}
                            className={`p-3 rounded-full transition-colors ${isOn ? 'bg-amber-500/20 text-amber-400 shadow-lg shadow-amber-500/10' : 'bg-gray-700/50 text-gray-500'} hover:bg-opacity-80`}
                        >
                            {isLoading ? (
                                <div className="w-8 h-8 rounded-full border-2 border-current border-t-transparent animate-spin" />
                            ) : (
                                isOn ? <LightBulbIcon className="w-8 h-8" /> : <LightBulbOutline className="w-8 h-8" />
                            )}
                        </button>
                    </div>
                </DashboardCard>
            </div>

            <LightControlModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                lightId={id}
                lightName={name}
                initialIsOn={isOn}
                initialBrightness={brightness}
                onToggle={() => handleToggle()} // Modal toggle
                onUpdate={handleUpdate}
            />
        </>
    );
}
