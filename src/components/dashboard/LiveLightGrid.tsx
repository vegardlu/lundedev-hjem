"use client";

import React, { useEffect, useState, useRef } from 'react';
import { LightCard } from './LightCard';
import { getLightsAction } from '@/actions/light-actions';

interface Light {
    id: string;
    name: string;
    isOn: boolean;
    brightness?: number;
    area?: string;
    floor?: string;
    supportedColorModes?: string[];
}

interface LiveLightGridProps {
    initialLights: Light[];
    token: string;
}

export function LiveLightGrid({ initialLights, token }: LiveLightGridProps) {
    const [lights, setLights] = useState<Light[]>(initialLights);
    const [error, setError] = useState<string | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Function to fetch lights
    const fetchLights = async () => {
        try {
            const result = await getLightsAction(token);
            if (result.success && result.data) {
                setLights(result.data);
                setError(null);
            } else {
                console.error("Failed to poll lights:", result.error);
                // Don't show error to user immediately on polling fail to avoid flicker, just log
            }
        } catch (err) {
            console.error("Error polling lights:", err);
        }
    };

    // Set up polling
    useEffect(() => {
        // Initial sync ensures we are fresh if navigating back
        fetchLights();

        intervalRef.current = setInterval(fetchLights, 3000); // Poll every 3 seconds

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [token]);

    // Group Lights by Floor and Area (Logic moved from page.tsx)
    const lightsByFloor = lights.reduce((acc, light) => {
        const floor = light.floor || "Other";
        if (!acc[floor]) acc[floor] = [];
        acc[floor].push(light);
        return acc;
    }, {} as Record<string, Light[]>);

    const sortedFloors = Object.keys(lightsByFloor).sort();

    if (lights.length === 0) {
        return (
            <div className="text-center py-20 text-zinc-600">
                <p>No lights found.</p>
            </div>
        );
    }

    return (
        <section className="space-y-10">
            {sortedFloors.map((floor) => {
                const floorLights = lightsByFloor[floor];
                const lightsByArea = floorLights.reduce((acc, light) => {
                    const area = light.area || "Other";
                    if (!acc[area]) acc[area] = [];
                    acc[area].push(light);
                    return acc;
                }, {} as Record<string, Light[]>);
                const sortedAreas = Object.keys(lightsByArea).sort();

                return (
                    <div key={floor} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-2xl font-light text-zinc-100 mb-6 flex items-center gap-4">
                            {floor}
                            <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sortedAreas.map((area) => (
                                <div key={area} className="bg-zinc-900/20 rounded-2xl p-5 border border-zinc-800/30">
                                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                                        {area}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {lightsByArea[area].map((light) => (
                                            <LightCard
                                                key={light.id}
                                                id={light.id}
                                                name={light.name}
                                                isOn={light.isOn}
                                                brightness={light.brightness}
                                                supportedColorModes={light.supportedColorModes}
                                                token={token}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </section>
    );
}
