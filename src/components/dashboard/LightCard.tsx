"use client";

import React, { useState } from 'react';
import { DashboardCard } from './DashboardCard';
import { LightBulbIcon } from '@heroicons/react/24/solid';
import { LightBulbIcon as LightBulbOutline } from '@heroicons/react/24/outline';
import { LightControlModal } from './LightControlModal';
import { toggleLightAction, updateLightAction } from '@/actions/light-actions';

interface LightCardProps {
    id: string;
    name: string;
    isOn: boolean;
    brightness?: number;
    token: string;
    supportedColorModes?: string[];
}

export function LightCard({ id, name, isOn: initialIsOn, brightness: initialBrightness, token, supportedColorModes }: LightCardProps) {
    const [isOn, setIsOn] = useState(initialIsOn);
    const [brightness, setBrightness] = useState(initialBrightness);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    React.useEffect(() => {
        setIsOn(initialIsOn);
    }, [initialIsOn]);

    React.useEffect(() => {
        setBrightness(initialBrightness);
    }, [initialBrightness]);

    const handleToggle = async (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setIsLoading(true);
        // Optimistic update
        const newState = !isOn;
        setIsOn(newState);

        try {
            const result = await toggleLightAction(id, token);
            if (!result.success) {
                console.error("Action failed", result.error);
                setIsOn(!newState); // Revert
            }
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

            await updateLightAction(id, token, body);
            if (!isOn) setIsOn(true);
        } catch (error) {
            console.error("Failed to update light", error);
        }
    };

    return (
        <>
            <div onClick={() => setIsModalOpen(true)} className="cursor-pointer h-full">
                <DashboardCard title={name} className={`h-full ${isOn ? 'bg-amber-900/10 border-amber-500/30' : 'opacity-60 hover:opacity-100'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className={`text-lg font-semibold ${isOn ? 'text-amber-100' : 'text-zinc-400'}`}>
                                {isOn ? 'On' : 'Off'}
                            </span>
                            {isOn && (
                                <div className="h-1 w-12 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                                    <div className="h-full bg-amber-500" style={{ width: `${Math.round(((brightness || 0) / 255) * 100)}%` }} />
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleToggle}
                            className={`p-2 rounded-full transition-colors ${isOn ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-zinc-700 text-zinc-400'} hover:scale-110 active:scale-95`}
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                            ) : (
                                isOn ? <LightBulbIcon className="w-5 h-5" /> : <LightBulbOutline className="w-5 h-5" />
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
                supportedColorModes={supportedColorModes}
                onToggle={() => handleToggle()}
                onUpdate={handleUpdate}
            />
        </>
    );
}
